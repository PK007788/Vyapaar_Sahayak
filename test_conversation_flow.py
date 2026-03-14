"""
test_conversation_flow.py
─────────────────────────
End-to-end tests for the conversational command pipeline.
Runs directly against the backend functions (no HTTP server needed).

Updated to match the new response format: {response, continue_listening, status}
and the new invoice flow: item -> quantity -> price -> confirm -> loop.
"""

import sys
import os

# Ensure the project root is on the path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import initialize_database, get_connection
from app.business_logic import create_user, create_customer
from app.ai.entity_extractor import extract_customer, extract_amount
from app.ai.text_normalizer import normalize_input
from app.ai.conversation_state import get_state, set_state, clear_state
from app.ai.command_router import route_command, handle_invoice_step, finalize_invoice
from app.ai.conversation_state import handle_reply
from app.ai.hindi_number_parser import replace_hindi_numbers

# --- Setup ---

initialize_database()

# Create a test user if needed
conn = get_connection()
cursor = conn.cursor()
cursor.execute("SELECT id FROM users WHERE phone = '0000000000'")
user = cursor.fetchone()

if not user:
    result = create_user("Test Shop", "Test Owner", "0000000000", "test123")
    conn2 = get_connection()
    c2 = conn2.cursor()
    c2.execute("SELECT id FROM users WHERE phone = '0000000000'")
    user = c2.fetchone()
    conn2.close()

USER_ID = user["id"]
conn.close()

# Create test customers: Rahul Gupta, Rahul Das, Amit Sharma
for name in ["Rahul Gupta", "Rahul Das", "Amit Sharma"]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM customers WHERE user_id = ? AND name = ?",
        (USER_ID, name)
    )
    if not cursor.fetchone():
        create_customer(USER_ID, name)
    conn.close()

# --- Helpers ---

PASS = 0
FAIL = 0

def check(test_name, condition):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  PASS  {test_name}")
    else:
        FAIL += 1
        print(f"  FAIL  {test_name}")


# --- Test 1: Duplicate name clarification ---

print("\n--- TEST 1: Duplicate name clarification ---")

from app.ai.customer_lookup import get_customer_list
customers = get_customer_list(USER_ID)

result = extract_customer("rahul ko 500 do", customers)
check("Ambiguous 'rahul' returns 'multiple'", result["type"] == "multiple")
check("Multiple matches include 2 Rahuls", len(result["customers"]) >= 2)

result2 = extract_customer("amit ko 300 do", customers)
check("Unambiguous 'amit' returns 'single'", result2["type"] == "single")


# --- Test 2: Conversation state memory ---

print("\n--- TEST 2: Conversation state memory ---")

# Make sure no leftover state
clear_state(USER_ID)

# Simulate: user says "rahul ko 200 daal do" -> clarification needed
route_result = route_command("Add_Credit", "rahul ko 200 daal do", USER_ID)
check("Route returns clarification_needed", route_result.get("status") == "clarification_needed")
check("Options contain Rahul Gupta", "Rahul Gupta" in route_result.get("options", []))

state = get_state(USER_ID)
check("State stored with intent", state is not None and state.get("intent") == "Add_Credit")
check("State stored with amount = 200", state is not None and state.get("context_data", {}).get("amount") == 200)

# Simulate: user replies "Rahul Gupta"
assert state is not None, "State should not be None after clarification"
reply_result = handle_reply("Rahul Gupta", USER_ID, state)
check("Clarification reply succeeds", reply_result.get("status") == "success")
check("State cleared after execution", get_state(USER_ID) is None)


# --- Test 3: Invoice creation flow (multi-item) ---

print("\n--- TEST 3: Invoice creation flow (multi-item) ---")

clear_state(USER_ID)

# Step 0: Start invoice -> should ask for item
invoice_start = route_command("Create_Invoice", "amit ke naam invoice bana do", USER_ID)
check("Invoice start returns invoice_step", invoice_start.get("status") == "invoice_step")
check("Invoice start has response text", bool(invoice_start.get("response", "")))
check("Invoice start has continue_listening=True", invoice_start.get("continue_listening") == True)

state = get_state(USER_ID)
check("State stored with flow=invoice", state is not None and state.get("flow") == "invoice")
check("State step is ask_item", state is not None and state.get("step") == "ask_item")

# Step 1: User says "Chawal" (item name)
assert state is not None, "State should not be None"
step1 = handle_invoice_step("Chawal", USER_ID, state)
check("Step 1 asks for quantity", "quantity" in step1.get("response", "").lower())

state = get_state(USER_ID)

# Step 2: User says "10" (quantity)
assert state is not None, "State should not be None"
step2 = handle_invoice_step("10", USER_ID, state)
check("Step 2 asks for price", "price" in step2.get("response", "").lower())

state = get_state(USER_ID)

# Step 3: User says "50" (price) -> item confirmed, asks for more
assert state is not None, "State should not be None"
step3 = handle_invoice_step("50", USER_ID, state)
check("Step 3 confirms item and asks for more", "add" in step3.get("response", "").lower() or "ho gaya" in step3.get("response", "").lower())
check("Step 3 has continue_listening=True", step3.get("continue_listening") == True)

state = get_state(USER_ID)
assert state is not None, "State should not be None"
check("1 item in state after first item", len(state.get("items", [])) == 1)

# Step 4: Add another item - "Tel"
assert state is not None, "State should not be None"
step4 = handle_invoice_step("Tel", USER_ID, state)
check("Step 4 asks for quantity of Tel", "quantity" in step4.get("response", "").lower())

state = get_state(USER_ID)

assert state is not None, "State should not be None"
step5 = handle_invoice_step("5", USER_ID, state)
state = get_state(USER_ID)
assert state is not None, "State should not be None"
step6 = handle_invoice_step("200", USER_ID, state)
check("Step 6 confirms second item", "tel" in step6.get("response", "").lower())

state = get_state(USER_ID)
assert state is not None, "State should not be None"
check("2 items in state after second item", len(state.get("items", [])) == 2)

# Finalize invoice
assert state is not None, "State should not be None"
final = finalize_invoice(USER_ID, state)
check("Invoice finalized successfully", final.get("status") == "success")
check("Invoice has total amount", "total" in final.get("response", "").lower() or final.get("total_amount") is not None)
check("State cleared after invoice", get_state(USER_ID) is None)


# --- Test 4: Hindi conversational responses ---

print("\n--- TEST 4: Hindi responses ---")

clear_state(USER_ID)

result = route_command("Add_Credit", "amit ko 100 udhar likh do", USER_ID)
msg = result.get("response", "")
check("Credit response is Hindi", "udhar" in msg.lower() or "khate" in msg.lower())

result2 = route_command("Record_Payment", "amit ne 50 diye", USER_ID)
msg2 = result2.get("response", "")
check("Payment response is Hindi", "payment" in msg2.lower() or "record" in msg2.lower())


# --- Test 5: Fuzzy matching ---

print("\n--- TEST 5: Fuzzy matching (RapidFuzz) ---")

result = extract_customer("rahool guptha ko do", customers)
check("Fuzzy 'rahool guptha' matches a customer", result["type"] in ("single", "multiple"))

result2 = extract_customer("amitt sharma ko do", customers)
check("Fuzzy 'amitt sharma' matches", result2["type"] in ("single", "multiple"))


# --- Test 6: Hindi speech normalization ---

print("\n--- TEST 6: Hindi speech normalization ---")

normalized = normalize_input("Rahul ne 200 diye")
check("Already-roman text passes through", "rahul" in normalized.lower())

# Number replacement tests
check("'do' preserved when standalone", replace_hindi_numbers("likh do") == "likh do")
check("'do hazaar' converted to 2000", replace_hindi_numbers("do hazaar") == "2000")
check("'paanch sau' converted to 500", replace_hindi_numbers("paanch sau") == "500")
check("'pachaas' converted to 50", replace_hindi_numbers("pachaas") == "50")


# --- Test 7: Finish command detection ---

print("\n--- TEST 7: Finish command detection ---")

from app.ai.command_engine import _is_finish_command

check("'done' is finish command", _is_finish_command("done"))
check("'ho gaya' is finish command", _is_finish_command("ho gaya"))
check("'bas' is finish command", _is_finish_command("bas"))
check("'aur nahi' is finish command", _is_finish_command("aur nahi"))
check("'itna kaafi hai' is finish command", _is_finish_command("itna kaafi hai"))
check("'chawal' is NOT finish command", not _is_finish_command("chawal"))

# --- Summary ---

print(f"\n{'=' * 50}")
print(f"Results: {PASS} passed, {FAIL} failed out of {PASS + FAIL} tests")
print(f"{'=' * 50}\n")

if FAIL > 0:
    sys.exit(1)
