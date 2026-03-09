"""
command_router.py
─────────────────
Routes classified intents to business-logic functions.

Handles:
 • Normal single-turn commands  (Add_Credit, Record_Payment, Check_Balance)
 • Customer clarification flow  (multiple matches → store state → resume)
 • Multi-step invoice creation   (item → price → quantity → save)
 • Natural Hindi response messages throughout
"""

from app.business_logic import create_transaction, get_customer_statement, create_invoice
from app.ai.entity_extractor import extract_entities, extract_amount, extract_customer
from app.ai.customer_lookup import get_customer_list
from app.ai.conversation_state import get_state, set_state, clear_state


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ROUTER (called for fresh intents — no pending state)
# ─────────────────────────────────────────────────────────────────────────────

def route_command(intent: str, text: str, user_id: int):
    """
    Routes an AI command to the correct business logic function.
    """

    entities = extract_entities(text, user_id)

    amount = entities.get("amount")
    customer_result = entities.get("customer_result")

    # ── MULTIPLE CUSTOMER MATCHES — ask for clarification ────────────────
    if customer_result["type"] == "multiple":
        options = [c["name"] for c in customer_result["customers"]]

        # Store the pending command so the next reply can resume it
        set_state(user_id, {
            "pending_intent": intent,
            "pending_amount": amount,
        })

        first_name = options[0].split()[0]            # e.g. "Rahul"
        options_str = " ya ".join(options)             # "Rahul Gupta ya Rahul Das"

        return {
            "status": "clarification_needed",
            "message": f"Konse {first_name} ki baat kar rahe ho? {options_str}?",
            "options": options,
        }

    # ── NO CUSTOMER FOUND ────────────────────────────────────────────────
    if customer_result["type"] == "none":
        return {
            "status": "error",
            "message": "Koi customer nahi mila. Kya aap naam dobara bol sakte hain?"
        }

    # ── SINGLE CUSTOMER ──────────────────────────────────────────────────
    customer = customer_result["customer"]

    return _execute_intent(intent, user_id, customer, amount)


# ─────────────────────────────────────────────────────────────────────────────
# CLARIFICATION REPLY  (called when pending state exists)
# ─────────────────────────────────────────────────────────────────────────────

def handle_clarification_reply(text: str, user_id: int, state: dict):
    """
    User replied with a customer name after a clarification prompt.
    Skip intent classification, look up the customer directly, and execute
    the stored intent + amount.
    """
    customers = get_customer_list(user_id)
    customer_result = extract_customer(text, customers)

    if customer_result["type"] != "single":
        # Still ambiguous or not found — ask again
        clear_state(user_id)
        return {
            "result": {
                "status": "error",
                "message": "Customer samajh nahi aaya. Kripya poora naam bolein."
            }
        }

    customer = customer_result["customer"]
    intent = state["pending_intent"]
    amount = state.get("pending_amount")

    # Clear the pending state before executing
    clear_state(user_id)

    result = _execute_intent(intent, user_id, customer, amount)

    return {
        "intent": intent,
        "confidence": 1.0,
        "result": result
    }


# ─────────────────────────────────────────────────────────────────────────────
# INVOICE MULTI-STEP FLOW
# ─────────────────────────────────────────────────────────────────────────────

def _start_invoice_flow(user_id: int, customer: dict):
    """Kick off the invoice conversation by asking for the item name."""

    set_state(user_id, {
        "flow": "invoice",
        "step": "item",
        "customer_id": customer.get("id") or customer.get("customer_id"),
        "customer_name": customer["name"],
        "invoice_data": {}
    })

    return {
        "status": "invoice_step",
        "message": "Kaunsa item becha gaya?",
        "step": "item",
    }


def handle_invoice_step(text: str, user_id: int, state: dict):
    """
    Process the current invoice step and advance to the next one.
    Steps: item → price → quantity → create invoice.
    """
    step = state.get("step")
    data = state.get("invoice_data", {})

    # ── Step: ITEM NAME ──────────────────────────────────────────────────
    if step == "item":
        item_name = text.strip()
        if not item_name:
            return {
                "result": {
                    "status": "invoice_step",
                    "message": "Item ka naam batayein.",
                    "step": "item",
                }
            }

        data["item_name"] = item_name
        state["invoice_data"] = data
        state["step"] = "price"
        set_state(user_id, state)

        return {
            "result": {
                "status": "invoice_step",
                "message": "Ek item ki price kya hai?",
                "step": "price",
            }
        }

    # ── Step: UNIT PRICE ─────────────────────────────────────────────────
    if step == "price":
        price = extract_amount(text)
        if price is None or price <= 0:
            return {
                "result": {
                    "status": "invoice_step",
                    "message": "Sahi price batayein (number mein).",
                    "step": "price",
                }
            }

        data["unit_price"] = price
        state["invoice_data"] = data
        state["step"] = "quantity"
        set_state(user_id, state)

        return {
            "result": {
                "status": "invoice_step",
                "message": "Kitni quantity thi?",
                "step": "quantity",
            }
        }

    # ── Step: QUANTITY → CREATE INVOICE ───────────────────────────────────
    if step == "quantity":
        qty = extract_amount(text)
        if qty is None or qty <= 0:
            return {
                "result": {
                    "status": "invoice_step",
                    "message": "Sahi quantity batayein (number mein).",
                    "step": "quantity",
                }
            }

        data["quantity"] = qty
        customer_id = state["customer_id"]
        customer_name = state["customer_name"]

        # Build the item list for create_invoice
        items = [{
            "item_name": data["item_name"],
            "quantity": data["quantity"],
            "unit_price": data["unit_price"],
        }]

        total = data["quantity"] * data["unit_price"]

        # Clear conversation state before DB call
        clear_state(user_id)

        result = create_invoice(user_id, customer_id, items)

        if result.get("status") == "success":
            return {
                "intent": "Create_Invoice",
                "confidence": 1.0,
                "result": {
                    "status": "success",
                    "message": (
                        f"Invoice safalta se ban gaya! "
                        f"{customer_name} ke liye {data['item_name']} — "
                        f"{int(data['quantity'])} x ₹{int(data['unit_price'])} = ₹{int(total)}"
                    ),
                    "invoice_number": result.get("invoice_number"),
                    "total_amount": result.get("total_amount"),
                }
            }
        else:
            return {
                "intent": "Create_Invoice",
                "confidence": 1.0,
                "result": {
                    "status": "error",
                    "message": "Invoice banane mein samasya aayi. Dobara try karein."
                }
            }

    # Fallback — shouldn't happen
    clear_state(user_id)
    return {
        "result": {
            "status": "error",
            "message": "Invoice flow mein kuch gadbad ho gayi. Dobara shuru karein."
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# INTENT EXECUTION  (shared by normal flow + clarification reply)
# ─────────────────────────────────────────────────────────────────────────────

def _execute_intent(intent: str, user_id: int, customer: dict, amount):
    """
    Execute a single intent for a resolved customer.
    All responses use natural Hindi.
    """

    customer_id = customer.get("id") or customer.get("customer_id")
    customer_name = customer["name"]

    # ── ADD CREDIT ───────────────────────────────────────────────────────
    if intent == "Add_Credit":
        if amount is None:
            return {
                "status": "error",
                "message": "Kitna amount udhar likhna hai? Kripya batayein."
            }

        result = create_transaction(
            user_id, customer_id, "CREDIT", amount,
            description=f"Udhar: {customer_name} — ₹{int(amount)}"
        )

        if result.get("status") == "success":
            return {
                "status": "success",
                "message": f"{customer_name} ke khate mein ₹{int(amount)} udhar likha gaya."
            }
        return result

    # ── RECORD PAYMENT ───────────────────────────────────────────────────
    elif intent == "Record_Payment":
        if amount is None:
            return {
                "status": "error",
                "message": "Kitna payment hua? Kripya amount batayein."
            }

        result = create_transaction(
            user_id, customer_id, "PAYMENT", amount,
            description=f"Payment: {customer_name} — ₹{int(amount)}"
        )

        if result.get("status") == "success":
            return {
                "status": "success",
                "message": f"{customer_name} ka ₹{int(amount)} payment record ho gaya."
            }
        return result

    # ── CHECK BALANCE ────────────────────────────────────────────────────
    elif intent == "Check_Balance":
        statement = get_customer_statement(user_id, customer_id)

        return {
            "status": "success",
            "customer": customer_name,
            "message": f"{customer_name} ka khata dikhaya ja raha hai.",
            "statement": statement
        }

    # ── CREATE INVOICE (start multi-step) ────────────────────────────────
    elif intent == "Create_Invoice":
        return _start_invoice_flow(user_id, customer)

    # ── FUTURE INTENTS ───────────────────────────────────────────────────
    elif intent == "Send_Reminder":
        return {"status": "info", "message": "Reminder system jaldi aa raha hai."}

    elif intent == "Update_Inventory":
        return {"status": "info", "message": "Inventory system jaldi aa raha hai."}

    elif intent == "View_Sales_Summary":
        return {"status": "info", "message": "Sales summary jaldi aa rahi hai."}

    # ── UNSUPPORTED ──────────────────────────────────────────────────────
    else:
        return {
            "status": "error",
            "message": f"'{intent}' abhi support nahi hai."
        }


# ── Quick smoke-test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    intent = "Add_Credit"
    text = "Amit ko paanch sau udhar likh do"
    user_id = 1
    result = route_command(intent, text, user_id)
    print(result)