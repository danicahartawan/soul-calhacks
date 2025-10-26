-- SoleForSole Database Schema
-- Diabetic Ulcer Early Detection App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    weight NUMERIC NOT NULL CHECK (weight > 0),
    height NUMERIC NOT NULL CHECK (height > 0),
    has_diabetes BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create devices table (smart insoles)
CREATE TABLE IF NOT EXISTS devices (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sensor_readings table (time-series data)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    pressure NUMERIC NOT NULL CHECK (pressure >= 0),
    temperature NUMERIC NOT NULL CHECK (temperature >= -50 AND temperature <= 100),
    humidity NUMERIC NOT NULL CHECK (humidity >= 0 AND humidity <= 100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('pressure_high', 'temp_diff', 'humidity_anomaly', 'combined')),
    alert_message TEXT NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_timestamp 
    ON sensor_readings(device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_device_resolved 
    ON alerts(device_id, resolved, triggered_at DESC);

CREATE INDEX IF NOT EXISTS idx_devices_user_id 
    ON devices(user_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Devices policies
CREATE POLICY "Users can view their own devices" ON devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" ON devices
    FOR UPDATE USING (auth.uid() = user_id);

-- Sensor readings policies
CREATE POLICY "Users can view readings from their devices" ON sensor_readings
    FOR SELECT USING (
        device_id IN (
            SELECT device_id FROM devices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert sensor readings" ON sensor_readings
    FOR INSERT WITH CHECK (true);

-- Alerts policies
CREATE POLICY "Users can view alerts from their devices" ON alerts
    FOR SELECT USING (
        device_id IN (
            SELECT device_id FROM devices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert alerts" ON alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update alerts from their devices" ON alerts
    FOR UPDATE USING (
        device_id IN (
            SELECT device_id FROM devices WHERE user_id = auth.uid()
        )
    );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, age, gender, weight, height)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        COALESCE((NEW.raw_user_meta_data->>'age')::integer, 0),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
        COALESCE((NEW.raw_user_meta_data->>'weight')::numeric, 0),
        COALESCE((NEW.raw_user_meta_data->>'height')::numeric, 0)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to analyze sensor readings and generate alerts
CREATE OR REPLACE FUNCTION public.analyze_sensor_readings()
RETURNS TRIGGER AS $$
DECLARE
    recent_readings RECORD;
    pressure_avg NUMERIC;
    temp_avg NUMERIC;
    humidity_avg NUMERIC;
    alert_count INTEGER;
BEGIN
    -- Get recent readings for the same device (last 5 minutes)
    SELECT 
        AVG(pressure) as avg_pressure,
        AVG(temperature) as avg_temp,
        AVG(humidity) as avg_humidity,
        COUNT(*) as reading_count
    INTO recent_readings
    FROM sensor_readings 
    WHERE device_id = NEW.device_id 
    AND timestamp >= NOW() - INTERVAL '5 minutes';

    -- Check for sustained high pressure
    IF recent_readings.avg_pressure > 100 AND recent_readings.reading_count >= 3 THEN
        INSERT INTO alerts (device_id, alert_type, alert_message)
        VALUES (NEW.device_id, 'pressure_high', 
                'Sustained high pressure detected: ' || ROUND(recent_readings.avg_pressure, 2) || ' kPa');
    END IF;

    -- Check for temperature anomalies (difference > 2°C from normal)
    IF ABS(recent_readings.avg_temp - 36.5) > 2.0 AND recent_readings.reading_count >= 3 THEN
        INSERT INTO alerts (device_id, alert_type, alert_message)
        VALUES (NEW.device_id, 'temp_diff', 
                'Temperature anomaly detected: ' || ROUND(recent_readings.avg_temp, 2) || '°C');
    END IF;

    -- Check for humidity anomalies
    IF recent_readings.avg_humidity > 80 AND recent_readings.reading_count >= 3 THEN
        INSERT INTO alerts (device_id, alert_type, alert_message)
        VALUES (NEW.device_id, 'humidity_anomaly', 
                'High humidity detected: ' || ROUND(recent_readings.avg_humidity, 2) || '%');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for sensor reading analysis
DROP TRIGGER IF EXISTS on_sensor_reading_insert ON sensor_readings;
CREATE TRIGGER on_sensor_reading_insert
    AFTER INSERT ON sensor_readings
    FOR EACH ROW EXECUTE FUNCTION public.analyze_sensor_readings();
