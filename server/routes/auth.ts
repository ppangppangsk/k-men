import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db';
import { signToken } from '../middleware/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: '단체명, 이메일, 비밀번호를 모두 입력해주세요.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: '비밀번호는 6자 이상이어야 합니다.' });
    return;
  }

  try {
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM organizations WHERE email = ? OR name = ?',
      [email, name]
    );

    if (existing.length > 0) {
      res.status(409).json({ error: '이미 등록된 단체명 또는 이메일입니다.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.execute<ResultSetHeader>(
      'INSERT INTO organizations (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    res.status(201).json({ message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    return;
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, role, approved FROM organizations WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    const org = rows[0];
    const valid = await bcrypt.compare(password, org.password_hash);
    if (!valid) {
      res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (!org.approved) {
      res.status(403).json({ error: '관리자 승인 대기 중입니다. 승인 후 로그인할 수 있습니다.' });
      return;
    }

    const token = signToken(org.id, org.name, org.role);
    res.json({
      token,
      organization: { id: org.id, name: org.name, email: org.email, role: org.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
