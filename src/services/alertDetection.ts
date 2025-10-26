import { supabaseAdmin } from '../database/supabase';
import { AlertThresholds, SensorReading } from '../types';

/**
 * Alert detection service for analyzing sensor readings
 */
export class AlertDetectionService {
    private thresholds: AlertThresholds;

    constructor() {
        this.thresholds = {
            pressure_high: parseFloat(process.env.PRESSURE_THRESHOLD_HIGH || '100'),
            temperature_diff: parseFloat(process.env.TEMPERATURE_DIFF_THRESHOLD || '2.0'),
            humidity_high: parseFloat(process.env.HUMIDITY_THRESHOLD_HIGH || '80'),
            sustained_duration_minutes: parseInt(process.env.SUSTAINED_READING_DURATION_MINUTES || '5')
        };
    }

    /**
     * Analyze sensor readings and generate alerts if thresholds are exceeded
     */
    async analyzeReadings(deviceId: string): Promise<void> {
        try {
            const recentReadings = await this.getRecentReadings(deviceId);

            if (recentReadings.length < 3) {
                return; // Need at least 3 readings for analysis
            }

            await this.checkPressureAlerts(deviceId, recentReadings);
            await this.checkTemperatureAlerts(deviceId, recentReadings);
            await this.checkHumidityAlerts(deviceId, recentReadings);
            await this.checkCombinedAlerts(deviceId, recentReadings);

        } catch (error) {
            console.error('Error analyzing readings for device:', deviceId, error);
        }
    }

    /**
     * Get recent sensor readings for a device
     */
    private async getRecentReadings(deviceId: string): Promise<SensorReading[]> {
        const sinceTime = new Date();
        sinceTime.setMinutes(sinceTime.getMinutes() - this.thresholds.sustained_duration_minutes);

        const { data: readings, error } = await supabaseAdmin
            .from('sensor_readings')
            .select('*')
            .eq('device_id', deviceId)
            .gte('timestamp', sinceTime.toISOString())
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Error fetching recent readings:', error);
            return [];
        }

        return readings || [];
    }

    /**
     * Check for sustained high pressure alerts
     */
    private async checkPressureAlerts(deviceId: string, readings: SensorReading[]): Promise<void> {
        const highPressureReadings = readings.filter(r => r.pressure > this.thresholds.pressure_high);

        if (highPressureReadings.length >= 3) {
            const avgPressure = highPressureReadings.reduce((sum, r) => sum + r.pressure, 0) / highPressureReadings.length;

            await this.createAlert(deviceId, 'pressure_high',
                `Sustained high pressure detected: ${avgPressure.toFixed(2)} kPa (threshold: ${this.thresholds.pressure_high} kPa)`);
        }
    }

    /**
     * Check for temperature anomaly alerts
     */
    private async checkTemperatureAlerts(deviceId: string, readings: SensorReading[]): Promise<void> {
        const avgTemp = readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length;
        const normalTemp = 36.5; // Normal body temperature

        if (Math.abs(avgTemp - normalTemp) > this.thresholds.temperature_diff) {
            await this.createAlert(deviceId, 'temp_diff',
                `Temperature anomaly detected: ${avgTemp.toFixed(2)}°C (normal: ${normalTemp}°C, diff: ${Math.abs(avgTemp - normalTemp).toFixed(2)}°C)`);
        }
    }

    /**
     * Check for humidity anomaly alerts
     */
    private async checkHumidityAlerts(deviceId: string, readings: SensorReading[]): Promise<void> {
        const highHumidityReadings = readings.filter(r => r.humidity > this.thresholds.humidity_high);

        if (highHumidityReadings.length >= 3) {
            const avgHumidity = highHumidityReadings.reduce((sum, r) => sum + r.humidity, 0) / highHumidityReadings.length;

            await this.createAlert(deviceId, 'humidity_anomaly',
                `High humidity detected: ${avgHumidity.toFixed(2)}% (threshold: ${this.thresholds.humidity_high}%)`);
        }
    }

    /**
     * Check for combined alerts (multiple anomalies)
     */
    private async checkCombinedAlerts(deviceId: string, readings: SensorReading[]): Promise<void> {
        const avgPressure = readings.reduce((sum, r) => sum + r.pressure, 0) / readings.length;
        const avgTemp = readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length;
        const avgHumidity = readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length;

        const anomalies = [];

        if (avgPressure > this.thresholds.pressure_high) {
            anomalies.push(`pressure: ${avgPressure.toFixed(2)} kPa`);
        }

        if (Math.abs(avgTemp - 36.5) > this.thresholds.temperature_diff) {
            anomalies.push(`temperature: ${avgTemp.toFixed(2)}°C`);
        }

        if (avgHumidity > this.thresholds.humidity_high) {
            anomalies.push(`humidity: ${avgHumidity.toFixed(2)}%`);
        }

        if (anomalies.length >= 2) {
            await this.createAlert(deviceId, 'combined',
                `Multiple anomalies detected: ${anomalies.join(', ')}`);
        }
    }

    /**
     * Create an alert in the database
     */
    private async createAlert(deviceId: string, alertType: string, message: string): Promise<void> {
        try {
            // Check if a similar alert was already created recently (within last 10 minutes)
            const tenMinutesAgo = new Date();
            tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

            const { data: existingAlert } = await supabaseAdmin
                .from('alerts')
                .select('id')
                .eq('device_id', deviceId)
                .eq('alert_type', alertType)
                .eq('resolved', false)
                .gte('triggered_at', tenMinutesAgo.toISOString())
                .single();

            if (existingAlert) {
                return; // Don't create duplicate alerts
            }

            const { error } = await supabaseAdmin
                .from('alerts')
                .insert({
                    device_id: deviceId,
                    alert_type: alertType as any,
                    alert_message: message
                });

            if (error) {
                console.error('Error creating alert:', error);
            } else {
                console.log(`Alert created for device ${deviceId}: ${message}`);
            }
        } catch (error) {
            console.error('Unexpected error creating alert:', error);
        }
    }

    /**
     * Update alert thresholds
     */
    updateThresholds(newThresholds: Partial<AlertThresholds>): void {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }

    /**
     * Get current thresholds
     */
    getThresholds(): AlertThresholds {
        return { ...this.thresholds };
    }
}

// Export singleton instance
export const alertDetectionService = new AlertDetectionService();
