import re
from app.ai.customer_lookup import get_customer_list


# -------------------------
# HINDI NUMBER DICTIONARIES
# -------------------------

HINDI_DIGITS = {
    "ek": 1,
    "do": 2,
    "teen": 3,
    "char": 4,
    "paanch": 5,
    "che": 6,
    "chhe": 6,
    "saat": 7,
    "aath": 8,
    "nau": 9,
    "dus": 10
}

TENS = {
    "bees": 20,
    "tees": 30,
    "chalis": 40,
    "pachaas": 50,
    "saath": 60,
    "sattar": 70,
    "assi": 80,
    "nabbe": 90
}

MULTIPLIERS = {
    "sau": 100,
    "hundred": 100,
    "hazaar": 1000,
    "hazar": 1000,
    "thousand": 1000
}


# -------------------------
# AMOUNT EXTRACTION
# -------------------------

def normalize_text(text: str):

    text = text.lower()

    replacements = {
        "account mein": "",
        "account me": "",
        "mein": "",
        "me": "",
        "pe": "",
        "par": "",
        "add kar do": "udhar",
        "daal do": "udhar",
        "chadha do": "udhar",
        "aur likh do": "udhar",
        "jama kar do": "payment",
        "de diya": "payment",
        "de do": "payment"
    }

    for key, value in replacements.items():
        text = text.replace(key, value)

    return text

def extract_amount(text: str):
    """
    Extract numeric amount from text.
    Supports numeric + Hindi numbers.
    """

    # numeric match (500, 1200)
    match = re.search(r"\d+", text)

    if match:
        return int(match.group())

    #  Hindi number parsing

    words = text.lower().split()

    total = 0
    current = 0

    for word in words:

        if word in HINDI_DIGITS:
            current = HINDI_DIGITS[word]

        elif word in TENS:
            current = TENS[word]

        elif word in MULTIPLIERS:

            if current == 0:
                current = 1

            current = current * MULTIPLIERS[word]
            total += current
            current = 0

    total += current

    if total > 0:
        return total

    return None


# -------------------------
# CUSTOMER MATCHING
# -------------------------

def extract_customer(text, customers):

    text = text.lower()

    matches = []

    for customer in customers:

        name = customer["name"].lower()

        # full name match
        if name in text:
            matches.append(customer)
            continue

        # first name match
        first_name = name.split()[0]

        if first_name in text:
            matches.append(customer)

        # last name match
        last_name = name.split()[-1]

        if last_name in text:
            matches.append(customer)

    # -------------------------
    # EXACTLY ONE MATCH
    # -------------------------

    if len(matches) == 1:
        return {
            "type": "single",
            "customer": matches[0]
        }

    # -------------------------
    # MULTIPLE MATCHES
    # -------------------------

    if len(matches) > 1:
        return {
            "type": "multiple",
            "customers": matches
        }

    # -------------------------
    # NO MATCH
    # -------------------------

    return {
        "type": "none"
    }


# -------------------------
# ENTITY PIPELINE
# -------------------------

def extract_entities(text: str, user_id: int):

    text = normalize_text(text)

    customers = get_customer_list(user_id)

    amount = extract_amount(text)

    customer_result = extract_customer(text, customers)

    return {
        "amount": amount,
        "customer_result": customer_result
    }
# -------------------------
# TEST BLOCK
# -------------------------

if __name__ == "__main__":

    user_id = 1

    text = "Amit ko paanch sau udhar likh do"

    entities = extract_entities(text, user_id)

    print(entities)