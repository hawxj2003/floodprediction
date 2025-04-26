import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Droplets, MapPin, AlertTriangle, Wind, Gauge, Shield, Brain, Database } from 'lucide-react';
import { getWeatherData, prepareModelInput, predictFloodRiskML } from './utils/weatherService';
import type { WeatherData, PredictionResult } from './types';

// Fix Leaflet default icon issue
import L from 'leaflet';
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function App() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number]>([3.139, 101.6869]); // Default to Kuala Lumpur
  const mapRef = useRef<any>(null);

  // Map click handler component remains the same
  const ClickableMap = ({
    setCity,
    setWeatherData,
    setPrediction,
    setMapPosition,
    mapRef,
    setLoading,
    setError
  }: {
    setCity: (city: string) => void;
    setWeatherData: (data: WeatherData | null) => void;
    setPrediction: (prediction: PredictionResult | null) => void;
    setMapPosition: (position: [number, number]) => void;
    mapRef: React.MutableRefObject<any>;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
  }) => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
    
        try {
          setLoading(true);
          setError('');
  
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || 'Unknown';
          
          setCity(city);

          if (city === 'Unknown') {
            setError('Unknown location. Please try again.');
            setWeatherData(null);
            setPrediction(null);
            return;
          }
  
          const weatherData = await getWeatherData(city);
          setWeatherData(weatherData);
          setMapPosition([weatherData.latitude, weatherData.longitude]);
  
          if (mapRef.current) {
            mapRef.current.flyTo([weatherData.latitude, weatherData.longitude], 12, {
              duration: 2,
            });
          }
          const modelInput = prepareModelInput(weatherData);
          const floodPrediction = await predictFloodRiskML(modelInput);
          setPrediction(floodPrediction);
  
        } catch (error) {
          setError('Failed to fetch data. Please try again.');
          setWeatherData(null);
          setPrediction(null);
        } finally {
          setLoading(false);
        }
      },
    });
  
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await getWeatherData(city);
      setWeatherData(data);
      setMapPosition([data.latitude, data.longitude]);

      if (mapRef.current) {
        mapRef.current.flyTo([data.latitude, data.longitude], 12, {
          duration: 2,
        }); 
      }
      

      // Prepare the data for the ML model
      const modelInput = prepareModelInput(data);  // Convert WeatherData to MLModelInput
      // Get flood prediction from the ML model
      const floodPrediction = await predictFloodRiskML(modelInput);
      setPrediction(floodPrediction);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setWeatherData(null);
      setPrediction(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative h-[600px] bg-cover bg-center" 
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=1920")',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Predict & Prevent Flood Risks
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Advanced AI-powered flood prediction system using real-time weather data to help communities stay prepared and protected.
            </p>
            <a href="#predict" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Prediction
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Advanced Flood Risk Analysis</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our system combines multiple data sources with machine learning to provide accurate flood risk assessments.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Machine learning algorithms analyze multiple weather parameters to predict flood risks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Data</h3>
              <p className="text-gray-600">
                Continuous monitoring of weather conditions and environmental factors.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Early Warning</h3>
              <p className="text-gray-600">
                Get advance notifications about potential flood risks in your area.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Interface */}
      <div id="predict" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Check Your Area's Flood Risk</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enter a location or click on the map to get detailed flood risk assessment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
              <MapContainer 
                center={mapPosition} 
                zoom={10} 
                className="h-full w-full" 
                ref={mapRef}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {weatherData && (
                  <Marker 
                    position={[weatherData.latitude, weatherData.longitude]}
                    icon={icon}
                  >
                    <Popup>
                      {weatherData.resolvedAddress}
                    </Popup>
                  </Marker>
                )}
                <ClickableMap
                  setCity={setCity}
                  setWeatherData={setWeatherData}
                  setPrediction={setPrediction}
                  setMapPosition={setMapPosition}
                  mapRef={mapRef}
                  setLoading={setLoading}
                  setError={setError}
                />
              </MapContainer>
            </div>

            {/* Prediction Interface */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Flood Risk Assessment</h2>
                <form onSubmit={handleSubmit} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city name or click on the map..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Analyzing...' : 'Predict'}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="text-gray-600" />
                          Location
                        </h3>
                        <p className="text-gray-600">{weatherData.resolvedAddress}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {weatherData.latitude.toFixed(4)}°N, {weatherData.longitude.toFixed(4)}°E
                        </p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Droplets className="text-blue-600" />
                          Precipitation
                        </h3>
                        <p className="text-gray-600">{weatherData.days[0].precip} inches</p>
                        <p className="text-gray-600">Humidity: {weatherData.days[0].humidity}%</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Wind className="text-gray-600" />
                          Wind
                        </h3>
                        <p className="text-gray-600">{weatherData.days[0].windspeed} mph</p>
                        <p className="text-gray-600">Direction: {weatherData.days[0].winddir}°</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Gauge className="text-gray-600" />
                          Pressure
                        </h3>
                        <p className="text-gray-600">{weatherData.days[0].pressure} mb</p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-lg ${
                      prediction.floodRisk === 'High' ? 'bg-red-50' :
                      prediction.floodRisk === 'Medium' ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <AlertTriangle className={
                          prediction.floodRisk === 'High' ? 'text-red-500' :
                          prediction.floodRisk === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                        } />
                        Risk Assessment
                      </h3>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">
                          Risk Level: {prediction.floodRisk}
                        </p>
                        <p className="text-gray-600">
                          Confidence: {(prediction.confidence * 100).toFixed(1)}%
                        </p>
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Contributing Factors:</h4>
                          <ul className="space-y-1">
                            {prediction.factors.map((factor, index) => (
                              <li key={index} className="flex items-center gap-2 text-gray-600">
                                <span className={`w-2 h-2 rounded-full ${
                                  factor.impact === 'positive' ? 'bg-red-500' :
                                  factor.impact === 'neutral' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></span>
                                {factor.name}: {factor.value}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div 
        className="relative py-20 bg-cover bg-center" 
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1446076/pexels-photo-1446076.jpeg?auto=compress&cs=tinysrgb&w=1920")',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Informed, Stay Safe</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our advanced flood prediction system helps communities prepare for and respond to potential flood risks.
          </p>
          <a href="#predict" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Check Your Area Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;