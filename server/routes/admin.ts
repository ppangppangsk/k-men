import { Router, type Response } from 'express';
import pool from '../db';
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth';
import type { RowDataPacket } from 'mysql2';

const router = Router();

// 모든 관리자 라우트에 인증 + 관리자 권한 필요
router.use(authMiddleware, adminMiddleware);

// 전체 단체 목록
router.get('/organizations', async (_req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, role, approved, created_at FROM organizations ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Admin get orgs error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 단체 승인
router.patch('/organizations/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    await pool.execute(
      'UPDATE organizations SET approved = 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: '승인되었습니다.' });
  } catch (err) {
    console.error('Admin approve error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 단체 승인 취소
router.patch('/organizations/:id/revoke', async (req: AuthRequest, res: Response) => {
  try {
    // 관리자 본인은 취소 불가
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT role FROM organizations WHERE id = ?',
      [req.params.id]
    );
    if (rows.length > 0 && rows[0].role === 'admin') {
      res.status(400).json({ error: '관리자 계정의 승인은 취소할 수 없습니다.' });
      return;
    }

    await pool.execute(
      'UPDATE organizations SET approved = 0 WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: '승인이 취소되었습니다.' });
  } catch (err) {
    console.error('Admin revoke error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 단체 삭제
router.delete('/organizations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const orgId = Number(req.params.id);

    // 자기 자신 삭제 불가
    if (orgId === req.orgId) {
      res.status(400).json({ error: '자신의 계정은 삭제할 수 없습니다.' });
      return;
    }

    // 해당 단체의 글 먼저 삭제
    await pool.execute('DELETE FROM posts WHERE org_id = ?', [orgId]);
    await pool.execute('DELETE FROM organizations WHERE id = ?', [orgId]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('Admin delete org error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 전체 게시글 목록 (관리자용)
router.get('/posts', async (_req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, o.name as org_name
       FROM posts p
       JOIN organizations o ON p.org_id = o.id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Admin get posts error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 삭제 (관리자용 — 모든 글 삭제 가능)
router.delete('/posts/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    console.error('Admin delete post error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
