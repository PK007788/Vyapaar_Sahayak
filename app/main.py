from app.database import initialize_database
from app.business_logic import login_user

if __name__ == "__main__":
    initialize_database()

    # Test login
    response = login_user("9998887771", "mypasswor123")
    print(response)