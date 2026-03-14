"""
hindi_number_parser.py
──────────────────────
Converts Hindi spoken numbers (Hinglish) into integer values.

Examples:
    parse_hindi_number("paanch sau")       → 500
    parse_hindi_number("teen sau")         → 300
    parse_hindi_number("do hazaar")        → 2000
    parse_hindi_number("do hazaar teen sau") → 2300
    parse_hindi_number("gyarah")           → 11
    parse_hindi_number("sau pachaas")      → 150
"""


# ─────────────────────────────────────────────────────────────────────────────
# DICTIONARIES
# ─────────────────────────────────────────────────────────────────────────────

NUMBERS = {
    "ek": 1, "do": 2, "teen": 3, "chaar": 4, "char": 4,
    "paanch": 5, "panch": 5,
    "che": 6, "chhe": 6,
    "saat": 7, "aath": 8, "nau": 9, "das": 10, "dus": 10,
    # ── 11–19 ────────────────────────────────────────────────────────────────
    "gyarah": 11, "gyaarah": 11,
    "barah": 12, "baarah": 12,
    "terah": 13, "teerah": 13,
    "chaudah": 14, "choudah": 14,
    "pandrah": 15, "pandara": 15,
    "solah": 16, "sola": 16,
    "satrah": 17, "satara": 17,
    "athaarah": 18, "athaara": 18, "atharah": 18,
    "unees": 19, "unnees": 19,
    # ── 21+ irregular ────────────────────────────────────────────────────────
    "ikkees": 21, "baaees": 22, "teyees": 23, "chaubees": 24,
    "pachchees": 25, "pacchees": 25, "chhabbees": 26,
    "sattaees": 27, "atthaees": 28, "untees": 29,
}

TENS = {
    "bees": 20, "tees": 30, "chalis": 40, "chalees": 40,
    "pachaas": 50, "pachass": 50,
    "saath": 60, "sattar": 70, "assi": 80, "nabbe": 90,
}

MULTIPLIERS = {
    "sau": 100, "hundred": 100,
    "hazaar": 1000, "hazar": 1000, "thousand": 1000,
    "lakh": 100000,
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
        >>> parse_hindi_number("sau pachaas")
        150
        >>> parse_hindi_number("gyarah")
        11
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
            current += TENS[word]
        elif word in MULTIPLIERS:
            if current == 0:
                current = 1          # "sau" alone → 100
            current = current * MULTIPLIERS[word]
            total += current
            current = 0

    total += current
    return total if total > 0 else None



# ── Words that are ambiguous (common Hindi verbs/particles) ──────────────
# These should ONLY be treated as numbers when adjacent to a multiplier
# like "sau", "hazaar", or "lakh".
# "do" = give / 2,  "ek" = one/a,  "nau" = nine/new,  "che" = six,
# "das" = ten/fear, "saat" = seven/with, "aath" = eight

AMBIGUOUS_NUMBER_WORDS = {"do", "ek", "nau", "che", "chhe", "saat", "aath", "das", "dus"}


def replace_hindi_numbers(text: str) -> str:
    """
    Scan text for sequences of Hindi number words and replace them in-place
    with their integer equivalents.

    Context-aware: ambiguous words like 'do' (give/2), 'ek' (a/1) are only
    converted when they appear adjacent to a multiplier (sau, hazaar, lakh).
    Unambiguous words like 'pachaas', 'bees', 'gyarah' are always converted.

    Examples:
        "rahul ko paanch sau udhar likh do"  → "rahul ko 500 udhar likh do"
        "do hazaar ka saman"                 → "2000 ka saman"
        "chawal do kilo"                     → "chawal do kilo"  (do = give, not 2)
    """
    words = text.lower().split()
    all_number_words = set(NUMBERS) | set(TENS) | set(MULTIPLIERS)

    # First pass: collect indices of multiplier words to know context
    multiplier_indices = set()
    for i, word in enumerate(words):
        if word in MULTIPLIERS:
            multiplier_indices.add(i)

    result = []
    num_buffer = []        # words buffered as potential number sequence
    buf_start_idx = None   # index of first word in buffer

    def flush_buffer():
        """Convert buffered number words to a digit string, or restore them."""
        nonlocal buf_start_idx
        if not num_buffer:
            return

        # Check if buffer contains a multiplier — if so, the whole
        # sequence is definitely a number expression.
        has_multiplier = any(w in MULTIPLIERS for w in num_buffer)

        # Check if buffer has ONLY ambiguous words (no multiplier context).
        all_ambiguous = all(w in AMBIGUOUS_NUMBER_WORDS for w in num_buffer)

        if has_multiplier or not all_ambiguous:
            # Safe to convert — either a multiplier is present, or the
            # words are unambiguous number words like "pachaas", "bees".
            phrase = " ".join(num_buffer)
            parsed = parse_hindi_number(phrase)
            if parsed is not None:
                result.append(str(parsed))
            else:
                result.extend(num_buffer)
        else:
            # All ambiguous, no multiplier — keep original words
            result.extend(num_buffer)

        num_buffer.clear()
        buf_start_idx = None

    for i, word in enumerate(words):
        if word in all_number_words:
            if not num_buffer:
                buf_start_idx = i
            num_buffer.append(word)
        else:
            flush_buffer()
            result.append(word)

    flush_buffer()
    return " ".join(result)


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
        ("sau pachaas", 150),
        ("gyarah", 11),
        ("barah", 12),
        ("pandrah", 15),
        ("ikkees", 21),
        ("hello world", None),
    ]

    for text, expected in tests:
        result = parse_hindi_number(text)
        status = "✅" if result == expected else "❌"
        print(f"  {status}  parse_hindi_number(\"{text}\") = {result}  (expected {expected})")

    print()
    replace_tests = [
        ("rahul ko paanch sau udhar likh do", "rahul ko 500 udhar likh do"),
        ("do hazaar teen sau ka chawal", "2300 ka chawal"),
    ]
    for text, expected in replace_tests:
        result = replace_hindi_numbers(text)
        status = "✅" if result == expected else "❌"
        print(f"  {status}  replace(\"{text}\") = \"{result}\"  (expected \"{expected}\")")
