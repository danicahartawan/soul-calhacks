import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

/**
 * Validation schemas for different endpoints
 */
export const validationSchemas = {
    registerDevice: Joi.object({
        name: Joi.string().min(1).max(100).required()
    }),

    sensorReading: Joi.object({
        device_id: Joi.string().uuid().required(),
        pressure: Joi.number().min(0).max(1000).required(),
        temperature: Joi.number().min(-50).max(100).required(),
        humidity: Joi.number().min(0).max(100).required()
    }),

    profileUpdate: Joi.object({
        full_name: Joi.string().min(1).max(100).optional(),
        age: Joi.number().integer().min(1).max(150).optional(),
        gender: Joi.string().valid('male', 'female', 'other').optional(),
        weight: Joi.number().min(1).max(500).optional(),
        height: Joi.number().min(1).max(300).optional(),
        has_diabetes: Joi.boolean().optional()
    }),

    alertQuery: Joi.object({
        device_id: Joi.string().uuid().optional(),
        resolved: Joi.boolean().optional(),
        limit: Joi.number().integer().min(1).max(100).default(50),
        offset: Joi.number().integer().min(0).default(0)
    })
};

/**
 * Generic validation middleware factory
 */
export function validateRequest(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response<ApiError>, next: NextFunction): void => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            res.status(400).json({
                error: 'Validation error',
                message: errorMessage,
                statusCode: 400
            });
            return;
        }

        // Replace the request property with validated and sanitized data
        req[property] = value;
        next();
    };
}

/**
 * Error handling middleware
 */
export function errorHandler(
    error: Error,
    req: Request,
    res: Response<ApiError>,
    next: NextFunction
): void {
    console.error('Unhandled error:', error);

    // Default error response
    const errorResponse: ApiError = {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        statusCode: 500
    };

    // Handle specific error types
    if (error.name === 'ValidationError') {
        errorResponse.error = 'Validation error';
        errorResponse.message = error.message;
        errorResponse.statusCode = 400;
    } else if (error.name === 'UnauthorizedError') {
        errorResponse.error = 'Unauthorized';
        errorResponse.message = 'Invalid credentials';
        errorResponse.statusCode = 401;
    } else if (error.name === 'ForbiddenError') {
        errorResponse.error = 'Forbidden';
        errorResponse.message = 'Access denied';
        errorResponse.statusCode = 403;
    } else if (error.name === 'NotFoundError') {
        errorResponse.error = 'Not found';
        errorResponse.message = 'Resource not found';
        errorResponse.statusCode = 404;
    }

    res.status(errorResponse.statusCode).json(errorResponse);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false
};
