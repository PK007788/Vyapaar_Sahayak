import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "vyapaar.db"


def get_connection():
    """
    Creates and returns a database connection.
    Foreign keys are enforced.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def initialize_database():
    """
    Creates required tables if they do not exist.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # USERS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_name TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            next_invoice_number INTEGER NOT NULL DEFAULT 1
        )
    """)

    # CUSTOMERS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            current_balance REAL NOT NULL DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    # INVOICES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            customer_id INTEGER NOT NULL,
            invoice_number INTEGER NOT NULL,
            total_amount REAL NOT NULL CHECK (total_amount >= 0),
            status TEXT NOT NULL DEFAULT 'ISSUED'
                CHECK (status IN ('ISSUED', 'VOID')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(customer_id) REFERENCES customers(id),
            UNIQUE(user_id, invoice_number)
        )
    """)

    # TRANSACTIONS (UPDATED)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            customer_id INTEGER NOT NULL,
            invoice_id INTEGER NULL,
            type TEXT NOT NULL CHECK (type IN ('CREDIT', 'PAYMENT', 'ADJUSTMENT')),
            amount REAL NOT NULL CHECK (amount > 0),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(customer_id) REFERENCES customers(id),
            FOREIGN KEY(invoice_id) REFERENCES invoices(id)
        )
    """)

    # INVOICE ITEMS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            quantity REAL NOT NULL CHECK (quantity > 0),
            unit_price REAL NOT NULL CHECK (unit_price >= 0),
            line_total REAL NOT NULL CHECK (line_total >= 0),
            FOREIGN KEY(invoice_id) REFERENCES invoices(id)
        )
    """)

    conn.commit()
    conn.close()