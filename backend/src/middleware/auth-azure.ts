import { Request, Response, NextFunction } from 'express';
import { verifyAzureToken, extractToken, mapGroupsToRoles, AzureADToken } from '../auth/azure-ad';
import { logger } from '../cases-etl/util/logger';

export interface AuthenticatedRequest extends Request {
  user?: AzureADToken;
  roles?: string[];
  userId?: string;
}

/**
 * Azure AD authentication middleware
 * Verifies JWT token and extracts user information
 */
export async function authenticateAzure(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = await verifyAzureToken(token);

    // Map groups to roles
    const roles = mapGroupsToRoles(decoded.groups || []);

    // Attach user info to request
    req.user = decoded;
    req.roles = roles;
    req.userId = decoded.oid;

    next();
  } catch (error: any) {
    logger.error({ 
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    }, 'Authentication failed');
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Invalid or expired token: ${error.message}`
      : 'Invalid or expired token';
    
    return res.status(401).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
      }),
    });
  }
}

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
export function requireRole(...requiredRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.roles) {
      return res.status(403).json({ error: 'No roles assigned' });
    }

    const hasAccess = requiredRoles.some(role => req.roles!.includes(role));

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredRoles,
        userRoles: req.roles,
      });
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuthAzure(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = await verifyAzureToken(token);
      const roles = mapGroupsToRoles(decoded.groups || []);
      
      req.user = decoded;
      req.roles = roles;
      req.userId = decoded.oid;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

/**
 * Combined authentication and authorization middleware
 * Verifies token and checks for required roles
 * Returns an array of middleware functions that can be spread in Express routes
 */
export function authAzure(requiredRoles: string[]): [typeof authenticateAzure, ReturnType<typeof requireRole>] {
  return [
    authenticateAzure,
    requireRole(...requiredRoles)
  ];
}

