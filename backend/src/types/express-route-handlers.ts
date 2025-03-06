import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from '../lib/auth';

// Type-safe route handler wrapper for regular requests
export function asyncHandler(handler: (req: Request, res: Response) => Promise<any>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

// Type-safe route handler wrapper for authenticated requests
export function authAsyncHandler(handler: (req: AuthRequest, res: Response) => Promise<any>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req as AuthRequest, res);
    } catch (error) {
      next(error);
    }
  };
} 