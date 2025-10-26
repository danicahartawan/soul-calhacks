import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabase';
import { authenticateToken, requireProfile } from '../middleware/auth';
import { validateRequest, validationSchemas, asyncHandler } from '../middleware/validation';
import { ProfileUpdateRequest, ApiError, Profile } from '../types';

const router = Router();

/**
 * GET /api/profile
 * Get the authenticated user's profile
 */
router.get(
    '/',
    authenticateToken,
    requireProfile,
    asyncHandler(async (req: Request, res: Response<Profile | ApiError>) => {
        const userId = req.user!.id;

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch user profile',
                    statusCode: 500
                });
                return;
            }

            res.json(profile);
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * PUT /api/profile
 * Update the authenticated user's profile
 */
router.put(
    '/',
    authenticateToken,
    requireProfile,
    validateRequest(validationSchemas.profileUpdate),
    asyncHandler(async (req: Request<{}, Profile | ApiError, ProfileUpdateRequest>, res: Response<Profile | ApiError>) => {
        const userId = req.user!.id;
        const updateData = req.body;

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId)
                .select('*')
                .single();

            if (error) {
                console.error('Error updating profile:', error);
                res.status(500).json({
                    error: 'Update failed',
                    message: 'Failed to update user profile',
                    statusCode: 500
                });
                return;
            }

            res.json(profile);
        } catch (error) {
            console.error('Unexpected error updating profile:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * POST /api/profile
 * Create a new profile for the authenticated user
 * This endpoint is typically called after user registration
 */
router.post(
    '/',
    authenticateToken,
    validateRequest(validationSchemas.profileUpdate),
    asyncHandler(async (req: Request<{}, Profile | ApiError, ProfileUpdateRequest>, res: Response<Profile | ApiError>) => {
        const userId = req.user!.id;
        const profileData = req.body;

        try {
            // Check if profile already exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .single();

            if (existingProfile) {
                res.status(409).json({
                    error: 'Profile already exists',
                    message: 'User profile already exists. Use PUT to update.',
                    statusCode: 409
                });
                return;
            }

            // Create new profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    ...profileData
                })
                .select('*')
                .single();

            if (error) {
                console.error('Error creating profile:', error);
                res.status(500).json({
                    error: 'Creation failed',
                    message: 'Failed to create user profile',
                    statusCode: 500
                });
                return;
            }

            res.status(201).json(profile);
        } catch (error) {
            console.error('Unexpected error creating profile:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/profile/devices
 * Get all devices associated with the user's profile
 */
router.get(
    '/devices',
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
                console.error('Error fetching user devices:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch user devices',
                    statusCode: 500
                });
                return;
            }

            res.json({
                devices: devices || [],
                count: devices?.length || 0
            });
        } catch (error) {
            console.error('Unexpected error fetching user devices:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/profile/dashboard
 * Get dashboard data including recent alerts and device status
 */
router.get(
    '/dashboard',
    authenticateToken,
    requireProfile,
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;

        try {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, has_diabetes')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error('Error fetching profile for dashboard:', profileError);
            }

            // Get devices
            const { data: devices, error: devicesError } = await supabase
                .from('devices')
                .select('device_id, name, registered_at')
                .eq('user_id', userId)
                .order('registered_at', { ascending: false });

            if (devicesError) {
                console.error('Error fetching devices for dashboard:', devicesError);
            }

            // Get recent alerts (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: recentAlerts, error: alertsError } = await supabase
                .from('alerts')
                .select(`
          id,
          alert_type,
          alert_message,
          triggered_at,
          resolved,
          devices!inner(name)
        `)
                .eq('devices.user_id', userId)
                .gte('triggered_at', sevenDaysAgo.toISOString())
                .order('triggered_at', { ascending: false })
                .limit(10);

            if (alertsError) {
                console.error('Error fetching recent alerts for dashboard:', alertsError);
            }

            // Get active alerts count
            const { count: activeAlertsCount, error: activeCountError } = await supabase
                .from('alerts')
                .select('id', { count: 'exact', head: true })
                .eq('devices.user_id', userId)
                .eq('resolved', false);

            if (activeCountError) {
                console.error('Error counting active alerts:', activeCountError);
            }

            res.json({
                profile: profile || null,
                devices: devices || [],
                recent_alerts: recentAlerts || [],
                active_alerts_count: activeAlertsCount || 0,
                device_count: devices?.length || 0
            });
        } catch (error) {
            console.error('Unexpected error fetching dashboard data:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

export default router;
