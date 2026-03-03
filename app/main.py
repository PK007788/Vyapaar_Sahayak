from app.database import initialize_database
from app.business_logic import (
    create_user,
    login_user,
    create_customer,
    create_transaction,
    create_invoice
)


def main():
    initialize_database()

    logged_in_user_id = None

    while True:
        print("\n--- Vyapaar Saathi CLI ---")
        print("1. Register")
        print("2. Login")
        print("3. Create Customer")
        print("4. Add Credit")
        print("5. Record Payment")
        print("6. Create Invoice")
        print("7. Exit")

        choice = input("Enter choice: ")

        # ---------------- REGISTER ----------------
        if choice == "1":
            shop = input("Shop Name: ")
            owner = input("Owner Name: ")
            phone = input("Phone: ")
            password = input("Password: ")

            result = create_user(shop, owner, phone, password)
            print(result)

        # ---------------- LOGIN ----------------
        elif choice == "2":
            phone = input("Phone: ")
            password = input("Password: ")

            result = login_user(phone, password)
            print(result)

            if result["status"] == "success":
                logged_in_user_id = result["user_id"]

        # ---------------- CREATE CUSTOMER ----------------
        elif choice == "3":
            if not logged_in_user_id:
                print("Please login first.")
                continue

            name = input("Customer Name: ")
            phone = input("Customer Phone (optional): ").strip()
            phone = phone if phone else None

            result = create_customer(logged_in_user_id, name, phone)
            print(result)

        # ---------------- ADD CREDIT ----------------
        elif choice == "4":
            if not logged_in_user_id:
                print("Please login first.")
                continue

            try:
                customer_id = int(input("Customer ID: "))
                amount = float(input("Amount: "))
            except ValueError:
                print("Invalid numeric input.")
                continue

            desc = input("Description: ")

            result = create_transaction(
                logged_in_user_id,
                customer_id,
                "CREDIT",
                amount,
                desc
            )
            print(result)

        # ---------------- RECORD PAYMENT ----------------
        elif choice == "5":
            if not logged_in_user_id:
                print("Please login first.")
                continue

            try:
                customer_id = int(input("Customer ID: "))
                amount = float(input("Amount: "))
            except ValueError:
                print("Invalid numeric input.")
                continue

            desc = input("Description: ")

            result = create_transaction(
                logged_in_user_id,
                customer_id,
                "PAYMENT",
                amount,
                desc
            )
            print(result)

        # ---------------- CREATE INVOICE ----------------
        elif choice == "6":
            if not logged_in_user_id:
                print("Please login first.")
                continue

            try:
                customer_id = int(input("Customer ID: "))
            except ValueError:
                print("Invalid customer ID.")
                continue

            items = []
            print("Enter invoice items. Type 'done' as item name to finish.")

            while True:
                item_name = input("Item Name: ")

                if item_name.lower() == "done":
                    break

                try:
                    quantity = float(input("Quantity: "))
                    unit_price = float(input("Unit Price: "))
                except ValueError:
                    print("Invalid numeric input. Try again.")
                    continue

                items.append({
                    "item_name": item_name,
                    "quantity": quantity,
                    "unit_price": unit_price
                })

            result = create_invoice(logged_in_user_id, customer_id, items)
            print(result)

        # ---------------- EXIT ----------------
        elif choice == "7":
            print("Exiting...")
            break

        else:
            print("Invalid choice.")


if __name__ == "__main__":
    main()