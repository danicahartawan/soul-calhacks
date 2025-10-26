import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabase';
import { authenticateToken, requireProfile } from '../middleware/auth';
import { validateRequest, validationSchemas, asyncHandler } from '../middleware/validation';
import { AlertResponse, ApiError } from '../types';

const router = Router();

/**
 * GET /api/alerts
 * Get alerts for the authenticated user's devices
 */
router.get(
    '/',
    authenticateToken,
    requireProfile,
    validateRequest(validationSchemas.alertQuery, 'query'),
    asyncHandler(async (req: Request, res: Response<AlertResponse | ApiError>) => {
        const userId = req.user!.id;
        const { device_id, resolved, limit, offset } = req.query;

        try {
            let query = supabase
                .from('alerts')
                .select(`
          id,
          device_id,
          alert_type,
          alert_message,
          triggered_at,
          resolved,
          devices!inner(name)
        `)
                .eq('devices.user_id', userId)
                .order('triggered_at', { ascending: false })
                .range(offset as number, (offset as number) + (limit as number) - 1);

            // Apply filters
            if (device_id) {
                query = query.eq('device_id', device_id);
            }
            if (resolved !== undefined) {
                query = query.eq('resolved', resolved);
            }

            const { data: alerts, error } = await query;

            if (error) {
                console.error('Error fetching alerts:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch alerts',
                    statusCode: 500
                });
                return;
            }

            // Get total count for pagination
            let countQuery = supabase
                .from('alerts')
                .select('id', { count: 'exact', head: true })
                .eq('devices.user_id', userId);

            if (device_id) {
                countQuery = countQuery.eq('device_id', device_id);
            }
            if (resolved !== undefined) {
                countQuery = countQuery.eq('resolved', resolved);
            }

            const { count, error: countError } = await countQuery;

            if (countError) {
                console.error('Error counting alerts:', countError);
            }

            res.json({
                alerts: alerts || [],
                total: count || 0
            });
        } catch (error) {
            console.error('Unexpected error fetching alerts:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/alerts/active
 * Get only unresolved alerts for the authenticated user
 */
router.get(
    '/active',
    authenticateToken,
    requireProfile,
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;

        try {
            const { data: alerts, error } = await supabase
                .from('alerts')
                .select(`
          id,
          device_id,
          alert_type,
          alert_message,
          triggered_at,
          devices!inner(name)
        `)
                .eq('devices.user_id', userId)
                .eq('resolved', false)
                .order('triggered_at', { ascending: false });

            if (error) {
                console.error('Error fetching active alerts:', error);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch active alerts',
                    statusCode: 500
                });
                return;
            }

            res.json({
                alerts: alerts || [],
                count: alerts?.length || 0
            });
        } catch (error) {
            console.error('Unexpected error fetching active alerts:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * PATCH /api/alerts/:alertId/resolve
 * Mark an alert as resolved
 */
router.patch(
    '/:alertId/resolve',
    authenticateToken,
    requireProfile,
    asyncHandler(async (req: Request, res: Response) => {
        const { alertId } = req.params;
        const userId = req.user!.id;

        try {
            // First verify the alert belongs to the user
            const { data: alert, error: fetchError } = await supabase
                .from('alerts')
                .select(`
          id,
          devices!inner(user_id)
        `)
                .eq('id', alertId)
                .eq('devices.user_id', userId)
                .single();

            if (fetchError || !alert) {
                res.status(404).json({
                    error: 'Alert not found',
                    message: 'Alert does not exist or does not belong to you',
                    statusCode: 404
                });
                return;
            }

            // Update the alert
            const { data: updatedAlert, error } = await supabase
                .from('alerts')
                .update({ resolved: true })
                .eq('id', alertId)
                .select('id, resolved, triggered_at')
                .single();

            if (error) {
                console.error('Error resolving alert:', error);
                res.status(500).json({
                    error: 'Update failed',
                    message: 'Failed to resolve alert',
                    statusCode: 500
                });
                return;
            }

            res.json({
                message: 'Alert resolved successfully',
                alert: updatedAlert
            });
        } catch (error) {
            console.error('Unexpected error resolving alert:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

/**
 * GET /api/alerts/summary
 * Get alert summary statistics for the authenticated user
 */
router.get(
    '/summary',
    authenticateToken,
    requireProfile,
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.id;
        const { days = '7' } = req.query;
        const daysNum = parseInt(days as string) || 7;

        try {
            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - daysNum);

            // Get alert counts by type
            const { data: alertCounts, error: countError } = await supabase
                .from('alerts')
                .select('alert_type, resolved')
                .eq('devices.user_id', userId)
                .gte('triggered_at', sinceDate.toISOString());

            if (countError) {
                console.error('Error fetching alert counts:', countError);
                res.status(500).json({
                    error: 'Fetch failed',
                    message: 'Failed to fetch alert summary',
                    statusCode: 500
                });
                return;
            }

            // Calculate summary statistics
            const summary = {
                total_alerts: alertCounts?.length || 0,
                resolved_alerts: alertCounts?.filter(a => a.resolved).length || 0,
                active_alerts: alertCounts?.filter(a => !a.resolved).length || 0,
                by_type: {} as Record<string, { total: number; resolved: number; active: number }>,
                time_range_days: daysNum
            };

            // Group by alert type
            alertCounts?.forEach(alert => {
                if (!summary.by_type[alert.alert_type]) {
                    summary.by_type[alert.alert_type] = { total: 0, resolved: 0, active: 0 };
                }
                summary.by_type[alert.alert_type].total++;
                if (alert.resolved) {
                    summary.by_type[alert.alert_type].resolved++;
                } else {
                    summary.by_type[alert.alert_type].active++;
                }
            });

            res.json(summary);
        } catch (error) {
            console.error('Unexpected error calculating alert summary:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred',
                statusCode: 500
            });
        }
    })
);

export default router;
