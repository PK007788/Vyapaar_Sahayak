from app.database import get_connection
from app.security import hash_password, verify_password
import sqlite3


# ---------------------------------------------------
# USER REGISTRATION
# ---------------------------------------------------
def create_user(shop_name, owner_name, phone, raw_password):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        hashed_password = hash_password(raw_password)

        cursor.execute("""
            INSERT INTO users (shop_name, owner_name, phone, password_hash)
            VALUES (?, ?, ?, ?)
        """, (shop_name, owner_name, phone, hashed_password))

        conn.commit()

        return {
            "status": "success",
            "message": "User registered successfully."
        }

    except sqlite3.IntegrityError:
        return {
            "status": "error",
            "message": "An account with this phone number already exists."
        }

    finally:
        conn.close()


# ---------------------------------------------------
# USER LOGIN
# ---------------------------------------------------
def login_user(phone, raw_password):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return {"status": "error", "message": "Invalid credentials."}

    if not verify_password(raw_password, user["password_hash"]):
        conn.close()
        return {"status": "error", "message": "Invalid credentials."}

    if not user["is_active"]:
        conn.close()
        return {"status": "error", "message": "Account is deactivated."}

    conn.close()

    return {
        "status": "success",
        "message": "Login successful.",
        "user_id": user["id"],
        "shop_name": user["shop_name"]
    }


# ---------------------------------------------------
# CUSTOMER CREATION
# ---------------------------------------------------
def create_customer(user_id, name, phone=None):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, is_active FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user:
            return {"status": "error", "message": "User not found."}

        if not user["is_active"]:
            return {"status": "error", "message": "User account is deactivated."}

        name = name.strip()
        if not name:
            return {"status": "error", "message": "Customer name cannot be empty."}

        if phone:
            cursor.execute("""
                SELECT id FROM customers
                WHERE user_id = ? AND phone = ?
            """, (user_id, phone))

            if cursor.fetchone():
                return {
                    "status": "error",
                    "message": "A customer with this phone number already exists."
                }

        cursor.execute("""
            INSERT INTO customers (user_id, name, phone)
            VALUES (?, ?, ?)
        """, (user_id, name, phone))

        conn.commit()
        customer_id = cursor.lastrowid

        return {
            "status": "success",
            "message": "Customer created successfully.",
            "customer_id": customer_id
        }

    except sqlite3.IntegrityError:
        return {
            "status": "error",
            "message": "Customer creation failed due to duplicate data."
        }

    finally:
        conn.close()


# ---------------------------------------------------
# CENTRALIZED LEDGER TRANSACTION
# ---------------------------------------------------
def create_transaction(user_id, customer_id, txn_type, amount,
                       description=None, invoice_id=None, conn=None):
    """
    Central financial mutation function.

    If conn is provided → uses existing transaction boundary.
    If not → creates standalone atomic transaction.
    """

    external_conn = conn is not None

    if not external_conn:
        conn = get_connection()

    cursor = conn.cursor()

    try:
        # Validate user
        cursor.execute("SELECT id, is_active FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user:
            return {"status": "error", "message": "User not found."}

        if not user["is_active"]:
            return {"status": "error", "message": "User account is deactivated."}

        # Validate customer ownership
        cursor.execute("""
            SELECT id FROM customers
            WHERE id = ? AND user_id = ? AND is_active = 1
        """, (customer_id, user_id))

        if not cursor.fetchone():
            return {"status": "error", "message": "Customer not found."}

        # Validate amount
        if amount <= 0:
            return {"status": "error", "message": "Amount must be positive."}

        allowed_types = {"CREDIT", "PAYMENT", "ADJUSTMENT"}
        if txn_type not in allowed_types:
            return {"status": "error", "message": "Invalid transaction type."}

        if not external_conn:
            conn.execute("BEGIN")

        # Insert ledger entry
        cursor.execute("""
            INSERT INTO transactions
            (user_id, customer_id, invoice_id, type, amount, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, customer_id, invoice_id, txn_type, amount, description))

        # Balance mutation
        if txn_type == "CREDIT":
            cursor.execute("""
                UPDATE customers
                SET current_balance = current_balance + ?
                WHERE id = ?
            """, (amount, customer_id))

        elif txn_type == "PAYMENT":
            cursor.execute("""
                UPDATE customers
                SET current_balance = current_balance - ?
                WHERE id = ?
            """, (amount, customer_id))

        elif txn_type == "ADJUSTMENT":
            cursor.execute("""
                UPDATE customers
                SET current_balance = current_balance + ?
                WHERE id = ?
            """, (amount, customer_id))

        if not external_conn:
            conn.commit()

        return {"status": "success", "message": "Transaction recorded successfully."}

    except Exception as e:
        if not external_conn:
            conn.rollback()
        print("DEBUG ERROR:", e)
        return {"status": "error", "message": "Transaction failed."}

    finally:
        if not external_conn:
            conn.close()


# ---------------------------------------------------
# INVOICE CREATION
# ---------------------------------------------------
def create_invoice(user_id, customer_id, items):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, is_active, next_invoice_number
            FROM users WHERE id = ?
        """, (user_id,))
        user = cursor.fetchone()

        if not user:
            return {"status": "error", "message": "User not found."}

        if not user["is_active"]:
            return {"status": "error", "message": "User account is deactivated."}

        cursor.execute("""
            SELECT id FROM customers
            WHERE id = ? AND user_id = ? AND is_active = 1
        """, (customer_id, user_id))

        if not cursor.fetchone():
            return {"status": "error", "message": "Customer not found."}

        if not items or not isinstance(items, list):
            return {"status": "error", "message": "Invoice must contain items."}

        total_amount = 0

        for item in items:
            name = item.get("item_name", "").strip()
            qty = item.get("quantity")
            price = item.get("unit_price")

            if not name or qty <= 0 or price < 0:
                return {"status": "error", "message": "Invalid item data."}

            total_amount += qty * price

        conn.execute("BEGIN")

        invoice_number = user["next_invoice_number"]

        cursor.execute("""
            UPDATE users
            SET next_invoice_number = next_invoice_number + 1
            WHERE id = ?
        """, (user_id,))

        cursor.execute("""
            INSERT INTO invoices
            (user_id, customer_id, invoice_number, total_amount)
            VALUES (?, ?, ?, ?)
        """, (user_id, customer_id, invoice_number, total_amount))

        invoice_id = cursor.lastrowid

        for item in items:
            line_total = item["quantity"] * item["unit_price"]

            cursor.execute("""
                INSERT INTO invoice_items
                (invoice_id, item_name, quantity, unit_price, line_total)
                VALUES (?, ?, ?, ?, ?)
            """, (
                invoice_id,
                item["item_name"],
                item["quantity"],
                item["unit_price"],
                line_total
            ))

        # Central ledger call
        txn_result = create_transaction(
            user_id=user_id,
            customer_id=customer_id,
            txn_type="CREDIT",
            amount=total_amount,
            description=f"Invoice #{invoice_number}",
            invoice_id=invoice_id,
            conn=conn
        )

        if txn_result["status"] != "success":
            raise Exception("Ledger creation failed")

        conn.commit()

        return {
            "status": "success",
            "invoice_number": invoice_number,
            "total_amount": total_amount
        }

    except Exception as e:
        conn.rollback()
        print("DEBUG ERROR:", e)
        return {"status": "error", "message": "Invoice creation failed."}

    finally:
        conn.close()