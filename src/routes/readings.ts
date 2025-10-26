import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabase';
import { validateRequest, validationSchemas, asyncHandler } from '../middleware/validation';
import { SensorReadingRequest, SensorReadingResponse, ApiError } from '../types';

const router = Router();

/**
 * POST /api/readings
 * Upload sensor data from smart insoles
 * This endpoint doesn't require authentication as it's called by IoT devices
 * Device authentication should be handled via API keys or device certificates
 */
router.post(
    '/',
    validateRequest(validationSchemas.sensorReading),
    asyncHandler(async (req: Request<{}, SensorReadingResponse, SensorReadingRequest>, res: Response<SensorReadingResponse | ApiError>) => {
        const { device_id, pressure, temperature, humidity } = req.body;

        try {
            // Verify device exists
            const { data: device, error: deviceError } = await supabase
                .from('devices')
                .select('device_id')
                .eq('device_id', device_id)
                .single();

            if (deviceError || !device) {
                res.status(404).json({
                    error: 'Device not found',
                    message: 'Invalid device ID',
                    statusCode: 404
                });
                return;
            }

            // Insert sensor reading
            const { data: reading, error } = await supabase
                .from('sensor_readings')
                .insert({
                    device_id,
                    pressure,
                    temperature,
                    humidity
                })
                .select('id')
                .single();

            if (error) {
                console.error('Sensor reading insertion error:', error);
                res.status(500).json({
                    error: 'Data upload failed',
                    message: 'Failed to store sensor reading',
                    statusCode: 500
                });
                return;
            }

            res.status(201).json({
                id: reading.id,
                message: 'Sensor reading stored successfully'
            });
        } catch (error) {
            console.error('Unexpected error during sensor reading upload:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/readings/:deviceId
 * Get sensor readings for a specific device
 * Requires authentication to ensure user owns the device
 */
router.get(
    '/:deviceId',
    asyncHandler(async (req: Request, res: Response) => {
        const { deviceId } = req.params;
        const { limit = '100', offset = '0', hours = '24' } = req.query;

        try {
            // Parse query parameters
            const limitNum = Math.min(parseInt(limit as string) || 100, 1000);
            const offsetNum = parseInt(offset as string) || 0;
            const hoursNum = parseInt(hours as string) || 24;

            // Calculate timestamp for filtering
            const sinceTimestamp = new Date();
            sinceTimestamp.setHours(sinceTimestamp.getHours() - hoursNum);

            const { data: readings, error } = await supabase
                .from('sensor_readings')
                .select('id, pressure, temperature, humidity, timestamp')
                .eq('device_id', deviceId)
                .gte('timestamp', sinceTimestamp.toISOString())
                .order('timestamp', { ascending: false })
                .range(offsetNum, offsetNum + limitNum - 1);

            if (error) {
                console.error('Error fetching sensor readings:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch sensor readings',
                    statusCode: 500
                });
                return;
            }

            res.json({
                readings: readings || [],
                count: readings?.length || 0,
                device_id: deviceId,
                time_range_hours: hoursNum
            });
        } catch (error) {
            console.error('Unexpected error fetching sensor readings:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/readings/:deviceId/stats
 * Get aggregated statistics for a device
 */
router.get(
    '/:deviceId/stats',
    asyncHandler(async (req: Request, res: Response) => {
        const { deviceId } = req.params;
        const { hours = '24' } = req.query;
        const hoursNum = parseInt(hours as string) || 24;

        try {
            const sinceTimestamp = new Date();
            sinceTimestamp.setHours(sinceTimestamp.getHours() - hoursNum);

            const { data: stats, error } = await supabase
                .from('sensor_readings')
                .select('pressure, temperature, humidity')
                .eq('device_id', deviceId)
                .gte('timestamp', sinceTimestamp.toISOString());

            if (error) {
                console.error('Error fetching sensor stats:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch sensor statistics',
                    statusCode: 500
                });
                return;
            }

            if (!stats || stats.length === 0) {
                res.json({
                    device_id: deviceId,
                    time_range_hours: hoursNum,
                    stats: {
                        pressure: { min: 0, max: 0, avg: 0 },
                        temperature: { min: 0, max: 0, avg: 0 },
                        humidity: { min: 0, max: 0, avg: 0 }
                    },
                    reading_count: 0
                });
                return;
            }

            // Calculate statistics
            const pressures = stats.map(r => r.pressure);
            const temperatures = stats.map(r => r.temperature);
            const humidities = stats.map(r => r.humidity);

            const calculateStats = (values: number[]) => ({
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((sum, val) => sum + val, 0) / values.length
            });

            res.json({
                device_id: deviceId,
                time_range_hours: hoursNum,
                stats: {
                    pressure: calculateStats(pressures),
                    temperature: calculateStats(temperatures),
                    humidity: calculateStats(humidities)
                },
                reading_count: stats.length
            });
        } catch (error) {
            console.error('Unexpected error calculating sensor stats:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

export default router;
