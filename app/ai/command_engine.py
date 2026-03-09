"""
command_engine.py
─────────────────
Entry point for the AI voice command pipeline.

Flow:
  1. Check if a pending conversation state exists (clarification / invoice).
     → If yes, bypass intent classification and resume the stored flow.
  2. Otherwise, run intent classification and route normally.
"""

from app.ai.intent_classifier import detect_intent
from app.ai.command_router import route_command, handle_clarification_reply, handle_invoice_step
from app.ai.conversation_state import get_state
from app.ai.text_normalizer import normalize_input


def process_command(text: str, user_id: int):
    """
    Main entry called by the /ai-command endpoint.
    """

    # ── Normalise input (Devanagari → Roman, collapse spaces) ──────────
    normalized = normalize_input(text)

    # ── Check for pending conversation state ───────────────────────────
    state = get_state(user_id)

    if state:
        # ── Invoice multi-step flow ────────────────────────────────────
        if state.get("flow") == "invoice":
            return handle_invoice_step(normalized, user_id, state)

        # ── Clarification reply (user picked a customer name) ──────────
        if state.get("pending_intent"):
            return handle_clarification_reply(normalized, user_id, state)

    # ── Normal flow: classify intent → route ───────────────────────────
    intent_data = detect_intent(normalized)
    intent = intent_data["intent"]
    confidence = intent_data["confidence"]

    if confidence < 0.35:
        return {
            "status": "uncertain",
            "intent": intent,
            "confidence": confidence,
            "message": "Mujhe samajh nahi aaya, kya aap dobara bol sakte hain?"
        }

    result = route_command(intent, normalized, user_id)

    return {
        "intent": intent,
        "confidence": confidence,
        "result": result
    }


# ── Quick smoke-test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    text = "Amit ko 300 udhar likh do"
    user_id = 1
    response = process_command(text, user_id)
    print(response)