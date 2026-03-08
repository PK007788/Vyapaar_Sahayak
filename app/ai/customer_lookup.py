from app.database import get_connection


def get_customer_list(user_id):
    """
    Returns a list of customers for the given shop.
    """

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name
        FROM customers
        WHERE user_id = ?
        AND is_active = 1
    """, (user_id,))

    rows = cursor.fetchall()

    conn.close()

    customers = []

    for row in rows:
        customers.append({
            "id": row["id"],
            "name": row["name"]
        })

    return customers


# TEST BLOCK
if __name__ == "__main__":
    customers = get_customer_list(1)
    print(customers)