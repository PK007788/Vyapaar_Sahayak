import re
from app.ai.customer_lookup import get_customer_list
from app.ai.text_normalizer import normalize_input
from app.ai.hindi_number_parser import parse_hindi_number
from rapidfuzz import fuzz


# ─────────────────────────────────────────────────────────────────────────────
# HINDI GRAMMAR STOP-WORDS
# Removed from the text before name matching so postpositions like "ne", "ko"
# don't break substring / token checks.
# ─────────────────────────────────────────────────────────────────────────────

STOP_WORDS = {
    "ne", "ko", "se", "ke", "ki", "ka", "liye", "tha", "thi", "the",
    "hai", "hain", "ho", "hoga", "hua", "huaa", "di", "diya", "diye",
    "de", "do", "lo", "le", "aur", "bhi", "par", "pe", "mein", "me",
    "wala", "wale", "wali", "ya", "aur", "ek", "yeh", "wo", "woh",
    "please", "jaldi", "abhi",
}

# Threshold for fuzzy matching (0–100). Lower = more lenient.
FUZZY_THRESHOLD = 78


# ─────────────────────────────────────────────────────────────────────────────
# TEXT NORMALISATION  (existing – kept for amount extraction)
# ─────────────────────────────────────────────────────────────────────────────

def normalize_text(text: str) -> str:
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
        "de do": "payment",
    }

    for key, value in replacements.items():
        text = text.replace(key, value)

    return text


# ─────────────────────────────────────────────────────────────────────────────
# TEXT CLEANING
# Strips grammar stop-words so name tokens are not interrupted.
# ─────────────────────────────────────────────────────────────────────────────

def clean_text(text: str) -> str:
    """
    Remove Hindi postpositions / grammar tokens from the text.

    Example:
        "rahul gupta ne 500 rupaye diye the"
        → "rahul gupta 500 rupaye diye"
    """
    words = text.lower().split()
    words = [w for w in words if w not in STOP_WORDS]
    return " ".join(words)


# ─────────────────────────────────────────────────────────────────────────────
# AMOUNT EXTRACTION
# Uses digits first, then falls back to hindi_number_parser.
# ─────────────────────────────────────────────────────────────────────────────

def extract_amount(text: str):
    """
    Extract numeric amount from text.

    Priority:
      1. Digit sequences (500, 1200, …)
      2. Hindi spoken numbers via hindi_number_parser (paanch sau → 500)
    """
    # Try digits first
    match = re.search(r"\d+", text)
    if match:
        return int(match.group())

    # Fall back to Hindi spoken-number parsing
    return parse_hindi_number(text)


# ─────────────────────────────────────────────────────────────────────────────
# CUSTOMER MATCHING
# Two-tier substring strategy:  full-name → first-name → fuzzy fallback
# ─────────────────────────────────────────────────────────────────────────────

def extract_customer(text: str, customers: list) -> dict:
    """
    Match a customer name inside *text*.

    Strategy:
      1. If the full customer name appears as a substring → exact match.
      2. If only the first name appears and multiple customers share it
         → return clarification_needed.
      3. Fuzzy fallback for mispronunciations.

    Never auto-selects the first match when multiple customers match.

    Returns:
        {"type": "single",   "customer": {...}}
        {"type": "multiple", "customers": [...]}
        {"type": "none"}
    """
    cleaned = clean_text(text)

    # ── Tier 1: exact full-name substring match ─────────────────────────
    matches = []
    for customer in customers:
        if customer["name"].lower() in cleaned:
            matches.append(customer)

    if len(matches) == 1:
        return {"type": "single", "customer": matches[0]}

    if len(matches) > 1:
        return {"type": "multiple", "customers": matches}

    # ── Tier 2: first-name substring match ──────────────────────────────
    first_name_matches = []
    for customer in customers:
        first = customer["name"].split()[0].lower()
        if first in cleaned:
            first_name_matches.append(customer)

    if len(first_name_matches) == 1:
        return {"type": "single", "customer": first_name_matches[0]}

    if len(first_name_matches) > 1:
        return {"type": "multiple", "customers": first_name_matches}

    # ── Tier 3: fuzzy fallback (handles mispronunciation) ───────────────
    fuzzy_matches = []
    for customer in customers:
        score = fuzz.partial_ratio(customer["name"].lower(), cleaned)
        if score >= FUZZY_THRESHOLD:
            fuzzy_matches.append(customer)

    if len(fuzzy_matches) == 1:
        return {"type": "single", "customer": fuzzy_matches[0]}

    if len(fuzzy_matches) > 1:
        return {"type": "multiple", "customers": fuzzy_matches}

    # ── Tier 4: Suggestions for near misses ─────────────────────────────
    # Sort all customers by their fuzzy score
    scored_customers = []
    for customer in customers:
        score = fuzz.partial_ratio(customer["name"].lower(), cleaned)
        if score >= 40:
            scored_customers.append((score, customer))

    if scored_customers:
        # Sort descending by score
        scored_customers.sort(key=lambda x: x[0], reverse=True)
        # Take top 3
        suggestions = [c[1] for c in scored_customers[:3]]
        return {"type": "suggest", "customers": suggestions}

    return {"type": "none"}


# ─────────────────────────────────────────────────────────────────────────────
# ENTITY PIPELINE  (public API – unchanged signature)
# ─────────────────────────────────────────────────────────────────────────────

def extract_entities(text: str, user_id: int) -> dict:
    # Step 0: Devanagari → Roman transliteration (handles Hindi speech input)
    #   "राहुल गुप्ता ने 500 दे दिए" → "rahul gupta ne 500 de die"
    text = normalize_input(text)

    # Step 1: Hinglish stop-word / phrase normalisation
    text = normalize_text(text)

    customers       = get_customer_list(user_id)
    amount          = extract_amount(text)
    customer_result = extract_customer(text, customers)

    return {
        "amount":          amount,
        "customer_result": customer_result,
    }


# ─────────────────────────────────────────────────────────────────────────────
# QUICK SMOKE-TEST
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    fake_customers = [
        {"customer_id": 1, "name": "Rahul Gupta"},
        {"customer_id": 2, "name": "Amit Sharma"},
        {"customer_id": 3, "name": "Rahul Das"},
    ]

    test_cases = [
        "Rahul Gupta ne 500 rupaye diye the",       # exact full name
        "rahool guptha ne paanch sau diye",          # fuzzy mispronunciation
        "Amit ko teen sau udhar likh do",            # first-name match
        "Rahul ne 200 rupaye diye",                  # ambiguous → multiple
        "unknown person ko 100 do",                  # no match
    ]

    for tc in test_cases:
        result = extract_customer(tc, fake_customers)
        amount = extract_amount(tc)
        print(f"\nInput   : {tc}")
        print(f"Customer: {result}")
        print(f"Amount  : {amount}")