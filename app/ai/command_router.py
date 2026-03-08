from app.business_logic import create_transaction, get_customer_statement
from app.ai.entity_extractor import extract_entities


def route_command(intent: str, text: str, user_id: int):
    """
    Routes an AI command to the correct business logic function.
    """

    entities = extract_entities(text, user_id)

    amount = entities.get("amount")
    customer_result = entities.get("customer_result")

    # -------------------------
    # MULTIPLE CUSTOMER MATCHES
    # -------------------------

    if customer_result["type"] == "multiple":

        options = [c["name"] for c in customer_result["customers"]]

        return {
            "status": "clarification_needed",
            "message": "Konse customer?",
            "options": options
        }

    # -------------------------
    # NO CUSTOMER FOUND
    # -------------------------

    if customer_result["type"] == "none":

        return {
            "status": "error",
            "message": "Customer nahi mila."
        }

    # -------------------------
    # SINGLE CUSTOMER
    # -------------------------

    customer = customer_result["customer"]

    # -------------------------
    # ADD CREDIT
    # -------------------------

    if intent == "Add_Credit":

        if amount is None:
            return {
                "status": "error",
                "message": "Kitna amount add karna hai?"
            }

        return create_transaction(
            user_id,
            customer["id"],
            "CREDIT",
            amount,
            description=f"AI credit entry for {customer['name']}"
        )

    # -------------------------
    # RECORD PAYMENT
    # -------------------------

    elif intent == "Record_Payment":

        if amount is None:
            return {
                "status": "error",
                "message": "Kitna payment hua?"
            }

        return create_transaction(
            user_id,
            customer["id"],
            "PAYMENT",
            amount,
            description=f"AI payment entry for {customer['name']}"
        )

    # -------------------------
    # CHECK BALANCE
    # -------------------------

    elif intent == "Check_Balance":

        statement = get_customer_statement(user_id, customer["id"])

        return {
            "status": "success",
            "customer": customer["name"],
            "statement": statement
        }

    # -------------------------
    # FUTURE INTENTS
    # -------------------------

    elif intent == "Create_Invoice":

        return {
            "status": "info",
            "message": "AI invoice creation coming soon."
        }

    elif intent == "Send_Reminder":

        return {
            "status": "info",
            "message": "Reminder system coming soon."
        }

    elif intent == "Update_Inventory":

        return {
            "status": "info",
            "message": "Inventory system coming soon."
        }

    elif intent == "View_Sales_Summary":

        return {
            "status": "info",
            "message": "Sales summary coming soon."
        }

    # -------------------------
    # UNSUPPORTED INTENT
    # -------------------------

    else:

        return {
            "status": "error",
            "message": f"Intent '{intent}' not supported."
        }


# -------------------------
# TEST BLOCK
# -------------------------

if __name__ == "__main__":

    intent = "Add_Credit"
    text = "Amit ko paanch sau udhar likh do"
    user_id = 1

    result = route_command(intent, text, user_id)

    print(result)