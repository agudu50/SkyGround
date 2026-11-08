import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sqlClient } from '../db/neon';

const JWT_SECRET = process.env.JWT_SECRET || 'skyground-dev-secret-change-me';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.headers.authorization?.split(' ')[1] ||
    req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
}): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};

export { JWT_SECRET };
