# Flood Prediction System

A web-based flood prediction system that uses weather data and machine learning to predict flood risks for locations worldwide.

## Features

- Real-time weather data fetching from Visual Crossing API
- Geocoding support for worldwide locations
- Flood risk prediction based on multiple weather factors
- Interactive UI with real-time updates
- Prepared for ML model integration

## Setup

1. Clone the repository:
```bash
git clone [your-repository-url]
cd flood-prediction-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Visual Crossing API key:
```
VITE_WEATHER_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Development

The project uses:
- React with TypeScript
- Vite for building and development
- Tailwind CSS for styling
- Axios for API calls

### Project Structure

- `src/`
  - `components/` - React components
  - `utils/` - Utility functions and API calls
  - `types/` - TypeScript type definitions
  - `App.tsx` - Main application component

### ML Model Integration

The `weatherService.ts` file contains a placeholder for ML model integration. To integrate your PyTorch model:

1. Export your PyTorch model and host it as an API
2. Update the `predictFloodRiskML` function in `weatherService.ts`
3. Replace the current prediction logic with calls to your ML model API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request