from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

# Load model, scaler, and feature columns list (make sure these files are updated after retraining)
model = joblib.load("xgb_model.pkl")
scaler = joblib.load("scaler.pkl")
feature_columns = joblib.load("feature_columns.pkl")

# Define input schema matching your features
class InputData(BaseModel):
    latitude: float
    longitude: float
    precipitation: float
    humidity: float
    temperature: float
    windSpeed: float
    pressure: float
    cloudCover: float
    visibility: float
    severerisk: float
    solarradiation: float
    solarenergy: float
    uvindex: float
    moonphase: float
    snowdepth: float
    snow: float
    precipprob: float
    winddir: float
    elevation: float
    soilMoisture: float

app = FastAPI()

# Allow CORS from your frontend server
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(input_data: InputData):
    input_dict = input_data.dict()
    input_df = pd.DataFrame([input_dict])

    print("input_df.columns:", list(input_df.columns))
    print("feature_columns:", feature_columns)
    print("input_df types:", input_df.dtypes)
    print("feature_columns types:", type(feature_columns), 
          ", element type:", type(feature_columns[0]))

    # Reorder columns exactly to match training order, filling missing with NaN
    input_df = input_df.reindex(columns=feature_columns)

    print("input_df.columns after reindex:", list(input_df.columns))

    scaled_input = scaler.transform(input_df)
    prediction = model.predict(scaled_input)
    prob = prediction[0]

    if prob < 0.3:
        predicted_risk = "Low"
    elif prob < 0.7:
        predicted_risk = "Medium"
    else:
        predicted_risk = "High"

    response = {
        "floodRisk": predicted_risk,
        "confidence": round(prob * 100, 2)
    }
    
    print("Prediction output:", response)   
    
    return response
