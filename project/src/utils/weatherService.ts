import axios from 'axios';
import type { WeatherData, PredictionResult, MLModelInput } from '../types';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export async function getWeatherData(city: string): Promise<WeatherData> {
  try {
    const response = await axios.get(`${BASE_URL}/${encodeURIComponent(city)}`, {
      params: {
        unitGroup: 'us',
        key: API_KEY,
        contentType: 'json',
        include: 'current,hours,alerts,events'
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
}

export function prepareModelInput(weatherData: WeatherData): MLModelInput {
  const currentDay = weatherData.days[0];
  
  return {
    latitude: weatherData.latitude,
    longitude: weatherData.longitude,
    precipitation: currentDay.precip,
    humidity: currentDay.humidity,
    temperature: currentDay.temp,
    windSpeed: currentDay.windspeed,
    pressure: currentDay.pressure,
    cloudCover: currentDay.cloudcover
  };
}

// Temporary prediction function until ML model is integrated
export function predictFloodRisk(weatherData: WeatherData): PredictionResult {
  const currentDay = weatherData.days[0];
  const { precip, humidity, pressure = 1013.25, windspeed = 0 } = currentDay;

  // Enhanced rule-based system (temporary until ML model is ready)
  let floodRisk: PredictionResult['floodRisk'] = 'Low';
  let confidence = 0.5;
  const factors: PredictionResult['factors'] = [];

  // Precipitation impact
  factors.push({
    name: 'Precipitation',
    value: precip,
    impact: precip > 1 ? 'positive' : precip > 0.5 ? 'neutral' : 'negative'
  });

  // Humidity impact
  factors.push({
    name: 'Humidity',
    value: humidity,
    impact: humidity > 80 ? 'positive' : humidity > 70 ? 'neutral' : 'negative'
  });

  // Pressure impact (low pressure often associated with rain)
  factors.push({
    name: 'Pressure',
    value: pressure,
    impact: pressure < 1000 ? 'positive' : pressure < 1010 ? 'neutral' : 'negative'
  });

  // Wind impact (high winds can affect flooding)
  factors.push({
    name: 'Wind Speed',
    value: windspeed,
    impact: windspeed > 20 ? 'positive' : windspeed > 10 ? 'neutral' : 'negative'
  });

  // Calculate risk level based on multiple factors
  const riskScore = factors.reduce((score, factor) => {
    const impactValue = factor.impact === 'positive' ? 1 : 
                       factor.impact === 'neutral' ? 0.5 : 0;
    return score + impactValue;
  }, 0) / factors.length;

  if (riskScore > 0.7) {
    floodRisk = 'High';
    confidence = 0.8;
  } else if (riskScore > 0.4) {
    floodRisk = 'Medium';
    confidence = 0.6;
  }

  return { floodRisk, confidence, factors };
}

// This function will call your ML model API when it's ready
export async function predictFloodRiskML(modelInput: MLModelInput): Promise<PredictionResult> {
  // TODO: Replace with actual ML model API call
  try {
    const response = await axios.post('YOUR_ML_MODEL_API_ENDPOINT', modelInput);
    return response.data;
  } catch (error) {
    console.error('Error calling ML model:', error);
    // Fallback to rule-based prediction
    const weatherData: WeatherData = {
      address: '',
      latitude: modelInput.latitude,
      longitude: modelInput.longitude,
      resolvedAddress: '',
      days: [{
        datetime: new Date().toISOString(),
        temp: modelInput.temperature,
        precip: modelInput.precipitation,
        humidity: modelInput.humidity,
        conditions: '',
        windspeed: modelInput.windSpeed,
        pressure: modelInput.pressure,
        cloudcover: modelInput.cloudCover
      }]
    };
    return predictFloodRisk(weatherData);
  }
}