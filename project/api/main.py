from fastapi import FastAPI
from pydantic import BaseModel

import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware
from scipy.special import expit 


# Load the trained model
model = joblib.load("xgb_model.pkl")

# Load the scaler
scaler = joblib.load("scaler.pkl")

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

# Define allowed origins (you can specify your frontend URL)
origins = [
    "http://localhost:3000",  # Frontend server address
]

# Add CORSMiddleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/predict")
async def predict(input_data: InputData):
    input_array = np.array([[  
        input_data.latitude,
        input_data.longitude,
        input_data.precipitation,
        input_data.humidity,
        input_data.temperature,
        input_data.windSpeed,
        input_data.pressure,
        input_data.cloudCover,
        input_data.visibility,
        input_data.severerisk,
        input_data.solarradiation,
        input_data.solarenergy,
        input_data.uvindex,
        input_data.moonphase,
        input_data.snowdepth,
        input_data.snow,
        input_data.precipprob,
        input_data.winddir,
        input_data.elevation,
        input_data.soilMoisture
    ]], dtype=np.float32)

    # Scale the input data
    scaled_input = scaler.transform(input_array)

    # Predict using the XGBRegressor model (use the `predict` method)
    prediction = model.predict(scaled_input)

    # Since we are using sigmoid output, we will convert this prediction to a probability
    prob = prediction[0]

    # Determine flood risk based on the probability
    if prob < 0.3:
        predicted_risk = "Low"
    elif prob < 0.7:
        predicted_risk = "Medium"
    else:
        predicted_risk = "High"
    
    # Return flood risk and confidence level
    return {
        "floodRisk": predicted_risk,
        "confidence": round(prob * 100, 2)  # Show confidence level as percentage
    }
