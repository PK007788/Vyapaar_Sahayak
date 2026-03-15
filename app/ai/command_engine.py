"""
command_engine.py
─────────────────
Entry point for the AI voice command pipeline.

Flow:
  1. Check if a pending conversation state exists (clarification / invoice).
     → If yes, bypass intent classification and resume the stored flow.
  2. Otherwise, run intent classification and route normally.

Also provides multi-item sentence parsing for complex commands like:
  "Rahul ko 500 ka chawal aur 200 ka tel likh do"
"""

import re
import os
import json
from datetime import datetime
from app.ai.intent_classifier import detect_intent
from app.ai.command_router import route_command
from app.ai.conversation_state import get_state, handle_reply
from app.ai.text_normalizer import normalize_input


# ─────────────────────────────────────────────────────────────────────────────
# FINISH COMMANDS – trigger invoice finalization
# ─────────────────────────────────────────────────────────────────────────────

FINISH_PHRASES = {
    "done", "ho gaya", "ho gya", "bas", "aur nahi", "aur nahin",
    "itna kaafi hai", "itna kafi hai", "bus", "hogaya", "hogya",
    "nahi", "nhi", "khatam", "theek hai", "thik hai",
}


def _is_finish_command(text: str) -> bool:
    """Check if the user's text is a finish command."""
    cleaned = text.strip().lower()
    # Check exact match
    if cleaned in FINISH_PHRASES:
        return True
    # Check if the text starts with or contains a finish phrase
    for phrase in FINISH_PHRASES:
        if cleaned == phrase or cleaned.startswith(phrase + " "):
            return True
    return False


# ─────────────────────────────────────────────────────────────────────────────
# MULTI-ITEM SENTENCE PARSER
# ─────────────────────────────────────────────────────────────────────────────

def parse_multi_items(text: str) -> list:
    """
    Parse a complex command containing multiple items separated by 'aur'.

    Example:
        "500 ka chawal aur 200 ka tel"
        → [{"item_name": "chawal", "value": 500},
           {"item_name": "tel",    "value": 200}]

    Returns a list of dicts. Each dict has:
        - item_name: str
        - quantity: float or int
        - unit: str or None
        - unit_price: float or None
    """
    # Split by 'aur' (and)
    segments = re.split(r'\baur\b', text.lower())
    items = []

    for segment in segments:
        segment = segment.strip()
        if not segment:
            continue

        item = _parse_single_item(segment)
        if item and item.get("item_name"):
            items.append(item)

    return items


def _parse_single_item(segment: str) -> dict:
    """
    Extract item name and value/quantity/unit from a single segment.

    Patterns handled:
        "500 ka chawal"              → {item_name: "chawal", quantity: 1, unit: None, unit_price: 500}
        "chawal 500"                 → {item_name: "chawal", quantity: 1, unit: None, unit_price: 500}
        "500 rupaye chawal"          → {item_name: "chawal", quantity: 1, unit: None, unit_price: 500}
        "2 kilo chawal 50 rupaye"    → {item_name: "chawal", quantity: 2, unit: "kilo", unit_price: 50}
        "2.5 kg chawal 50 rs"        → {item_name: "chawal", quantity: 2.5, unit: "kg", unit_price: 50}
        "chawal"                     → {item_name: "chawal"}
    """
    # Remove common noise words, but keep unit words separate
    noise = {"ka", "ki", "ke", "ko", "rupaye", "rupay", "rs", "wala", "wale",
             "likh", "do", "de", "daal", "likho", "likhna", "likh do", "add", "karo"}
    
    units = {"kilo", "kg", "gram", "g", "liter", "litre", "l", "packet", "piece", "box", "dozen"}

    words = segment.split()
    cleaned_words = []
    
    unit = None
    quantity = None
    price = None

    i = 0
    while i < len(words):
        word = words[i]
        
        # Check for numbers (integer or float)
        if re.match(r'^\d+(\.\d+)?$', word):
            val = float(word) if '.' in word else int(word)
            
            # Check the next word to see if it's a unit (e.g. "2 kilo")
            if i + 1 < len(words) and words[i+1] in units:
                quantity = val
                unit = words[i+1]
                i += 1 # Skip the unit word
            elif price is None:
                # If we haven't seen a unit, and haven't seen a price, assume it's a price
                # We could argue if it's qty or price, but generally "chawal 50" -> price = 50, qty=1
                # If there are two numbers without units, we could assign qty then price.
                if quantity is None:
                    price = val
                else: 
                    # If quantity is already set (e.g. from previous pass), this is price
                    price = val
            elif quantity is None:
                # We saw a price already, this must be quantity
                quantity = val
                
        elif word in units:
            unit = word
            # If quantity wasn't set right before, it's implicitly 1
            if quantity is None:
                quantity = 1
        elif word not in noise:
            cleaned_words.append(word)
            
        i += 1

    item_name = " ".join(cleaned_words).strip()
    
    # Defaults
    if quantity is None and price is not None:
        quantity = 1

    return {
        "item_name": item_name,
        "quantity": quantity,
        "unit": unit,
        "unit_price": price,
        "value": price # For backward compatibility with existing code
    }

# ─────────────────────────────────────────────────────────────────────────────
# HYBRID COMMAND UNDERSTANDING (Rule-based)
# ─────────────────────────────────────────────────────────────────────────────

def _rule_based_intent_fallback(text: str) -> str | None:
    """Return an intent if the text matches specific rules."""
    cleaned = text.lower()
    
    if "invoice" in cleaned or "bill" in cleaned:
        return "Create_Invoice"
    if "udhar" in cleaned or "credit" in cleaned:
        return "Add_Credit"
    if "payment" in cleaned or "diye" in cleaned or "jama" in cleaned:
        return "Record_Payment"
    if "balance" in cleaned or "bakaya" in cleaned:
        return "Check_Balance"
        
    # Product Features
    if "total sales" in cleaned or "aaj ka sales" in cleaned:
        return "View_Sales_Summary"
    if "reminder" in cleaned:
        return "Send_Reminder"
        
    # Smart Suggestions
    if "kaun kaun udhar" in cleaned or "kis par udhar" in cleaned or "kis pe udhar" in cleaned or "pending credit" in cleaned:
        return "List_Pending_Credit"
    if "sabse zyada" in cleaned or "maximum udhar" in cleaned or "sabse jada" in cleaned:
        return "Max_Outstanding_Balance"
        
    return None

# ─────────────────────────────────────────────────────────────────────────────
# COMMAND LOGGING
# ─────────────────────────────────────────────────────────────────────────────

def _log_command(user_text: str, normalized_text: str, predicted_intent: str, confidence_score: float):
    """Log the command to logs/command_history.json for model improvement."""
    try:
        log_dir = "logs"
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, "command_history.json")
        
        entry = {
            "user_text": user_text,
            "normalized_text": normalized_text,
            "predicted_intent": predicted_intent,
            "confidence_score": confidence_score,
            "timestamp": datetime.now().isoformat()
        }
        
        if os.path.exists(log_file):
            with open(log_file, "r") as f:
                logs = json.load(f)
        else:
            logs = []
            
        logs.append(entry)
        
        with open(log_file, "w") as f:
            json.dump(logs, f, indent=2)
            
    except Exception as e:
        print(f"[AI] Failed to log command: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# RESPONSE HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _wrap_response(message: str, continue_listening: bool, **extra) -> dict:
    """Wrap a response in the standardized format."""
    resp = {
        "response": message,
        "continue_listening": continue_listening,
    }
    resp.update(extra)
    return resp


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────

def process_command(text: str, user_id: int):
    """
    Main entry called by the /ai-command endpoint.
    Returns standardized {response, continue_listening, ...} format.
    """

    # ── Debug: log received text ──────────────────────────────────────
    print(f"[AI] Received text: '{text}'")

    # ── Normalise input (Devanagari → Roman, Hindi numbers → digits) ──
    normalized = normalize_input(text)
    print(f"[AI] Normalized text: '{normalized}'")

    # ── Check for pending conversation state ───────────────────────────
    state = get_state(user_id)

    if state and state.get("active"):
        print(f"[AI] Active conversation state: step={state.get('step')}, intent={state.get('intent')}")

        # ── Check for finish command first (if in invoice flow) ────────
        if state.get("step") in ["ask_item", "ask_quantity", "ask_price"]:
            if _is_finish_command(normalized):
                print(f"[AI] Finish command detected: '{normalized}'")
                from app.ai.command_router import finalize_invoice
                return finalize_invoice(user_id, state)

        # ── Route reply to the conversation manager ─────────────────────
        return handle_reply(normalized, user_id, state)

    else:
        print("[AI] No active conversation state")

    # ── 1. Slot extraction & Multi-item detection first ────────────────
    from app.ai.command_engine import parse_multi_items
    multi = parse_multi_items(normalized)
    
    intent = None
    confidence = 1.0

    # ── 2. Multi-item override rule ────────────────────────────────────
    # If items are detected in the command, force intent to Create_Invoice.
    # This overrides Add_Credit rules which only apply when no items exist.
    if multi and len(multi) > 0 and any(m.get("item_name") for m in multi):
        print(f"[AI] Multi-item override triggered: {len(multi)} items detected.")
        intent = "Create_Invoice"
    else:
        # ── 3. Normal flow: hybrid rule-based then classify intent ─────
        intent = _rule_based_intent_fallback(normalized)
        
        if intent:
            print(f"[AI] Rule-based intent matched: {intent}")
        else:
            intent_data = detect_intent(normalized)
            intent = intent_data["intent"]
            confidence = intent_data["confidence"]
            
        # ── 4. Fallback constraint: Cannot be Add_Credit if items exist ──
        if intent == "Add_Credit" and multi and len(multi) > 0 and any(m.get("item_name") for m in multi):
            print(f"[AI] ML returned Add_Credit, but {len(multi)} items detected. Overriding to Create_Invoice.")
            intent = "Create_Invoice"
        
    _log_command(text, normalized, intent, confidence)

    print(f"[AI] Predicted intent: {intent}, confidence: {confidence:.3f}")

    if confidence < 0.35:
        print(f"[AI] Confidence too low ({confidence:.3f} < 0.35), returning fallback")
        return _wrap_response(
            "Mujhe samajh nahi aaya, kya aap dobara bol sakte hain?",
            False,
            intent=intent,
            confidence=confidence,
        )

    print(f"[AI] Routing to intent handler: {intent}")
    result = route_command(intent, normalized, user_id)

    return result


# ── Quick smoke-test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    # Test multi-item parsing
    test = "500 ka chawal aur 200 ka tel"
    items = parse_multi_items(test)
    print(f"parse_multi_items(\"{test}\") = {items}")

    test2 = "chawal 500 aur tel 200 aur daal 150"
    items2 = parse_multi_items(test2)
    print(f"parse_multi_items(\"{test2}\") = {items2}")