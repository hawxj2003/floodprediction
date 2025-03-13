import React, { useState } from 'react';
import { CloudRain, Droplets, MapPin, AlertTriangle } from 'lucide-react';
import { getWeatherData, predictFloodRisk } from './utils/weatherService';
import type { WeatherData, PredictionResult } from './types';

function App() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await getWeatherData(city);
      setWeatherData(data);
      const floodPrediction = predictFloodRisk(data);
      setPrediction(floodPrediction);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeatherData(null);
      setPrediction(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CloudRain className="text-blue-500" />
            Flood Prediction System
          </h1>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Predict'}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
              {error}
            </div>
          )}

          {weatherData && prediction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="text-gray-600" />
                    Location Details
                  </h2>
                  <p className="text-gray-600">
                    {weatherData.resolvedAddress}
                  </p>
                  <p className="text-sm text-gray-500">
                    Lat: {weatherData.latitude.toFixed(4)}, 
                    Long: {weatherData.longitude.toFixed(4)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Droplets className="text-blue-600" />
                    Current Conditions
                  </h2>
                  <p className="text-gray-600">
                    Precipitation: {weatherData.days[0].precip} in
                  </p>
                  <p className="text-gray-600">
                    Humidity: {weatherData.days[0].humidity}%
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${
                prediction.floodRisk === 'High' ? 'bg-red-50' :
                prediction.floodRisk === 'Medium' ? 'bg-yellow-50' : 'bg-green-50'
              }`}>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className={
                    prediction.floodRisk === 'High' ? 'text-red-500' :
                    prediction.floodRisk === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                  } />
                  Flood Risk Prediction
                </h2>
                <p className="text-lg font-semibold mb-2">
                  Risk Level: {prediction.floodRisk}
                </p>
                <p className="text-gray-600">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;