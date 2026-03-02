import bcrypt


def hash_password(raw_password: str) -> str:
    # Convert string to bytes
    password_bytes = raw_password.encode("utf-8")

    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)

    # Return as string for storing in DB
    return hashed.decode("utf-8")


def verify_password(raw_password: str, stored_hash: str) -> bool:
    password_bytes = raw_password.encode("utf-8")
    stored_hash_bytes = stored_hash.encode("utf-8")

    return bcrypt.checkpw(password_bytes, stored_hash_bytes)