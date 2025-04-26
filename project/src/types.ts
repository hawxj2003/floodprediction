// Update the type to accommodate both impacts
export interface Factor {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral' | 'Low' | 'Medium' | 'High';  // Updated impact type
}

export interface PredictionResult {
  floodRisk: 'Low' | 'Medium' | 'High';
  confidence: number;
  factors: Factor[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  days: Array<{
    datetime: string;
    temp: number;
    precip: number;
    humidity: number;
    windspeed: number;
    pressure: number;
    cloudcover: number;
    visibility: number;
    severerisk: number;
    solarradiation: number;
    solarenergy: number;
    uvindex: number;
    moonphase: number;
    snowdepth: number;
    snow: number;
    precipprob: number;
    winddir: number;
  }>;
}

export interface MLModelInput {
  latitude: number;
  longitude: number;
  precipitation: number;
  humidity: number;
  temperature: number;
  windSpeed: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  severerisk: number;
  solarradiation: number;
  solarenergy: number;
  uvindex: number;
  moonphase: number;
  snowdepth: number;
  snow: number;
  precipprob: number;
  winddir: number;
  elevation: number;
  soilMoisture: number;
}
