# SoleForSole Backend API

Backend API for SoleForSole - diabetic ulcer early-detection using smart insoles with pressure, temperature, and humidity sensors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account and project

### Installation

1. **Install dependencies:**
```bash
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
# Copy contents from src/database/schema.sql
```

4. **Start the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📊 Database Schema

### Tables
- **profiles**: User information linked to Supabase Auth
- **devices**: Smart insole devices registered to users
- **sensor_readings**: Time-series sensor data (pressure, temperature, humidity)
- **alerts**: Generated alerts when thresholds are exceeded

## 🔌 API Endpoints

### Device Registration
- `POST /api/register` - Register a new device
- `GET /api/register` - Get user's devices

### Sensor Data
- `POST /api/readings` - Upload sensor data from IoT devices
- `GET /api/readings/:deviceId` - Get sensor readings for a device

### Alerts
- `GET /api/alerts` - Get alerts for user's devices
- `GET /api/alerts/active` - Get only unresolved alerts

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 🚨 Alert System

Alerts are automatically generated when:
- **Pressure > 100 kPa** sustained for 5+ minutes
- **Temperature > 2°C** difference from normal (36.5°C)
- **Humidity > 80%** sustained for 5+ minutes

## 🔧 Configuration

### Environment Variables
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
NODE_ENV=development
```

## 📱 Mobile App Integration

This backend is designed to work with a React + Expo mobile frontend:

1. **Mobile app connects directly to Supabase** for user authentication and data management
2. **Backend API handles IoT sensor data** processing and alert generation
3. **Mobile app subscribes to real-time alerts** via Supabase subscriptions

## 🚀 Deployment

### Docker
```bash
docker build -t sole-for-sole-backend .
docker run -p 3000:3000 sole-for-sole-backend
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📋 Project Structure

```
src/
├── database/          # Database configuration and types
├── middleware/        # Express middleware
├── routes/           # API route handlers
├── services/         # Business logic services
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```
