"""
text_normalizer.py
──────────────────
Converts Hindi Devanagari text to Roman (ITRANS) before entity extraction.

Why ITRANS?
  ITRANS maps ā/ī/ū long vowels to uppercase A/I/U, so after .lower() we get
  standard ASCII that the fuzzy matcher and stop-word cleaner can handle.

  राहुल  → rAhul  → rahul
  गुप्ता → guptA  → gupta
  ने     → ne
  500    → 500    (digits / ASCII pass through unchanged)

If the input is already Roman (no Devanagari characters), the function returns
it lowercased without touching it, so mixed inputs are safe.
"""

import re
import unicodedata

# Lazy import so the server doesn't pay the startup cost unless we actually
# receive Devanagari input.
_transliterate = None

# Unicode range for Devanagari script (U+0900 – U+097F)
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")


def _is_devanagari(text: str) -> bool:
    """Return True if *text* contains any Devanagari codepoint."""
    return bool(_DEVANAGARI_RE.search(text))


def _get_transliterate():
    """Import once and cache."""
    global _transliterate
    if _transliterate is None:
        from indic_transliteration.sanscript import transliterate  # noqa: PLC0415
        _transliterate = transliterate
    return _transliterate


def devanagari_to_roman(text: str) -> str:
    """
    Transliterate a Devanagari string to Roman (ITRANS) and lowercase it.

    Examples
    --------
    >>> devanagari_to_roman("राहुल गुप्ता ने 500 दे दिए")
    'rahul gupta ne 500 de diye'
    >>> devanagari_to_roman("Rahul ne 500 diye")   # already Roman
    'rahul ne 500 diye'
    """
    if not _is_devanagari(text):
        # Already Roman / mixed Roman — just lowercase
        return text.lower()

    try:
        from indic_transliteration import sanscript  # noqa: PLC0415
        fn = _get_transliterate()
        romanized = fn(text, sanscript.DEVANAGARI, sanscript.ITRANS)
        return romanized.lower()
    except Exception:
        # Graceful fallback: strip Devanagari chars so the pipeline doesn't
        # crash; fuzzy matching may still recover the customer name.
        cleaned = _DEVANAGARI_RE.sub(" ", text)
        return cleaned.lower().strip()


# ---------------------------------------------------------------------------
# Convenience alias used by entity_extractor.py
# ---------------------------------------------------------------------------
def normalize_input(text: str) -> str:
    """
    Full normalisation pipeline for voice / typed input.

    Steps:
      1. Devanagari → Roman (ITRANS) if needed
      2. Collapse multiple spaces
      3. Strip leading/trailing whitespace
    """
    text = devanagari_to_roman(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text
