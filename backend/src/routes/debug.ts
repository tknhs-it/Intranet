import { Router } from 'express';
import { extractToken } from '../auth/azure-ad';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * GET /api/debug/token
 * Debug endpoint to inspect the token (development only)
 */
router.get('/token', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Debug endpoint disabled in production' });
  }

  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Decode token without verification (for debugging)
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || typeof decoded === 'string') {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const payload = decoded.payload as any;
    
    res.json({
      header: decoded.header,
      payload: {
        aud: payload.aud,
        iss: payload.iss,
        sub: payload.sub,
        oid: payload.oid,
        email: payload.email,
        name: payload.name,
        preferred_username: payload.preferred_username,
        exp: new Date(payload.exp * 1000).toISOString(),
        nbf: new Date(payload.nbf * 1000).toISOString(),
        iat: new Date(payload.iat * 1000).toISOString(),
        tid: payload.tid,
        scp: payload.scp,
        roles: payload.roles,
        groups: payload.groups,
      },
      expected: {
        audience: `api://${process.env.AZURE_CLIENT_ID}`,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
      },
      matches: {
        audience: payload.aud === `api://${process.env.AZURE_CLIENT_ID}`,
        issuer: payload.iss === `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

