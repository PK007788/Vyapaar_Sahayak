from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from jose import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_connection, initialize_database
from app.ai.command_engine import process_command

from app.business_logic import (
    create_user,
    login_user,
    create_customer,
    create_invoice,
    create_transaction,
    get_customer_statement,
    get_customers_with_balance,
    void_invoice,
    get_invoice_details
)

from app.auth import create_access_token, SECRET_KEY, ALGORITHM

app = FastAPI(title="Vyapaar Saathi API")
security = HTTPBearer()

# Initialize DB
initialize_database()

# --------------------------------------------------
# Request Models
# --------------------------------------------------

class RegisterRequest(BaseModel):
    shop_name: str
    owner_name: str
    phone: str
    password: str


class LoginRequest(BaseModel):
    phone: str
    password: str


class CustomerRequest(BaseModel):
    name: str
    phone: Optional[str] = None


class PaymentRequest(BaseModel):
    customer_id: int
    amount: float
    description: Optional[str] = None


class InvoiceItem(BaseModel):
    item_name: str
    quantity: float
    unit_price: float


class InvoiceRequest(BaseModel):
    customer_id: int
    items: List[InvoiceItem]


class AICommandRequest(BaseModel):
    text: str


# --------------------------------------------------
# Authentication Dependency
# --------------------------------------------------

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():
    return {"message": "Vyapaar Saathi API is running"}


# --------------------------------------------------
# Authentication Routes
# --------------------------------------------------

@app.post("/register")
def register(data: RegisterRequest):

    return create_user(
        data.shop_name,
        data.owner_name,
        data.phone,
        data.password
    )


@app.post("/login")
def login(data: LoginRequest):

    result = login_user(data.phone, data.password)

    if result["status"] != "success":
        return result

    token = create_access_token(result["user_id"])

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# --------------------------------------------------
# Customer Routes
# --------------------------------------------------

@app.post("/customers")
def add_customer(
    data: CustomerRequest,
    user_id: int = Depends(get_current_user)
):

    return create_customer(
        user_id,
        data.name,
        data.phone
    )


@app.get("/customers")
def list_customers(user_id: int = Depends(get_current_user)):

    return get_customers_with_balance(user_id)


# --------------------------------------------------
# Payment Route
# --------------------------------------------------

@app.post("/payment")
def record_payment(
    data: PaymentRequest,
    user_id: int = Depends(get_current_user)
):

    return create_transaction(
        user_id,
        data.customer_id,
        "PAYMENT",
        data.amount,
        data.description
    )


# --------------------------------------------------
# Invoice Routes
# --------------------------------------------------

@app.post("/invoice")
def create_invoice_api(
    data: InvoiceRequest,
    user_id: int = Depends(get_current_user)
):

    items = [item.dict() for item in data.items]

    return create_invoice(
        user_id,
        data.customer_id,
        items
    )


@app.post("/invoice/{invoice_id}/void")
def void_invoice_api(
    invoice_id: int,
    user_id: int = Depends(get_current_user)
):

    return void_invoice(user_id, invoice_id)


@app.get("/invoice/{invoice_id}")
def get_invoice_endpoints(
    invoice_id: int,
    user_id: int = Depends(get_current_user)
):

    return get_invoice_details(user_id, invoice_id)


# --------------------------------------------------
# Statement Route
# --------------------------------------------------

@app.get("/statement/{customer_id}")
def statement(
    customer_id: int,
    user_id: int = Depends(get_current_user)
):

    return get_customer_statement(user_id, customer_id)


# --------------------------------------------------
# Dashboard Route
# --------------------------------------------------

@app.get("/dashboard")
def get_dashboard(current_user=Depends(get_current_user)):

    conn = get_connection()
    cursor = conn.cursor()

    user_id = current_user

    cursor.execute("""
        SELECT COUNT(*) as total
        FROM customers
        WHERE user_id = ?
        AND is_active = 1
    """, (user_id,))
    
    total_customers = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT COALESCE(SUM(current_balance), 0) as total
        FROM customers
        WHERE user_id = ?
    """, (user_id,))
    
    outstanding_balance = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT COUNT(*) as total
        FROM invoices
        WHERE user_id = ?
        AND DATE(created_at) = DATE('now')
        AND status = 'ISSUED'
    """, (user_id,))
    
    today_invoices = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT id, type, amount, description, created_at
        FROM transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
    """, (user_id,))

    recent_transactions = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        "total_customers": total_customers,
        "outstanding_balance": outstanding_balance,
        "today_invoices": today_invoices,
        "recent_transactions": recent_transactions
    }


# --------------------------------------------------
# AI COMMAND ROUTE
# --------------------------------------------------

@app.post("/ai-command")
def ai_command(
    data: AICommandRequest,
    user_id: int = Depends(get_current_user)
):
    """
    Natural language accounting command endpoint.
    """

    result = process_command(data.text, user_id)

    return result