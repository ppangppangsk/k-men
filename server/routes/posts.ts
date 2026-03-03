import { Router, type Request, type Response } from 'express';
import pool from '../db';
import { authMiddleware, type AuthRequest } from '../middleware/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// 게시글 목록 (공개)
router.get('/', async (req: Request, res: Response) => {
  const { type } = req.query;
  try {
    let query = `
      SELECT p.*, o.name as org_name
      FROM posts p
      JOIN organizations o ON p.org_id = o.id
      WHERE p.published = 1
    `;
    const params: string[] = [];

    if (type === 'news' || type === 'event') {
      query += ' AND p.type = ?';
      params.push(type);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 내 글 목록 (인증 필요)
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM posts WHERE org_id = ? ORDER BY created_at DESC',
      [req.orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get my posts error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, o.name as org_name
       FROM posts p
       JOIN organizations o ON p.org_id = o.id
       WHERE p.id = ? AND p.published = 1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 작성 (인증 필요)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, content, type, event_date, image_url } = req.body;

  if (!title || !content || !type) {
    res.status(400).json({ error: '제목, 내용, 유형을 모두 입력해주세요.' });
    return;
  }

  if (type !== 'news' && type !== 'event') {
    res.status(400).json({ error: '유형은 news 또는 event만 가능합니다.' });
    return;
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO posts (title, content, type, org_id, event_date, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, type, req.orgId, event_date || null, image_url || null]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM posts WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 수정 (본인 글만)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, content, event_date, image_url } = req.body;

  try {
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT org_id FROM posts WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      return;
    }

    if (existing[0].org_id !== req.orgId) {
      res.status(403).json({ error: '본인의 글만 수정할 수 있습니다.' });
      return;
    }

    await pool.execute(
      'UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content), event_date = ?, image_url = ? WHERE id = ?',
      [title, content, event_date || null, image_url || null, req.params.id]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM posts WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 삭제 (본인 글만)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT org_id FROM posts WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      return;
    }

    if (existing[0].org_id !== req.orgId) {
      res.status(403).json({ error: '본인의 글만 삭제할 수 있습니다.' });
      return;
    }

    await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
