// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  let token = null;

  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) token = auth.slice(7);

  if (!token && req.cookies?.token) token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: decoded.id, role: decoded.role || 'user' };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
