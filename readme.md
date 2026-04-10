# Vyapaar Sahayak

Vyapaar Sahayak is a voice-first billing and ledger assistant designed for small businesses such as kirana stores. It enables users to manage customers, invoices, payments, and balances using natural Hindi/Hinglish commands instead of traditional manual entry.

The system combines a FastAPI backend, SQLite database, and a React-based frontend to deliver a conversational accounting experience.

## Overview

This project focuses on simplifying day-to-day accounting operations through voice interaction. Users can create invoices, record payments, track balances, and navigate multi-step workflows without needing to understand complex accounting interfaces.

The assistant supports conversational flows, meaning it can ask follow-up questions, handle ambiguous inputs (like duplicate customer names), and continue tasks until completion.

## Key Features
Voice-based interaction using Hindi and Hinglish
Customer management with ledger balance tracking
Invoice creation, editing, and voiding
Payment recording and statement generation
Multi-step conversational invoice flow (item → quantity → price)
Customer disambiguation (e.g., Rahul Gupta vs Rahul Das)
Multi-item command parsing from a single sentence
AI command pipeline for natural language understanding
Voice history tracking and interaction logging
Technology Stack

## Backend:

Python 3.12
FastAPI with Uvicorn
SQLite database
JWT authentication
Password hashing using bcrypt and passlib
NLP stack using scikit-learn, rapidfuzz, indic-transliteration

## Frontend:

React (Vite)
React Router
Tailwind CSS
Browser Speech APIs for speech recognition and text-to-speech
System Architecture

### The system follows a modular AI-driven pipeline:

## Speech Input
→ Speech-to-Text
→ Text Normalization
→ Rule-based Intent Detection
→ ML Intent Classification
→ Entity Extraction
→ Conversation State Management
→ Command Routing
→ Business Logic
→ Database
→ Response
→ Text-to-Speech

This design allows the assistant to handle both direct commands and multi-turn conversations effectively.

## Repository Structure

### The project is organized into backend, AI modules, frontend, and supporting utilities.

app/
Contains backend logic including API routes, database setup, authentication, and core business logic
app/ai/
Handles the AI pipeline including intent classification, entity extraction, conversation state, and command routing
data/
Stores the SQLite database and trained ML models
logs/
Stores command history for debugging and improvement
vyapaar-frontend/
Contains the React-based frontend interface
test files
Script-based tests for validating flows like invoice creation, conversation handling, and disambiguation
Setup Instructions

```
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

## Backend:

Create a Python virtual environment
Install dependencies using requirements.txt
Run the FastAPI server using Uvicorn

## Frontend:

Navigate to the frontend folder
Install dependencies using npm
Start the development server

The frontend communicates with the backend through API endpoints and supports voice interaction via browser APIs.

## API Capabilities

### The backend exposes endpoints for:

User registration and authentication
Customer creation and listing
Invoice creation, update, and void operations
Payment recording
Ledger and statement retrieval
Dashboard analytics
AI command processing
Voice Command Flow

### The AI command pipeline processes user input through multiple stages:

Input normalization for Hindi/Hinglish variations
Intent detection using rule-based and ML approaches
Entity extraction (customer, amount, items, etc.)
Conversation state handling for multi-step interactions
Command execution via business logic

### The system supports commands such as:

Rahul ko 500 udhar likh do
Rahul ne 200 rupaye diye
Rahul ke naam invoice bana do
2 kilo chawal 50 rupaye kilo add karo
Rahul ko 500 ka chawal aur 200 ka tel likh do
Testing

### The project includes script-based tests that validate:

Invoice lifecycle operations
Payment and ledger updates
Conversation flow handling
Customer disambiguation
Hindi normalization

### These tests can be executed directly using Python scripts.

## Current Limitations
Conversation state is stored in-memory and resets on server restart
JWT configuration is hardcoded and should be moved to environment variables
SQLite is used, which limits scalability
Test suite is not yet automated with frameworks like pytest

## Future Scope
Move configuration to environment variables
Persist conversation state using Redis or database
Improve scalability with a production-grade database
Add automated testing pipelines
Provide deployment support (Docker, cloud hosting)
Explore transformer-based multilingual models
## Author

Prajnan Kumar Sarma

## Note

This project is developed for educational and research purposes, focusing on real-world application of AI in small business automation.


