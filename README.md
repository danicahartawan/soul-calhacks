# Soul CalHacks - Diabetic Ulcer Detection App

A complete React Native (Expo) mobile app with Node.js backend for diabetic ulcer early-detection using smart insoles with pressure, temperature, and humidity sensors.

## 🏗️ Project Structure

```
soul-calhacks/
├── screens/              # React Native screens
├── lib/                  # Supabase configuration
├── assets/               # App assets
├── backend/              # Node.js backend API
│   ├── src/              # Backend source code
│   ├── Dockerfile        # Backend containerization
│   └── package.json      # Backend dependencies
├── App.js                # Main app component
└── package.json          # Frontend dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI
- Supabase account and project

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `lib/supabase.js` with your credentials

3. **Run the mobile app:**
```bash
npm start
```

### Backend Setup

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your Supabase credentials
```

3. **Set up the database:**
```bash
# Run the SQL schema in your Supabase SQL editor
# Copy contents from backend/src/database/schema.sql
```

4. **Start the backend server:**
```bash
npm run backend:dev
```

## 📱 Mobile App Features

- **Soul Screen**: Animated welcome screen
- **Dashboard**: User dashboard with device management
- **Analyzing Screen**: Real-time sensor data analysis
- **Supabase Integration**: Direct database access for user management
- **Real-time Alerts**: Instant notifications via Supabase subscriptions

## 🔌 Backend API

### Endpoints
- `POST /api/readings` - Upload sensor data from IoT devices
- `GET /api/readings/:deviceId` - Get sensor readings for a device
- `GET /api/alerts` - Get alerts for user's devices
- `GET /api/alerts/active` - Get only unresolved alerts

### Alert System
Alerts are automatically generated when:
- **Pressure > 100 kPa** sustained for 5+ minutes
- **Temperature > 2°C** difference from normal (36.5°C)
- **Humidity > 80%** sustained for 5+ minutes

## 🔧 Configuration

### Environment Variables (Backend)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
NODE_ENV=development
```

### Supabase Setup (Frontend)
```javascript
// lib/supabase.js
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

## 🚀 Available Scripts

### Frontend
```bash
npm start              # Start Expo development server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on web
```

### Backend
```bash
npm run backend:dev    # Start backend development server
npm run backend:build  # Build backend
npm run backend:start  # Start backend production server
```

## 📊 Database Schema

### Tables
- **profiles**: User information linked to Supabase Auth
- **devices**: Smart insole devices registered to users
- **sensor_readings**: Time-series sensor data (pressure, temperature, humidity)
- **alerts**: Generated alerts when thresholds are exceeded

## 🚀 Deployment

### Backend (Docker)
```bash
cd backend
docker build -t soul-calhacks-backend .
docker run -p 3000:3000 soul-calhacks-backend
```

### Frontend (Expo)
```bash
expo build:android    # Build for Android
expo build:ios        # Build for iOS
```

## 📱 Mobile App Integration

The mobile app connects directly to Supabase for:
1. **User authentication** and profile management
2. **Device management** and registration
3. **Real-time alerts** via Supabase subscriptions
4. **Data visualization** and analytics

The backend API handles:
1. **IoT sensor data** processing and storage
2. **Alert generation** and analysis
3. **Data aggregation** and statistics

## 🎯 Architecture

```
Mobile App (React Native) → Supabase (Auth + Database) ← Backend API ← IoT Devices
```

- **Mobile App**: User interface and real-time data display
- **Supabase**: Authentication, user data, and real-time subscriptions
- **Backend API**: IoT data processing and alert generation
- **IoT Devices**: Smart insoles sending sensor data
