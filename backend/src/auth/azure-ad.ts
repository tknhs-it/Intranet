import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request } from 'express';

const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || '';
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || '';
const AZURE_ISSUER = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`;
const JWKS_URI = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`;

// Initialize JWKS client
const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

/**
 * Get signing key from JWKS
 */
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Azure AD JWT payload structure
 */
export interface AzureADToken {
  aud: string; // Audience (API app ID)
  iss: string; // Issuer
  sub: string; // Subject (user object ID)
  oid: string; // Object ID
  email: string;
  name: string;
  preferred_username: string;
  groups?: string[]; // Azure AD group IDs
  roles?: string[]; // App roles
  exp: number; // Expiration
  nbf: number; // Not before
  iat: number; // Issued at
  tid: string; // Tenant ID
}

/**
 * Verify Azure AD JWT token
 */
export async function verifyAzureToken(token: string): Promise<AzureADToken> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: `api://${AZURE_CLIENT_ID}`,
        issuer: AZURE_ISSUER,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          return reject(new Error(`Token verification failed: ${err.message}`));
        }
        resolve(decoded as AzureADToken);
      }
    );
  });
}

/**
 * Extract token from Authorization header
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Map Azure AD groups to intranet roles
 */
export function mapGroupsToRoles(groups: string[]): string[] {
  const groupRoleMap: Record<string, string> = {
    // Azure AD Group Object IDs → Intranet Roles
    // These should be configured in environment variables
    [process.env.AZURE_GROUP_STAFF || '']: 'staff',
    [process.env.AZURE_GROUP_TEACHERS || '']: 'teacher',
    [process.env.AZURE_GROUP_LEADERSHIP || '']: 'leadership',
    [process.env.AZURE_GROUP_IT || '']: 'admin',
    [process.env.AZURE_GROUP_ADMIN || '']: 'office',
    [process.env.AZURE_GROUP_MAINTENANCE || '']: 'maintenance',
  };

  const roles = new Set<string>();

  // Map groups to roles
  for (const groupId of groups || []) {
    const role = groupRoleMap[groupId];
    if (role) {
      roles.add(role);
    }
  }

  // If no roles from groups, default to staff
  if (roles.size === 0) {
    roles.add('staff');
  }

  return Array.from(roles);
}

/**
 * Check if user has required role
 */
export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

