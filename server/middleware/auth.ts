import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kmen-dev-secret-change-in-production';

export interface AuthRequest extends Request {
  orgId?: number;
  orgName?: string;
  orgRole?: 'org' | 'admin';
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: '인증이 필요합니다.' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; name: string; role: string };
    req.orgId = payload.id;
    req.orgName = payload.name;
    req.orgRole = payload.role as 'org' | 'admin';
    next();
  } catch {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.orgRole !== 'admin') {
    res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    return;
  }
  next();
}

export function signToken(id: number, name: string, role: string): string {
  return jwt.sign({ id, name, role }, JWT_SECRET, { expiresIn: '7d' });
}
