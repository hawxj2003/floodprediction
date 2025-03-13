export interface WeatherData {
  address: string;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  days: {
    datetime: string;
    temp: number;
    precip: number;
    humidity: number;
    conditions: string;
    // Additional fields for ML model
    cloudcover?: number;
    visibility?: number;
    severerisk?: number;
    stations?: string[];
    solarradiation?: number;
    solarenergy?: number;
    uvindex?: number;
    moonphase?: number;
    snowdepth?: number;
    snow?: number;
    precipprob?: number;
    preciptype?: string[];
    windspeed?: number;
    winddir?: number;
    pressure?: number;
  }[];
}

export interface PredictionResult {
  floodRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  factors: {
    name: string;
    value: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
}

export interface MLModelInput {
  latitude: number;
  longitude: number;
  precipitation: number;
  humidity: number;
  temperature: number;
  windSpeed?: number;
  pressure?: number;
  cloudCover?: number;
  soilMoisture?: number;
  elevation?: number;
}