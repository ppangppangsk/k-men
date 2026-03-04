import { Router, type Response } from 'express';
import pool from '../db';
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth';
import type { RowDataPacket } from 'mysql2';

const router = Router();

// 전체 FAQ 목록 (공개)
router.get('/', async (_req, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM faqs ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('FAQ list error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// FAQ 생성 (관리자)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, sort_order } = req.body;
    if (!question?.trim() || !answer?.trim()) {
      res.status(400).json({ error: '질문과 답변을 모두 입력해주세요.' });
      return;
    }
    const [result] = await pool.execute(
      'INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)',
      [question.trim(), answer.trim(), sort_order ?? 0]
    );
    const insertId = (result as any).insertId;
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM faqs WHERE id = ?', [insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('FAQ create error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// FAQ 수정 (관리자)
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer, sort_order } = req.body;
    if (!question?.trim() || !answer?.trim()) {
      res.status(400).json({ error: '질문과 답변을 모두 입력해주세요.' });
      return;
    }
    await pool.execute(
      'UPDATE faqs SET question = ?, answer = ?, sort_order = ? WHERE id = ?',
      [question.trim(), answer.trim(), sort_order ?? 0, req.params.id]
    );
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM faqs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'FAQ를 찾을 수 없습니다.' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('FAQ update error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// FAQ 삭제 (관리자)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await pool.execute('DELETE FROM faqs WHERE id = ?', [req.params.id]);
    res.json({ message: 'FAQ가 삭제되었습니다.' });
  } catch (err) {
    console.error('FAQ delete error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
