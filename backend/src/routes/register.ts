import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabase';
import { authenticateToken, requireProfile } from '../middleware/auth';
import { validateRequest, validationSchemas, asyncHandler } from '../middleware/validation';
import { RegisterDeviceRequest, RegisterDeviceResponse, ApiError } from '../types';

const router = Router();

/**
 * POST /api/register
 * Register a new device (smart insole) for the authenticated user
 */
router.post(
    '/',
    authenticateToken,
    requireProfile,
    validateRequest(validationSchemas.registerDevice),
    asyncHandler(async (req: Request<{}, RegisterDeviceResponse, RegisterDeviceRequest>, res: Response<RegisterDeviceResponse | ApiError>) => {
        const { name } = req.body;
        const userId = req.user!.id;

        try {
            // Insert new device
            const { data: device, error } = await supabase
                .from('devices')
                .insert({
                    user_id: userId,
                    name
                })
                .select('device_id')
                .single();

            if (error) {
                console.error('Device registration error:', error);
                res.status(500).json({
                    error: 'Registration failed',
                    message: 'Failed to register device',
                    statusCode: 500
                });
                return;
            }

            res.status(201).json({
                device_id: device.device_id,
                message: 'Device registered successfully'
            });
        } catch (error) {
            console.error('Unexpected error during device registration:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/register
 * Get all devices for the authenticated user
 */
router.get(
    '/',
    authenticateToken,
    requireProfile,
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;

        try {
            const { data: devices, error } = await supabase
                .from('devices')
                .select('device_id, name, registered_at')
                .eq('user_id', userId)
                .order('registered_at', { ascending: false });

            if (error) {
                console.error('Error fetching devices:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch devices',
                    statusCode: 500
                });
                return;
            }

            res.json({
                devices: devices || [],
                count: devices?.length || 0
            });
        } catch (error) {
            console.error('Unexpected error fetching devices:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/register/:deviceId
 * Get specific device details
 */
router.get(
    '/:deviceId',
    authenticateToken,
    requireProfile,
    asyncHandler(async (req: Request, res: Response) => {
        const { deviceId } = req.params;
        const userId = req.user!.id;

        try {
            const { data: device, error } = await supabase
                .from('devices')
                .select('device_id, name, registered_at')
                .eq('device_id', deviceId)
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    res.status(404).json({
                        error: 'Device not found',
                        message: 'Device does not exist or does not belong to you',
                        statusCode: 404
                    });
                    return;
                }

                console.error('Error fetching device:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch device',
                    statusCode: 500
                });
                return;
            }

            res.json(device);
        } catch (error) {
            console.error('Unexpected error fetching device:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

export default router;
