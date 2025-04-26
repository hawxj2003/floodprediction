from fastapi import FastAPI
from pydantic import BaseModel
import torch
import numpy as np
import joblib
from weather_mlp import WeatherMLP


# Load the trained model
model = WeatherMLP(input_dim=20)
model.load_state_dict(torch.load("mlp_flood_model.pth", map_location="cpu"))
model.eval()

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

    x = torch.tensor(scaled_input, dtype=torch.float32)

    with torch.no_grad():
        logits = model(x)
        probs = torch.sigmoid(logits).item()

    # Determine flood risk based on the probability
    if probs < 0.3:
        predicted_risk = "Low"
    elif probs < 0.7:
        predicted_risk = "Medium"
    else:
        predicted_risk = "High"
    
    return {
        "floodRisk": predicted_risk,
        "confidence": round(probs * 100, 2),
    
    }
