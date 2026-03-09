"""
conversation_state.py
─────────────────────
In-memory per-user conversation state for multi-turn flows.

Supports:
 • Customer clarification  (pending_intent + pending_amount)
 • Invoice creation        (multi-step item → price → quantity)
"""

from typing import Optional

# In-memory store  {user_id: {…state…}}
_states: dict[int, dict] = {}


def get_state(user_id: int) -> Optional[dict]:
    """Return the current conversation state for *user_id*, or None."""
    return _states.get(user_id)


def set_state(user_id: int, state: dict) -> None:
    """Store / overwrite conversation state for *user_id*."""
    _states[user_id] = state


def clear_state(user_id: int) -> None:
    """Delete conversation state for *user_id*."""
    _states.pop(user_id, None)
