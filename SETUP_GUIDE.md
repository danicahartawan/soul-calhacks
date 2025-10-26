# 🚀 Soul CalHacks Integration Setup Guide

This guide will help you set up and test the complete integration between the mobile app and backend API.

## 📋 Prerequisites

- Node.js 18+ installed
- Expo CLI installed (`npm install -g @expo/cli`)
- Supabase account and project
- Backend server running

## 🔧 Step 1: Backend Setup

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

3. **Set up the database schema:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents from `backend/src/database/schema.sql`
   - Execute the SQL to create tables and RLS policies

4. **Start the backend server:**
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`

## 📱 Step 2: Mobile App Setup

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Configure Supabase:**
   - Open `lib/supabase.js`
   - Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const supabaseUrl = 'https://your-project-id.supabase.co'
   const supabaseAnonKey = 'your-anon-key-here'
   ```

3. **Start the mobile app:**
```bash
npm start
```

## 🧪 Step 3: Testing Integration

### Option A: Automated Testing
Run the integration test script:
```bash
node test-integration.js
```

### Option B: Manual Testing

1. **Test Backend API:**
```bash
# Health check
curl http://localhost:3000/health

# Send test sensor data
curl -X POST http://localhost:3000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "demo-device-001",
    "pressure": 105.5,
    "temperature": 37.2,
    "humidity": 48.7
  }'

# Check alerts
curl http://localhost:3000/api/alerts
```

2. **Test Mobile App:**
   - Open the app in Expo Go or simulator
   - Navigate to Dashboard screen
   - Check if user profile and device information loads
   - Navigate to Analyzing screen
   - Verify real-time sensor data display

## 🔍 Expected Behavior

### Dashboard Screen
- ✅ Shows user profile information
- ✅ Displays connected devices count
- ✅ Shows recent alerts (if any)
- ✅ Status indicator changes color based on alert severity
- ✅ Loading states during data fetching
- ✅ Error handling with retry options

### Analyzing Screen
- ✅ Displays real-time sensor values
- ✅ Shows sensor status (Normal/High/Critical)
- ✅ Visual footprint updates based on sensor data
- ✅ Start/stop analysis functionality
- ✅ Real-time updates when backend sends new data

### Backend API
- ✅ Processes IoT sensor data
- ✅ Generates alerts based on thresholds
- ✅ Stores data in Supabase database
- ✅ Provides REST endpoints for data retrieval

## 🚨 Alert Thresholds

The system generates alerts when:
- **Pressure > 100 kPa** sustained for 5+ minutes
- **Temperature > 2°C** difference from normal (36.5°C)
- **Humidity > 80%** sustained for 5+ minutes

## 🔄 Data Flow

```
IoT Device → Backend API → Supabase Database → Mobile App
     ↓              ↓              ↓              ↓
Sensor Data → Processing → Storage → Real-time Display
```

## 🐛 Troubleshooting

### Common Issues

1. **"Supabase not configured" error:**
   - Update `lib/supabase.js` with correct credentials
   - Ensure Supabase project is active

2. **Backend connection failed:**
   - Check if backend server is running on port 3000
   - Verify environment variables in backend/.env

3. **Database errors:**
   - Ensure database schema is properly set up
   - Check RLS policies are correctly configured
   - Verify service role key has proper permissions

4. **Real-time updates not working:**
   - Check Supabase real-time is enabled
   - Verify device_id matches between backend and frontend
   - Check network connectivity

### Debug Mode

Enable debug logging by adding to your app:
```javascript
// In lib/supabase.js
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true
  }
});
```

## 📊 Database Schema

The system uses these main tables:
- **profiles**: User information
- **devices**: Smart insole devices
- **sensor_readings**: Time-series sensor data
- **alerts**: Generated alerts

## 🎯 Next Steps

1. **Authentication**: Implement user login/signup
2. **Device Management**: Add device registration flow
3. **Data Visualization**: Enhance charts and graphs
4. **Push Notifications**: Add alert notifications
5. **Offline Support**: Cache data for offline viewing

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure database schema is properly configured
4. Test backend API endpoints independently

---

**Happy coding! 🚀**
