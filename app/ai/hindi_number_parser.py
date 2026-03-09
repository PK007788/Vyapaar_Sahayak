"""
hindi_number_parser.py
──────────────────────
Converts Hindi spoken numbers (Hinglish) into integer values.

Examples:
    parse_hindi_number("paanch sau")       → 500
    parse_hindi_number("teen sau")         → 300
    parse_hindi_number("do hazaar")        → 2000
    parse_hindi_number("do hazaar teen sau") → 2300
"""


# ─────────────────────────────────────────────────────────────────────────────
# DICTIONARIES
# ─────────────────────────────────────────────────────────────────────────────

NUMBERS = {
    "ek": 1, "do": 2, "teen": 3, "chaar": 4, "char": 4,
    "paanch": 5, "panch": 5,
    "che": 6, "chhe": 6,
    "saat": 7, "aath": 8, "nau": 9, "das": 10, "dus": 10,
}

TENS = {
    "bees": 20, "tees": 30, "chalis": 40, "pachaas": 50,
    "saath": 60, "sattar": 70, "assi": 80, "nabbe": 90,
}

MULTIPLIERS = {
    "sau": 100, "hundred": 100,
    "hazaar": 1000, "hazar": 1000, "thousand": 1000,
}


# ─────────────────────────────────────────────────────────────────────────────
# PARSER
# ─────────────────────────────────────────────────────────────────────────────

def parse_hindi_number(text: str):
    """
    Parse a Hindi spoken number phrase and return an integer.

    Algorithm:
      1. Tokenize the text.
      2. Walk each token — if it's a base number, store it as 'current'.
      3. If it's a multiplier, multiply current × multiplier, add to total,
         reset current.
      4. After all tokens, add any remaining current to total.

    Returns an int if a valid number was found, otherwise None.

    Examples:
        >>> parse_hindi_number("paanch sau")
        500
        >>> parse_hindi_number("do hazaar teen sau")
        2300
        >>> parse_hindi_number("hello world")
        None
    """
    words = text.lower().split()
    total = 0
    current = 0

    for word in words:
        if word in NUMBERS:
            current = NUMBERS[word]
        elif word in TENS:
            current = TENS[word]
        elif word in MULTIPLIERS:
            if current == 0:
                current = 1          # "sau" alone → 100
            current = current * MULTIPLIERS[word]
            total += current
            current = 0

    total += current
    return total if total > 0 else None


# ─────────────────────────────────────────────────────────────────────────────
# QUICK SMOKE-TEST
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    tests = [
        ("paanch sau", 500),
        ("teen sau", 300),
        ("do hazaar", 2000),
        ("do hazaar teen sau", 2300),
        ("ek hazaar paanch sau", 1500),
        ("sau", 100),
        ("hello world", None),
    ]

    for text, expected in tests:
        result = parse_hindi_number(text)
        status = "✅" if result == expected else "❌"
        print(f"  {status}  parse_hindi_number(\"{text}\") = {result}  (expected {expected})")
