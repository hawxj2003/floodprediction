import React, { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'aos/dist/aos.css';
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
  useEffect(() => {
    AOS.init({
      duration: 1000,  // Animation duration
      easing: 'ease-in-out', // Easing function
      once: false,  // Allow animations to happen every time section is in view
      offset: 100,  // Trigger animation 200px before element enters the viewport
    });

    // Re-initialize AOS if you dynamically add/remove elements to the page
    window.addEventListener('resize', () => AOS.refresh());
  }, []);

  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [mapPosition, setMapPosition] = useState<[number, number]>([3.139, 101.6869]); // Default to Kuala Lumpur
  const mapRef = useRef<any>(null);
  const [showAbout, setShowAbout] = useState(false); // state for toggling About Us visibility

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

  const handleAboutClick = () => {
    setShowAbout(!showAbout);  // Toggle the visibility of About Us section
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        <video 
          autoPlay 
          loop 
          muted 
          className="absolute w-full h-full object-cover" 
          onTimeUpdate={(e) => {
            const video = e.target;
            if (video.currentTime >= 19) {
              video.currentTime = 1; // Only get the first 19 seconds of the background video
            }
          }}
          data-aos="fade-down"
        >
          <source 
            src="https://videos.pexels.com/video-files/6179507/6179507-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark semi-transparent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center" data-aos="fade-up">
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
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-4">Advanced Flood Risk Analysis</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our system combines multiple data sources with machine learning to provide accurate flood risk assessments.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg" data-aos="fade-right">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Machine learning algorithms analyze multiple weather parameters to predict flood risks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg" data-aos="zoom-in">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Data</h3>
              <p className="text-gray-600">
                Continuous monitoring of weather conditions and environmental factors.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg" data-aos="fade-left">
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
      <div id="predict" className="py-20" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Check Your Area's Flood Risk</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enter a location or click on the map to get detailed flood risk assessment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8" data-aos="fade-down">
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
                          Temperature
                        </h3>
                        <p className="text-gray-600">{weatherData.days[0].temp} °F</p>
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
                          Flood Probability: {(prediction.confidence).toFixed(1)}%
                        </p>
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
        <div className="max-w-7xl mx-auto px-6 text-center text-white" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Informed, Stay Safe</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our advanced flood prediction system helps communities prepare for and respond to potential flood risks.
          </p>
          <a href="#predict" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors" data-aos="zoom-out">
            Check Your Area Now
          </a>
        </div>
      </div>

      {/* FAQ + Contact Section */}
      <div id="support" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-lg text-gray-600">Check out our FAQs or contact us directly!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* FAQs Section */}
            <div data-aos="fade-up">
              <h3 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <details className="bg-white rounded-lg p-4 shadow-sm">
                  <summary className="font-semibold cursor-pointer">How do I check flood risk for my area?</summary>
                  <p className="mt-2 text-gray-600">You can either enter your city name or click anywhere on the map to get a prediction based on real-time weather data.</p>
                </details>

                <details className="bg-white rounded-lg p-4 shadow-sm">
                  <summary className="font-semibold cursor-pointer">Where does the weather data come from?</summary>
                  <p className="mt-2 text-gray-600">We source weather data from reliable APIs and combine it with geolocation information for accuracy.</p>
                </details>

                <details className="bg-white rounded-lg p-4 shadow-sm">
                  <summary className="font-semibold cursor-pointer">Is the prediction accurate?</summary>
                  <p className="mt-2 text-gray-600">Our model uses machine learning and performs well, but like all forecasts, it has limitations based on data quality.</p>
                </details>

                <details className="bg-white rounded-lg p-4 shadow-sm">
                  <summary className="font-semibold cursor-pointer">How often is the prediction updated?</summary>
                  <p className="mt-2 text-gray-600">Predictions are based on the latest weather data fetched at the time of your search. You can re-check anytime for fresh results.</p>
                </details>

                <details className="bg-white rounded-lg p-4 shadow-sm">
                  <summary className="font-semibold cursor-pointer">Is my personal data collected when I use this site?</summary>
                  <p className="mt-2 text-gray-600">No, we do not collect or store any personal information. Your interactions are anonymous and only used for flood risk prediction.</p>
                </details>
              </div>
            </div>

            {/* Contact Us Section */}
            <div data-aos="fade-down">
              <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>
              <p className="text-gray-600 mb-6">Have a question not listed here? Reach out directly:</p>
              <form 
                action="https://formspree.io/f/mrbqjjea" // Replace with your own
                method="POST"
                className="space-y-4"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  required
                  className="w-full px-4 py-3 border rounded-lg h-32"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            {/* Title */}
            <div className="text-center sm:text-left mb-6 sm:mb-0">
              <div className="flex items-center justify-center sm:justify-start">
                <img src="/logo.jpg" alt="FloodCast" className="w-8 h-8 mr-2" />
                <h3 className="text-2xl font-bold">FloodCast</h3>
              </div>
              <p className="text-gray-400 mt-2">Predict & Prevent Flood Risks</p>
            </div>

            {/* Navigation Links */}
            <div className="space-x-6 text-center sm:text-left">
              <a href="#predict" className="hover:text-blue-400">Prediction</a>
              <a href="#support" className="hover:text-blue-400">FAQs & Contact</a>
              <button 
                onClick={() => {
                  // Toggle visibility of About Us dropdown
                  setShowAbout(!showAbout);

                  // Wait for the dropdown to open, then scroll to it
                setTimeout(() => {
                  const aboutSection = document.getElementById('about');
                  if (aboutSection) {
                    aboutSection.scrollIntoView({
                      behavior: 'smooth', // Smooth scrolling
                      block: 'start', // Align to the top of the viewport
                    });
                  }
                }, 100);  // Small delay to ensure the dropdown is visible
              }}  
                className="hover:text-blue-400"
              >
                About Us
              </button>
            </div>
          </div>

          {/* About Us Section in Footer */}
          {showAbout && (
            <div id="about" className="bg-gray-800 text-white p-8 mt-6 rounded-lg max-w-full" data-aos="fade-up">
              <h3 className="text-xl font-semibold mb-4">About Us</h3>
              <p className="text-gray-400 mb-6">Meet our dedicated team behind Flood Predictor. We are passionate about providing accurate and real-time flood risk predictions to help communities stay prepared and safe.</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
                {/* Team Members */}
                <div className="bg-white p-6 rounded-lg text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Haw Xin Jie</h4>
                  <p className="text-gray-600">Team Leader & Back-end Developer</p>
                  <p className="text-gray-500">Monash University Malaysia</p>
                </div>
                <div className="bg-white p-6 rounded-lg text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Bryan Shia Jun Wei</h4> 
                  <p className="text-gray-600">Machine Learning Model Developer</p>
                  <p className="text-gray-500">Monash University Malaysia</p>
                </div>
                <div className="bg-white p-6 rounded-lg text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Jace Ang Khai Shuan</h4>
                  <p className="text-gray-600">Front-end Developer</p>
                  <p className="text-gray-500">Monash University Malaysia</p>
                </div>
                <div className="bg-white p-6 rounded-lg text-center">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Muhammad Mustafa Khan</h4> 
                  <p className="text-gray-600">Database Specialist</p>
                  <p className="text-gray-500">Monash University Malaysia</p>
                </div>
              </div>
            </div>
          )}

          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; FloodCast. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;