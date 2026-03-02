from app.database import get_connection
from app.security import hash_password
import sqlite3


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

from app.security import verify_password


def login_user(phone, raw_password):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE phone = ?", (phone,))
    user = cursor.fetchone() # fetchone() returns a single row or None if no matching record is found. This is ideal for login where we expect either one user or none. If we used fetchall(), it would return a list of rows, which would be less efficient and require additional handling to check if we got exactly one user.

    if not user:
        conn.close()
        return {
            "status": "error",
            "message": "Invalid credentials."
        }

    if not verify_password(raw_password, user["password_hash"]):
        conn.close()
        return {
            "status": "error",
            "message": "Invalid credentials."
        }

    conn.close()
    return {
        "status": "success",
        "message": "Login successful.",
        "user_id": user["id"],
        "shop_name": user["shop_name"]
    }


def create_customer(user_id, name, phone=None):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        #  Validate user exists and is active
        cursor.execute("SELECT id, is_active FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()

        if not user:
            return {
                "status": "error",
                "message": "User not found."
            }

        if not user["is_active"]:
            return {
                "status": "error",
                "message": "User account is deactivated."
            }

        #  Validate name
        name = name.strip()
        if not name:
            return {
                "status": "error",
                "message": "Customer name cannot be empty."
            }

        # Optional phone duplicate check (clean UX)
        if phone:
            cursor.execute("""
                SELECT id FROM customers
                WHERE user_id = ? AND phone = ?
            """, (user_id, phone))

            existing = cursor.fetchone()
            if existing:
                return {
                    "status": "error",
                    "message": "A customer with this phone number already exists."
                }

        #  Insert customer
        cursor.execute("""
            INSERT INTO customers (user_id, name, phone)
            VALUES (?, ?, ?)
        """, (user_id, name, phone))

        conn.commit()

        return {
            "status": "success",
            "message": "Customer created successfully."
        }

    except sqlite3.IntegrityError:
        return {
            "status": "error",
            "message": "Customer creation failed due to duplicate data."
        }

    finally:
        conn.close()