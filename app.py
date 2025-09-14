from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

# Load trained pipeline
model = joblib.load("sentiment_pipeline.sav")

# Initialize FastAPI
app = FastAPI(title="Sentiment Analysis API")

# Enable CORS for frontend at http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class TextInput(BaseModel):
    text: str

class BatchInput(BaseModel):
    texts: list[str]

# Health check endpoint
@app.get("/ping")
def ping():
    return {"status": "ok", "message": "Sentiment API is running"}

# Define a mapping dictionary
label_map = {0: "negative", 1: "positive"}   # extend later if you add neutral

@app.post("/predict")
def predict(input_data: TextInput):
    pred = model.predict([input_data.text])[0]
    proba = model.predict_proba([input_data.text])[0].max()
    return {
        "text": input_data.text,
        "sentiment": label_map.get(pred, str(pred)),  # convert number to string
        "confidence": round(float(proba), 4),
    }

@app.post("/batch_predict")
def batch_predict(batch: BatchInput):
    predictions = model.predict(batch.texts)
    probabilities = model.predict_proba(batch.texts)

    results = []
    for text, pred, proba in zip(batch.texts, predictions, probabilities):
        results.append({
            "text": text,
            "sentiment": label_map.get(pred, str(pred)),  # convert number to string
            "confidence": round(float(proba.max()), 4),
        })

    return {"results": results}
