// Utility functions for data processing and validation

/**
 * Calculate statistics for an array of numbers
 */
export function calculateStats(values: number[]): {
    min: number;
    max: number;
    avg: number;
    median: number;
} {
    if (values.length === 0) {
        return { min: 0, max: 0, avg: 0, median: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: sum / values.length,
        median: sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)]
    };
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: string | Date): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Convert pressure from kPa to other units
 */
export function convertPressure(value: number, fromUnit: 'kPa' | 'psi' | 'bar', toUnit: 'kPa' | 'psi' | 'bar'): number {
    const conversions = {
        kpa: { psi: 0.145038, bar: 0.01 },
        psi: { kpa: 6.89476, bar: 0.0689476 },
        bar: { kpa: 100, psi: 14.5038 }
    };

    if (fromUnit === toUnit) return value;

    const from = fromUnit.toLowerCase() as keyof typeof conversions;
    const to = toUnit.toLowerCase() as keyof typeof conversions;

    return value * conversions[from][to];
}

/**
 * Convert temperature between units
 */
export function convertTemperature(value: number, fromUnit: 'celsius' | 'fahrenheit', toUnit: 'celsius' | 'fahrenheit'): number {
    if (fromUnit === toUnit) return value;

    if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        return (value * 9 / 5) + 32;
    } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        return (value - 32) * 5 / 9;
    }

    return value;
}

/**
 * Calculate BMI from weight and height
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

/**
 * Check if a value is within normal range for diabetic patients
 */
export function isNormalRange(value: number, type: 'pressure' | 'temperature' | 'humidity'): boolean {
    const ranges = {
        pressure: { min: 0, max: 50 }, // Normal walking pressure
        temperature: { min: 35, max: 38 }, // Normal body temperature range
        humidity: { min: 30, max: 70 } // Comfortable humidity range
    };

    const range = ranges[type];
    return value >= range.min && value <= range.max;
}

/**
 * Generate alert message based on type and values
 */
export function generateAlertMessage(
    alertType: 'pressure_high' | 'temp_diff' | 'humidity_anomaly' | 'combined',
    values: { pressure?: number; temperature?: number; humidity?: number },
    thresholds: { pressure_high: number; temperature_diff: number; humidity_high: number }
): string {
    switch (alertType) {
        case 'pressure_high':
            return `High pressure detected: ${values.pressure?.toFixed(2)} kPa (threshold: ${thresholds.pressure_high} kPa)`;

        case 'temp_diff':
            const tempDiff = Math.abs((values.temperature || 0) - 36.5);
            return `Temperature anomaly: ${values.temperature?.toFixed(2)}°C (diff: ${tempDiff.toFixed(2)}°C)`;

        case 'humidity_anomaly':
            return `High humidity detected: ${values.humidity?.toFixed(2)}% (threshold: ${thresholds.humidity_high}%)`;

        case 'combined':
            const anomalies = [];
            if (values.pressure && values.pressure > thresholds.pressure_high) {
                anomalies.push(`pressure: ${values.pressure.toFixed(2)} kPa`);
            }
            if (values.temperature && Math.abs(values.temperature - 36.5) > thresholds.temperature_diff) {
                anomalies.push(`temperature: ${values.temperature.toFixed(2)}°C`);
            }
            if (values.humidity && values.humidity > thresholds.humidity_high) {
                anomalies.push(`humidity: ${values.humidity.toFixed(2)}%`);
            }
            return `Multiple anomalies detected: ${anomalies.join(', ')}`;

        default:
            return 'Unknown alert type';
    }
}
