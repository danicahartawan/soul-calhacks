// Database types based on the schema
export interface Profile {
    id: string; // UUID, FK to auth.users.id
    full_name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    weight: number;
    height: number;
    has_diabetes: boolean;
    created_at: string;
}

export interface Device {
    device_id: string; // UUID, primary key
    user_id: string; // UUID, FK to profiles.id
    name: string;
    registered_at: string;
}

export interface SensorReading {
    id: number; // bigserial primary key
    device_id: string; // UUID, FK to devices.device_id
    pressure: number;
    temperature: number;
    humidity: number;
    timestamp: string;
}

export interface Alert {
    id: number; // bigserial primary key
    device_id: string; // UUID, FK to devices.device_id
    alert_type: 'pressure_high' | 'temp_diff' | 'humidity_anomaly' | 'combined';
    alert_message: string;
    triggered_at: string;
    resolved: boolean;
}

// API Request/Response types
export interface RegisterDeviceRequest {
    name: string;
}

export interface RegisterDeviceResponse {
    device_id: string;
    message: string;
}

export interface SensorReadingRequest {
    device_id: string;
    pressure: number;
    temperature: number;
    humidity: number;
}

export interface SensorReadingResponse {
    id: number;
    message: string;
}

export interface AlertResponse {
    alerts: Alert[];
    total: number;
}

export interface ProfileUpdateRequest {
    full_name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    weight?: number;
    height?: number;
    has_diabetes?: boolean;
}

// Alert threshold configuration
export interface AlertThresholds {
    pressure_high: number;
    temperature_diff: number;
    humidity_high: number;
    sustained_duration_minutes: number;
}

// Error types
export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
}

// Authentication types
export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email?: string;
    };
}
