"""
command_router.py
─────────────────
Routes classified intents to business-logic functions.

Handles:
 • Normal single-turn commands  (Add_Credit, Record_Payment, Check_Balance)
 • Customer clarification flow  (multiple matches → store state → resume)
 • Multi-step invoice creation   (multi-item loop: item → qty → price → confirm → repeat)
 • Natural Hindi response messages throughout
 • Standardized {response, continue_listening} output format
"""

from app.business_logic import create_transaction, get_customer_statement, create_invoice
from app.ai.entity_extractor import extract_entities, extract_amount, extract_customer
from app.ai.customer_lookup import get_customer_list
from app.ai.conversation_state import get_state, set_state, clear_state


# ─────────────────────────────────────────────────────────────────────────────
# RESPONSE HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _resp(message: str, continue_listening: bool, **extra) -> dict:
    """Build a standardized response dict."""
    r = {"response": message, "continue_listening": continue_listening}
    r.update(extra)
    return r


# ─────────────────────────────────────────────────────────────────────────────
# MAIN ROUTER (called for fresh intents — no pending state)
# ─────────────────────────────────────────────────────────────────────────────

def route_command(intent: str, text: str, user_id: int):
    """
    Routes an AI command to the correct business logic function.
    Returns standardized {response, continue_listening} format.
    """

    entities = extract_entities(text, user_id)

    amount = entities.get("amount")
    customer_result = entities.get("customer_result")

    if not customer_result:
        return _resp(
            "Koi customer nahi mila. Kya aap naam dobara bol sakte hain?",
            True,
            status="error",
        )

    # ── MULTIPLE CUSTOMER MATCHES — ask for clarification ────────────────
    if customer_result["type"] == "multiple":
        options = [c["name"] for c in customer_result["customers"]]

        # Store the pending command so the next reply can resume it
        set_state(user_id, {
            "active": True,
            "intent": intent,
            "step": "resolve_customer",
            "candidates": options,
            "context_data": {
                "amount": amount
            }
        })

        first_name = options[0].split()[0]            # e.g. "Rahul"
        options_str = " ya ".join(options)             # "Rahul Gupta ya Rahul Das"

        return _resp(
            f"Konse {first_name} ki baat kar rahe ho? {options_str}?",
            True,
            status="clarification_needed",
            options=options,
        )

    # ── NO CUSTOMER FOUND ────────────────────────────────────────────────
    if customer_result["type"] == "none":
        return _resp(
            "Koi customer nahi mila. Kya aap naam dobara bol sakte hain?",
            True,
            status="error",
        )

    # ── SINGLE CUSTOMER ──────────────────────────────────────────────────
    customer = customer_result["customer"]

    return _execute_intent(intent, user_id, customer, amount)





# ─────────────────────────────────────────────────────────────────────────────
# INVOICE MULTI-STEP FLOW (multi-item conversational loop)
# ─────────────────────────────────────────────────────────────────────────────

def _start_invoice_flow(user_id: int, customer: dict):
    """Kick off the invoice conversation by asking for the first item name."""

    set_state(user_id, {
        "active": True,
        "intent": "Create_Invoice",
        "step": "ask_item",
        "flow": "invoice",
        "customer_id": customer.get("id") or customer.get("customer_id"),
        "customer_name": customer["name"],
        "current_item": {},
        "items": [],
        "silence_warning_given": False,
    })

    return _resp(
        f"{customer['name']} ke liye invoice shuru karte hain. Kaunsa item add karna hai?",
        True,
        status="invoice_step",
        step="ask_item",
    )


def handle_invoice_step(text: str, user_id: int, state: dict):
    """
    Process the current invoice step and advance to the next one.

    Multi-item loop:
        ask_item → ask_quantity → ask_price → confirm → (loop back to ask_item)

    Finish commands are handled by command_engine.py before reaching here.
    """
    step = state.get("step")
    current_item = state.get("current_item", {})
    items = state.get("items", [])
    customer_name = state.get("customer_name", "")

    # ── Step: ASK ITEM NAME ──────────────────────────────────────────────
    if step == "ask_item":
        item_name = text.strip()
        if not item_name:
            return _resp(
                "Item ka naam batayein.",
                True,
                status="invoice_step",
                step="ask_item",
            )

        # Check if user provided multiple items in one sentence via command_engine
        from app.ai.command_engine import parse_multi_items
        multi = parse_multi_items(text)

        if len(multi) > 1:
            # User said something like "500 ka chawal aur 200 ka tel"
            # Auto-add all items with quantity=1 if value is provided
            for mi in multi:
                if mi.get("item_name") and mi.get("value"):
                    items.append({
                        "item_name": mi["item_name"],
                        "quantity": 1,
                        "unit_price": mi["value"],
                    })

            if items:
                state["items"] = items
                state["current_item"] = {}
                state["step"] = "ask_item"
                set_state(user_id, state)

                summary = ", ".join(
                    f"{it['item_name']} (₹{int(it['unit_price'])})"
                    for it in items
                )
                return _resp(
                    f"{len(items)} items add ho gaye: {summary}. Aur kuch add karna hai? Agar nahi to 'done' ya 'ho gaya' boliye.",
                    True,
                    status="invoice_step",
                    step="ask_item",
                )

        # Single item — store name and ask for quantity
        current_item["item_name"] = item_name
        state["current_item"] = current_item
        state["step"] = "ask_quantity"
        set_state(user_id, state)

        return _resp(
            f"'{item_name}' ki kitni quantity hai?",
            True,
            status="invoice_step",
            step="ask_quantity",
        )

    # ── Step: ASK QUANTITY ────────────────────────────────────────────────
    if step == "ask_quantity":
        qty = extract_amount(text)
        if qty is None or qty <= 0:
            return _resp(
                "Sahi quantity batayein (number mein).",
                True,
                status="invoice_step",
                step="ask_quantity",
            )

        current_item["quantity"] = qty
        state["current_item"] = current_item
        state["step"] = "ask_price"
        set_state(user_id, state)

        return _resp(
            f"Ek {current_item.get('item_name', 'item')} ki price kya hai?",
            True,
            status="invoice_step",
            step="ask_price",
        )

    # ── Step: ASK PRICE ──────────────────────────────────────────────────
    if step == "ask_price":
        price = extract_amount(text)
        if price is None or price <= 0:
            return _resp(
                "Sahi price batayein (number mein).",
                True,
                status="invoice_step",
                step="ask_price",
            )

        current_item["unit_price"] = price
        item_name = current_item.get("item_name", "item")
        qty = current_item.get("quantity", 1)
        total = qty * price

        # Add the completed item to the list
        items.append({
            "item_name": item_name,
            "quantity": qty,
            "unit_price": price,
        })

        state["items"] = items
        state["current_item"] = {}
        state["step"] = "ask_item"
        state["silence_warning_given"] = False
        set_state(user_id, state)

        return _resp(
            f"{item_name} ka {int(qty)} add ho gaya hai (₹{int(total)}). Aage kya add karu? Agar aur nahi to 'done' ya 'ho gaya' boliye.",
            True,
            status="invoice_step",
            step="ask_item",
        )

    # Fallback — shouldn't happen
    clear_state(user_id)
    return _resp(
        "Invoice flow mein kuch gadbad ho gayi. Dobara shuru karein.",
        False,
        status="error",
    )


# ─────────────────────────────────────────────────────────────────────────────
# INVOICE FINALIZATION
# ─────────────────────────────────────────────────────────────────────────────

def finalize_invoice(user_id: int, state: dict):
    """
    Create the invoice with all accumulated items.
    Called when user says a finish command (done, ho gaya, etc.)
    or after silence timeout.
    """
    items = state.get("items", [])
    current_item = state.get("current_item", {})
    customer_id = state.get("customer_id")
    customer_name = state.get("customer_name", "")

    # If there's a partially built item, try to complete it
    if current_item.get("item_name"):
        # If it has at least a name and a price/value, add it
        if current_item.get("unit_price"):
            items.append({
                "item_name": current_item["item_name"],
                "quantity": current_item.get("quantity", 1),
                "unit_price": current_item["unit_price"],
            })

    if not items:
        clear_state(user_id)
        return _resp(
            "Koi item add nahi hua. Invoice nahi ban sakta.",
            False,
            status="error",
        )

    # Build items for create_invoice
    invoice_items = [{
        "item_name": it["item_name"],
        "quantity": it["quantity"],
        "unit_price": it["unit_price"],
    } for it in items]

    total = sum(it["quantity"] * it["unit_price"] for it in items)

    # Clear conversation state before DB call
    clear_state(user_id)

    result = create_invoice(user_id, customer_id, invoice_items)

    if result.get("status") == "success":
        items_summary = ", ".join(
            f"{it['item_name']} ({int(it['quantity'])} x ₹{int(it['unit_price'])})"
            for it in items
        )
        return _resp(
            f"Invoice ban gaya! {customer_name} ke liye — {items_summary}. "
            f"Total: ₹{int(total)}. Invoice number: #{result.get('invoice_number')}",
            False,
            status="success",
            intent="Create_Invoice",
            invoice_number=result.get("invoice_number"),
            total_amount=result.get("total_amount"),
        )
    else:
        return _resp(
            "Invoice banane mein samasya aayi. Dobara try karein.",
            False,
            status="error",
        )


# ─────────────────────────────────────────────────────────────────────────────
# SILENCE HANDLING (called from frontend via backend endpoint)
# ─────────────────────────────────────────────────────────────────────────────

def handle_silence_timeout(user_id: int) -> dict:
    """
    Called when the frontend detects silence during invoice creation.

    First call  → reminder prompt (keep listening)
    Second call → finalize invoice
    """
    state = get_state(user_id)

    if not state or state.get("flow") != "invoice":
        return _resp("", False)

    if not state.get("silence_warning_given"):
        # First silence timeout — give a reminder
        state["silence_warning_given"] = True
        set_state(user_id, state)

        return _resp(
            "Aapko aur kuch add karna hai kya? Agar nahi to 'done' ya 'ho gaya' boliye.",
            True,
            status="silence_warning",
        )
    else:
        # Second silence timeout — finalize
        return finalize_invoice(user_id, state)


# ─────────────────────────────────────────────────────────────────────────────
# INTENT EXECUTION  (shared by normal flow + clarification reply)
# ─────────────────────────────────────────────────────────────────────────────

def _execute_intent(intent: str, user_id: int, customer: dict, amount):
    """
    Execute a single intent for a resolved customer.
    All responses use natural Hindi and standardized format.
    """

    customer_id = customer.get("id") or customer.get("customer_id")
    customer_name = customer["name"]

    # ── ADD CREDIT ───────────────────────────────────────────────────────
    if intent == "Add_Credit":
        if amount is None:
            return _resp(
                "Kitna amount udhar likhna hai? Kripya batayein.",
                True,
                status="error",
            )

        result = create_transaction(
            user_id, customer_id, "CREDIT", amount,
            description=f"Udhar: {customer_name} — ₹{int(amount)}"
        )

        if result.get("status") == "success":
            return _resp(
                f"{customer_name} ke khate mein ₹{int(amount)} udhar likha gaya.",
                False,
                status="success",
                intent=intent,
            )
        return _resp(result.get("message", "Transaction fail ho gayi."), False, status="error")

    # ── RECORD PAYMENT ───────────────────────────────────────────────────
    elif intent == "Record_Payment":
        if amount is None:
            return _resp(
                "Kitna payment hua? Kripya amount batayein.",
                True,
                status="error",
            )

        result = create_transaction(
            user_id, customer_id, "PAYMENT", amount,
            description=f"Payment: {customer_name} — ₹{int(amount)}"
        )

        if result.get("status") == "success":
            return _resp(
                f"{customer_name} ka ₹{int(amount)} payment record ho gaya.",
                False,
                status="success",
                intent=intent,
            )
        return _resp(result.get("message", "Transaction fail ho gayi."), False, status="error")

    # ── CHECK BALANCE ────────────────────────────────────────────────────
    elif intent == "Check_Balance":
        statement = get_customer_statement(user_id, customer_id)

        return _resp(
            f"{customer_name} ka khata dikhaya ja raha hai.",
            False,
            status="success",
            intent=intent,
            customer=customer_name,
            statement=statement,
        )

    # ── CREATE INVOICE (start multi-step) ────────────────────────────────
    elif intent == "Create_Invoice":
        return _start_invoice_flow(user_id, customer)

    # ── FUTURE INTENTS ───────────────────────────────────────────────────
    elif intent == "Send_Reminder":
        return _resp("Reminder system jaldi aa raha hai.", False, status="info")

    elif intent == "Update_Inventory":
        return _resp("Inventory system jaldi aa raha hai.", False, status="info")

    elif intent == "View_Sales_Summary":
        return _resp("Sales summary jaldi aa rahi hai.", False, status="info")

    # ── UNSUPPORTED ──────────────────────────────────────────────────────
    else:
        return _resp(f"'{intent}' abhi support nahi hai.", False, status="error")


# ── Quick smoke-test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    intent = "Add_Credit"
    text = "Amit ko paanch sau udhar likh do"
    user_id = 1
    result = route_command(intent, text, user_id)
    print(result)