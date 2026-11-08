import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { sqlClient } from '../db/neon';
import { authenticate, generateToken } from '../middleware/auth';

export const authRouter = Router();

const SALT_ROUNDS = 10;

interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: 'citizen' | 'engineer' | 'nadmo' | 'admin';
  created_at: string;
}

// In-memory fallback storage when PostgreSQL is not connected
const fallbackUsers: UserRecord[] = [];

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  if (!sqlClient) {
    return res.status(503).json({
      success: false,
      error: 'Database not configured. Auth requires Neon Postgres.',
    });
  }

  const { email, password, fullName, role } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: 'Email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters.',
    });
  }

  try {
    let user: {
      id: string;
      email: string;
      password_hash?: string;
      full_name: string | null;
      role: string;
      created_at: string;
    };

    if (sqlClient) {
      const existing = await sqlClient`
        SELECT id FROM users WHERE email = ${email.toLowerCase()}
      `;
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists.',
        });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await sqlClient`
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName || null}, ${role || 'citizen'})
        RETURNING id, email, full_name, role, created_at
      `;

      user = result[0] as any;
    } else {
      const existing = fallbackUsers.find((u) => u.email === email.toLowerCase());
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists.',
        });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser: UserRecord = {
        id: `usr_${Date.now()}`,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName || null,
        role: role || 'citizen',
        created_at: new Date().toISOString(),
      };
      fallbackUsers.push(newUser);
      user = newUser;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('[SkyGround Auth] Register error:', err);
    return res
      .status(500)
      .json({ success: false, error: 'Registration failed.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  if (!sqlClient) {
    return res.status(503).json({
      success: false,
      error: 'Database not configured. Auth requires Neon Postgres.',
    });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: 'Email and password are required.' });
  }

  try {
    let user: {
      id: string;
      email: string;
      password_hash: string;
      full_name: string | null;
      role: string;
    } | null = null;

    if (sqlClient) {
      const result = await sqlClient`
        SELECT id, email, password_hash, full_name, role FROM users WHERE email = ${email.toLowerCase()}
      `;
      if (result.length > 0) {
        user = result[0] as any;
      }
    } else {
      const found = fallbackUsers.find((u) => u.email === email.toLowerCase());
      if (found) {
        user = found;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('[SkyGround Auth] Login error:', err);
    return res.status(500).json({ success: false, error: 'Login failed.' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out.' });
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  const authReq = req as any;
  if (!authReq.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  if (!sqlClient) {
    return res.status(503).json({
      success: false,
      error: 'Database not configured. Auth requires Neon Postgres.',
    });
  }

  try {
    let user: {
      id: string;
      email: string;
      full_name: string | null;
      role: string;
      created_at: string;
    } | null = null;

    if (sqlClient) {
      const result = await sqlClient`
        SELECT id, email, full_name, role, created_at FROM users WHERE id = ${authReq.user.id}
      `;
      if (result.length > 0) {
        user = result[0] as any;
      }
    } else {
      const found = fallbackUsers.find((u) => u.id === authReq.user.id);
      if (found) {
        user = found;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('[SkyGround Auth] Me error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load user.' });
  }
});
