/**
 * ============================================
 * JWT Authentication Middleware (Auto-Refresh)
 * ============================================
 * 
 * Protects routes by verifying the JWT token
 * from the Authorization header. On success,
 * attaches the decoded user payload to req.user.
 * 
 * AUTO-REFRESH FEATURE:
 * If the token is valid but nearing expiry
 * (within the last 7 days of its 30-day life),
 * a fresh token is automatically generated and
 * sent back in the response header:
 * 
 *   X-New-Token: <new_jwt_token>
 *   X-Token-Refreshed: true
 * 
 * The frontend should check for X-New-Token on
 * EVERY response and replace the stored token
 * if present. No manual refresh call needed.
 * 
 * Usage: router.get('/protected', authMiddleware, handler)
 * ============================================
 */

const { verifyToken, generateToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const config = require('../config');

function authMiddleware(req, res, next) {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify and decode the token
    const decoded = verifyToken(token);
    
    // Attach user info to request — all downstream handlers can use req.user
    req.user = decoded;

    // ── Auto-Refresh Check ──────────────────────────
    // If token expires within the refresh window (default 7 days),
    // generate a new token and attach it to response headers.
    // The frontend picks it up automatically — zero effort.
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000); // current time in seconds
      const refreshWindowSeconds = (config.jwt.refreshWindowDays || 7) * 24 * 60 * 60;
      const timeUntilExpiry = decoded.exp - now;

      if (timeUntilExpiry > 0 && timeUntilExpiry < refreshWindowSeconds) {
        // Token is valid but nearing expiry — issue a fresh one
        const newToken = generateToken({
          userId: decoded.userId,
          email: decoded.email,
        });

        // Attach new token to response headers
        res.setHeader('X-New-Token', newToken);
        res.setHeader('X-Token-Refreshed', 'true');
        // Expose custom headers to frontend (important for CORS)
        res.setHeader('Access-Control-Expose-Headers', 'X-New-Token, X-Token-Refreshed');
      }
    }

    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token.', 401);
  }
}

module.exports = authMiddleware;
