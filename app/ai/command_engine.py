from app.ai.command_router import route_command
from app.ai.intent_classifier import detect_intent
from app.ai.command_router import route_command


def process_command(text: str, user_id: int):

    intent_data = detect_intent(text)
    intent = intent_data["intent"]

    result = route_command(intent, text, user_id)

    return {
        "intent": intent,
        "confidence": intent_data["confidence"],
        "result": result
    }

from app.ai.intent_classifier import detect_intent
from app.ai.command_router import route_command


def process_command(text: str, user_id: int):

    intent_data = detect_intent(text)

    intent = intent_data["intent"]
    confidence = intent_data["confidence"]

    # -------------------------
    # CONFIDENCE CHECK
    # -------------------------

    if confidence < 0.35:
        return {
            "status": "uncertain",
            "intent": intent,
            "confidence": confidence,
            "message": "Mujhe samajh nahi aaya, kya aap dobara bol sakte hain?"
        }

    # -------------------------
    # ROUTE COMMAND
    # -------------------------

    result = route_command(intent, text, user_id)

    return {
        "intent": intent,
        "confidence": confidence,
        "result": result
    }

# TEST
if __name__ == "__main__":

    text = "Amit ko 300 udhar likh do"
    user_id = 1

    response = process_command(text, user_id)

    print(response)