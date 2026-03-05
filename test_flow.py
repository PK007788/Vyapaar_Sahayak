from app.database import initialize_database
from app.business_logic import get_customer_statement
from app.business_logic import void_invoice
from app.business_logic import get_customers_with_balance

from app.business_logic import (
    create_user,
    create_customer,
    create_invoice,
    create_transaction,
    get_customer_balance,
    get_customer_transactions
)

# Initialize database
initialize_database()

print("\n--- TEST START ---\n")

# 1️⃣ Create User
user = create_user("Sai Kirana Store", "Ramesh", "9999999999", "password123")
print("Create User:", user)

# Login normally returns user_id but for quick testing we assume first user
user_id = 1

# 2️⃣ Create Customer
customer = create_customer(user_id, "Amit", "8888888888")
print("Create Customer:", customer)

customer_id = customer.get("customer_id", 1)

# 3️⃣ Create Invoice
invoice = create_invoice(
    user_id,
    customer_id,
    [
        {"item_name": "Rice", "quantity": 2, "unit_price": 100},
        {"item_name": "Oil", "quantity": 1, "unit_price": 200}
    ]
)

print("Create Invoice:", invoice)

# 4️⃣ Check Balance
balance = get_customer_balance(user_id, customer_id)
print("Balance After Invoice:", balance)

# 5️⃣ Record Payment
payment = create_transaction(
    user_id,
    customer_id,
    "PAYMENT",
    150,
    description="Cash Payment"
)

print("Payment Transaction:", payment)

# 6️⃣ Check Balance Again
balance = get_customer_balance(user_id, customer_id)
print("Balance After Payment:", balance)

# 7️⃣ Show Ledger
transactions = get_customer_transactions(user_id, customer_id)

print("\nLedger Entries:")
for t in transactions:
    print(t)

print("\nCustomer Statement:")

statement = get_customer_statement(user_id, customer_id)

for row in statement:
    print(row)


print("\n--- VOIDING INVOICE ---\n")

void_result = void_invoice(user_id, 1)
print("Void Invoice:", void_result)

balance = get_customer_balance(user_id, customer_id)
print("Balance After Void:", balance)

statement = get_customer_statement(user_id, customer_id)

print("\nUpdated Statement:")
for row in statement:
    print(row)
    

print("\nCustomer List with Balances:\n")
customers = get_customers_with_balance(user_id)
for c in customers:
    print(c)

print("\n--- TEST END ---\n")