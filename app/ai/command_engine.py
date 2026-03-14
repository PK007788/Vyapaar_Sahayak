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
        - value: int or None (the price / amount mentioned)
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
    Extract item name and value from a single segment.

    Patterns handled:
        "500 ka chawal"     → {item_name: "chawal", value: 500}
        "chawal 500"        → {item_name: "chawal", value: 500}
        "500 rupaye chawal" → {item_name: "chawal", value: 500}
        "chawal"            → {item_name: "chawal", value: None}
    """
    # Remove common noise words
    noise = {"ka", "ki", "ke", "ko", "rupaye", "rupay", "rs", "wala", "wale",
             "likh", "do", "de", "daal", "likho", "likhna", "likh do"}
    words = segment.split()
    cleaned_words = []
    value = None

    for word in words:
        # Check if it's a number
        if re.match(r'^\d+$', word):
            value = int(word)
        elif word not in noise:
            cleaned_words.append(word)

    item_name = " ".join(cleaned_words).strip()

    return {
        "item_name": item_name,
        "value": value,
    }


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

    # ── Normal flow: classify intent → route ───────────────────────────
    intent_data = detect_intent(normalized)
    intent = intent_data["intent"]
    confidence = intent_data["confidence"]

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