import joblib

# Load trained model
vectorizer = joblib.load("data/tfidf_vectorizer.pkl")
model = joblib.load("data/intent_classifier.pkl")


def detect_intent(text: str):

    text_vector = vectorizer.transform([text])

    prediction = model.predict(text_vector)[0]

    confidence = model.predict_proba(text_vector).max()

    return {
        "intent": prediction,
        "confidence": float(confidence)
    }