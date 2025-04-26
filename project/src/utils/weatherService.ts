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
    windSpeed: currentDay.windspeed ?? 0,
    pressure: currentDay.pressure ?? 1013,
    cloudCover: currentDay.cloudcover ?? 0,
    visibility: currentDay.visibility ?? 10,
    severerisk: currentDay.severerisk ?? 0,
    solarradiation: currentDay.solarradiation ?? 0,
    solarenergy: currentDay.solarenergy ?? 0,
    uvindex: currentDay.uvindex ?? 0,
    moonphase: currentDay.moonphase ?? 0,
    snowdepth: currentDay.snowdepth ?? 0,
    snow: currentDay.snow ?? 0,
    precipprob: currentDay.precipprob ?? 0,
    winddir: currentDay.winddir ?? 0,
    elevation: 10, // Replace with actual if available
    soilMoisture: 0.2 // Replace with actual if available
  };
}

export async function predictFloodRiskML(
  modelInput: MLModelInput
): Promise<PredictionResult> {
  try {
    const { data } = await axios.post<{
      floodRisk: PredictionResult['floodRisk'];
      confidence: number;
    }>('http://127.0.0.1:8000/predict', modelInput);

    return {
      floodRisk: data.floodRisk,    // 'Low' | 'Medium' | 'High'
      confidence: data.confidence,  // between 0.0 and 1.0
      factors: [
        {
          name: 'ML Model',
          value: data.confidence,
          impact: data.floodRisk,    // now matches your widened impact type
        },
      ],
    };
  } catch (error) {
    console.error('Error calling ML model:', error);
    // Neutral fallback
    return {
      floodRisk: 'Low',
      confidence: 0.5,
      factors: [
        { name: 'Fallback', value: 0.5, impact: 'neutral' },
      ],
    };
  }
}
