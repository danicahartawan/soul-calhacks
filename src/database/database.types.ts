// Generated database types for Supabase
// This would typically be generated using supabase gen types typescript
// For now, we'll define the basic structure

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string;
                    age: number;
                    gender: 'male' | 'female' | 'other';
                    weight: number;
                    height: number;
                    has_diabetes: boolean;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    full_name: string;
                    age: number;
                    gender: 'male' | 'female' | 'other';
                    weight: number;
                    height: number;
                    has_diabetes?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    age?: number;
                    gender?: 'male' | 'female' | 'other';
                    weight?: number;
                    height?: number;
                    has_diabetes?: boolean;
                    created_at?: string;
                };
            };
            devices: {
                Row: {
                    device_id: string;
                    user_id: string;
                    name: string;
                    registered_at: string;
                };
                Insert: {
                    device_id?: string;
                    user_id: string;
                    name: string;
                    registered_at?: string;
                };
                Update: {
                    device_id?: string;
                    user_id?: string;
                    name?: string;
                    registered_at?: string;
                };
            };
            sensor_readings: {
                Row: {
                    id: number;
                    device_id: string;
                    pressure: number;
                    temperature: number;
                    humidity: number;
                    timestamp: string;
                };
                Insert: {
                    id?: number;
                    device_id: string;
                    pressure: number;
                    temperature: number;
                    humidity: number;
                    timestamp?: string;
                };
                Update: {
                    id?: number;
                    device_id?: string;
                    pressure?: number;
                    temperature?: number;
                    humidity?: number;
                    timestamp?: string;
                };
            };
            alerts: {
                Row: {
                    id: number;
                    device_id: string;
                    alert_type: 'pressure_high' | 'temp_diff' | 'humidity_anomaly' | 'combined';
                    alert_message: string;
                    triggered_at: string;
                    resolved: boolean;
                };
                Insert: {
                    id?: number;
                    device_id: string;
                    alert_type: 'pressure_high' | 'temp_diff' | 'humidity_anomaly' | 'combined';
                    alert_message: string;
                    triggered_at?: string;
                    resolved?: boolean;
                };
                Update: {
                    id?: number;
                    device_id?: string;
                    alert_type?: 'pressure_high' | 'temp_diff' | 'humidity_anomaly' | 'combined';
                    alert_message?: string;
                    triggered_at?: string;
                    resolved?: boolean;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
