# Vyapaar Sahayak

Voice-first billing and ledger assistant for small businesses. The project combines a FastAPI backend, SQLite storage, and a React frontend to let users manage customers, invoices, payments, and balances using normal Hindi/Hinglish commands.

## What This Project Does

- Registers shop owners and authenticates with JWT.
- Manages customer ledger balances.
- Creates, edits, and voids invoices with item-level entries.
- Records payments and generates customer statements.
- Accepts natural-language commands through an AI command pipeline.
- Handles multi-turn conversation flows, including customer disambiguation and invoice step flows.

## Tech Stack

### Backend

- Python 3.12
- FastAPI + Uvicorn
- SQLite (`data/vyapaar.db`)
- JWT auth (`python-jose`)
- Password hashing (`bcrypt`, `passlib`)
- ML/NLP (`scikit-learn`, `rapidfuzz`, `indic-transliteration`, `joblib`)

### Frontend

- React 19 + React Router
- Vite
- Tailwind CSS
- Browser Speech APIs (speech recognition + text to speech)

## Repository Layout

```text
.
|-- app/
|   |-- main.py                 # FastAPI app and HTTP routes
|   |-- database.py             # SQLite connection and schema initialization
|   |-- business_logic.py       # Core domain operations (invoices, payments, statements)
|   |-- auth.py                 # JWT token creation/validation
|   |-- security.py             # Password hashing/verification
|   `-- ai/
|       |-- command_engine.py   # Pipeline entrypoint
|       |-- command_router.py   # Intent routing + conversation flow handlers
|       |-- conversation_state.py
|       |-- entity_extractor.py
|       |-- customer_lookup.py
|       |-- text_normalizer.py
|       |-- hindi_number_parser.py
|       `-- intent_classifier.py
|-- data/
|   |-- vyapaar.db
|   |-- intent_classifier.pkl
|   `-- tfidf_vectorizer.pkl
|-- docs/
|-- logs/
|   `-- command_history.json
|-- vyapaar-frontend/
|-- requirements.txt
|-- test_flow.py
|-- test_conversation_flow.py
`-- test_disambiguation.py
```

## Backend Setup

1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the API server:

```bash
uvicorn app.main:app --reload
```

Backend will run at `http://127.0.0.1:8000`.

Database schema is initialized automatically at startup (`initialize_database()` is called in `app/main.py`).

## Frontend Setup

```bash
cd vyapaar-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

Vite proxies `/api/*` to `http://127.0.0.1:8000` (configured in `vyapaar-frontend/vite.config.js`).

## API Endpoints (Current)

### Public

- `GET /` - Health message
- `POST /register` - Create shop user
- `POST /login` - Authenticate and return bearer token

### Authenticated

- `POST /customers` - Add customer
- `GET /customers` - List customers with balances
- `POST /payment` - Record payment transaction
- `POST /invoice` - Create invoice
- `PUT /invoice/{invoice_id}` - Update invoice items and totals
- `POST /invoice/{invoice_id}/void` - Void invoice by reversal transaction
- `GET /invoice/{invoice_id}` - Fetch invoice details with items
- `GET /statement/{customer_id}` - Customer ledger statement
- `GET /dashboard` - Dashboard metrics and recent transactions
- `POST /ai-command` - Process natural language command
- `POST /ai-command/silence-timeout` - Silence handler for invoice voice flow

## Voice Command / AI Flow

1. User command goes to `process_command()` in `app/ai/command_engine.py`.
2. Input normalization runs (Hindi/Hinglish cleanup, number normalization).
3. If an active conversation exists, command resumes that state.
4. Otherwise:
	 - Rule-based intent fallback is attempted.
	 - If needed, ML intent classifier predicts intent + confidence.
5. `route_command()` dispatches to business logic.
6. If customer name is ambiguous, state is stored and clarification is requested.
7. Invoice flows run multi-step prompts (`ask_item -> ask_quantity -> ask_price`) and finalize on finish commands (`done`, `ho gaya`, etc.) or silence timeout logic.

### Standard Command Response Shape

Most AI command responses follow this format:

```json
{
	"response": "...",
	"continue_listening": true,
	"status": "success|error|clarification_needed|invoice_step|info"
}
```

## Running Tests

These are script-style integration tests (not pytest test suites).

```bash
python test_flow.py
python test_conversation_flow.py
python test_disambiguation.py
```

What they cover:

- Ledger and invoice lifecycle (create, payment, void)
- Conversation state handling
- Duplicate customer disambiguation
- Hindi normalization and finish command checks

## Data and Training Artifacts

- `intent.md` contains intent examples used for command understanding.
- `entity_schema.md` documents expected entities.
- `data/intent_classifier.pkl` and `data/tfidf_vectorizer.pkl` are loaded by `app/ai/intent_classifier.py` at runtime.

## Configuration Notes

- JWT settings are currently hardcoded in `app/auth.py`:
	- `SECRET_KEY`
	- `ALGORITHM`
	- `ACCESS_TOKEN_EXPIRE_MINUTES`
- Database path is fixed in `app/database.py` as `data/vyapaar.db`.
- Frontend API base defaults to `/api` via `VITE_API_BASE_URL` fallback logic in `vyapaar-frontend/src/lib/api.js`.

## Known Limitations

- `SECRET_KEY` is hardcoded (move to environment variables before production).
- Conversation state is in-memory (`app/ai/conversation_state.py`), so active flows are lost on server restart.
- SQLite is used for local/single-node operation.
- Root `package.json` is minimal and not used for frontend app runtime (frontend has its own package manifest).

## Suggested Next Improvements

1. Add `.env` support for auth and runtime config.
2. Persist conversation state in Redis/DB.
3. Add migration tooling (Alembic or equivalent).
4. Convert script tests to pytest-based automated suites.
5. Add Docker and production deployment docs.
