import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db';
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth';
import type { RowDataPacket } from 'mysql2';

const router = Router();

// Optional auth: 토큰이 있으면 파싱, 없으면 통과
function optionalAuth(req: AuthRequest, res: Response, next: () => void) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }
  // authMiddleware 재사용
  authMiddleware(req, res, next);
}

// Q&A 목록 (공개)
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.orgRole === 'admin';
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, author_name, title, is_private, answer, answered_at, created_at FROM qna ORDER BY created_at DESC'
    );
    // 비밀글: 관리자가 아닌 경우 제목을 마스킹
    const result = (rows as any[]).map((row) => ({
      ...row,
      title: row.is_private && !isAdmin ? '비밀글입니다' : row.title,
    }));
    res.json(result);
  } catch (err) {
    console.error('QnA list error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Q&A 상세 (공개 — 비밀글은 content 제외)
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, author_name, author_email, title, content, is_private, answer, answered_at, created_at FROM qna WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      return;
    }
    const post = rows[0];
    const isAdmin = req.orgRole === 'admin';

    if (post.is_private && !isAdmin) {
      // 비밀글: 내용 숨김
      res.json({
        id: post.id,
        author_name: post.author_name,
        title: '비밀글입니다',
        content: null,
        is_private: true,
        answer: null,
        answered_at: null,
        created_at: post.created_at,
      });
      return;
    }
    res.json(post);
  } catch (err) {
    console.error('QnA detail error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 비밀글 비밀번호 검증
router.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: '비밀번호를 입력해주세요.' });
      return;
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM qna WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      return;
    }
    const post = rows[0];
    const match = await bcrypt.compare(password, post.password);
    if (!match) {
      res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
      return;
    }
    // 검증 성공: 전체 데이터 반환 (password 제외)
    const { password: _, ...safePost } = post;
    res.json(safePost);
  } catch (err) {
    console.error('QnA verify error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Q&A 작성 (공개)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { author_name, author_email, title, content, password, is_private } = req.body;
    if (!author_name?.trim() || !title?.trim() || !content?.trim() || !password) {
      res.status(400).json({ error: '작성자, 제목, 내용, 비밀번호를 모두 입력해주세요.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO qna (author_name, author_email, title, content, password, is_private) VALUES (?, ?, ?, ?, ?, ?)',
      [author_name.trim(), author_email?.trim() || null, title.trim(), content.trim(), hashedPassword, is_private ? 1 : 0]
    );
    const insertId = (result as any).insertId;
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, author_name, title, content, is_private, answer, answered_at, created_at FROM qna WHERE id = ?',
      [insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('QnA create error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Q&A 수정 (비밀번호 검증)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, password } = req.body;
    if (!password) {
      res.status(400).json({ error: '비밀번호를 입력해주세요.' });
      return;
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT password FROM qna WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      return;
    }
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
      return;
    }
    await pool.execute(
      'UPDATE qna SET title = ?, content = ? WHERE id = ?',
      [title.trim(), content.trim(), req.params.id]
    );
    res.json({ message: '수정되었습니다.' });
  } catch (err) {
    console.error('QnA update error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Q&A 삭제 (비밀번호 검증 또는 관리자)
router.delete('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.orgRole === 'admin';

    if (!isAdmin) {
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ error: '비밀번호를 입력해주세요.' });
        return;
      }
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT password FROM qna WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
        return;
      }
      const match = await bcrypt.compare(password, rows[0].password);
      if (!match) {
        res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
        return;
      }
    }

    await pool.execute('DELETE FROM qna WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('QnA delete error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 답변 작성/수정
router.patch('/:id/answer', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) {
      res.status(400).json({ error: '답변을 입력해주세요.' });
      return;
    }
    await pool.execute(
      'UPDATE qna SET answer = ?, answered_at = NOW() WHERE id = ?',
      [answer.trim(), req.params.id]
    );
    res.json({ message: '답변이 등록되었습니다.' });
  } catch (err) {
    console.error('QnA answer error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
