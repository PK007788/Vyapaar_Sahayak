"""
conversation_state.py
─────────────────────
Handles active conversation states for multi-turn flows (clarification, invoice).
Persists context dynamically across requests.
"""

from typing import Optional

# In-memory store  {user_id: {…state…}}
_states: dict[int, dict] = {}


def get_state(user_id: int) -> Optional[dict]:
    """Return the current conversation state for *user_id*, or None if not active."""
    state = _states.get(user_id)
    if state and state.get("active"):
        return state
    return None


def set_state(user_id: int, state: dict) -> None:
    """Store / overwrite conversation state for *user_id*."""
    if "active" not in state:
        state["active"] = True
    _states[user_id] = state


def clear_state(user_id: int) -> None:
    """Deactivate conversation state for *user_id*."""
    if user_id in _states:
        _states[user_id]["active"] = False


def handle_reply(text: str, user_id: int, state: dict):
    """
    Route an active conversation reply to its corresponding handler.
    If the active step is 'resolve_customer', it handles it directly.
    For invoice flows, it imports 'handle_invoice_step'.
    """
    step = state.get("step")
    
    # ── CUSTOMER DISAMBIGUATION ───────────────────────────────────
    if step == "resolve_customer":
        candidates = state.get("candidates", [])
        
        # 1. Normalize the text
        from app.ai.text_normalizer import normalize_input
        normalized_text = normalize_input(text).lower()
        
        # 2. Try to find an exact or fuzzy match among the candidates
        matched_candidate = None
        for cand in candidates:
            if cand.lower() in normalized_text or normalized_text in cand.lower():
                matched_candidate = cand
                break
                
        if not matched_candidate:
            from rapidfuzz import fuzz
            FUZZY_THRESHOLD = 75
            for cand in candidates:
                score = fuzz.partial_ratio(cand.lower(), normalized_text)
                if score >= FUZZY_THRESHOLD:
                    matched_candidate = cand
                    break

        if not matched_candidate:
            return {
                "response": "Mujhe samajh nahi aaya. Kripya unme se ek naam batayein.",
                "continue_listening": True,
                "status": "clarification_needed",
                "options": candidates
            }

        # 3. Candidate resolved! Now execute the original intent
        from app.ai.customer_lookup import get_customer_list
        from app.ai.command_router import _execute_intent
        
        customers = get_customer_list(user_id)
        resolved_customer = next((c for c in customers if c["name"].lower() == matched_candidate.lower()), None)
        
        if not resolved_customer:
            clear_state(user_id)
            return {"response": "System error: customer match failure.", "continue_listening": False, "status": "error"}

        # 4. Clear the state and execute original intent
        intent = state.get("intent", "")
        amount = state.get("context_data", {}).get("amount")
        
        clear_state(user_id)
        
        return _execute_intent(intent, user_id, resolved_customer, amount)

    # ── INVOICE FLOW ─────────────────────────────────────────────
    if step in ["ask_item", "ask_quantity", "ask_price"]:
        from app.ai.command_router import handle_invoice_step
        return handle_invoice_step(text, user_id, state)
        
    # Unhandled state
    clear_state(user_id)
    return {
        "response": "Conversation context error.", 
        "continue_listening": False, 
        "status": "error"
    }
