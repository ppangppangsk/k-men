import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db';
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth';
import { uploadsRoot } from '../uploads';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// 게시글 유형 정책 — 생성(POST)과 수정(PUT)이 갈라지지 않도록 한 곳에서 관리한다.
const VALID_POST_TYPES = ['news', 'event', 'press_release', 'notice', 'document', 'member_activity'];
const ADMIN_ONLY_POST_TYPES = ['press_release', 'notice', 'document'];

// 업로드 루트는 server/uploads.ts 한 곳에서만 결정한다.
// (예전에는 posts/upload/index 세 곳에 같은 식이 복사돼 있어 서로 어긋날 수 있었다)

const validPostTypes = ['news', 'event', 'press_release', 'notice', 'document', 'member_activity'];

function getUploadDir(postType?: string): string {
  const subdir = validPostTypes.includes(postType || '') ? postType! : 'general';
  const dir = path.join(uploadsRoot, subdir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function uniqueFilename(dir: string, originalName: string): string {
  const decoded = Buffer.from(originalName, 'latin1').toString('utf8');
  const safeName = decoded.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
  const ext = path.extname(safeName);
  const base = safeName.slice(0, -ext.length || undefined);
  let finalName = safeName;
  let counter = 1;
  while (fs.existsSync(path.join(dir, finalName))) {
    finalName = `${base}_(${counter})${ext}`;
    counter++;
  }
  return finalName;
}

const postFileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const postType = (req.query?.type as string) || 'general';
      const dir = getUploadDir(postType);
      (req as any)._uploadDir = dir;
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const dir = (req as any)._uploadDir || uploadsRoot;
      cb(null, uniqueFilename(dir, file.originalname));
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('PDF 또는 이미지 파일만 업로드할 수 있습니다.'));
    }
  },
});

// 게시글 파일 업로드 (인증 필요)
router.post('/upload', authMiddleware, postFileUpload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: '파일이 없습니다.' });
    return;
  }
  // 파일이 저장된 하위 디렉토리 추출
  const relDir = path.relative(uploadsRoot, path.dirname(req.file.path));
  res.json({
    url: `/uploads/${relDir}/${req.file.filename}`,
    original_name: req.file.originalname,
  });
});

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

    const validTypes = ['news', 'event', 'press_release', 'notice', 'document', 'member_activity'];
    if (typeof type === 'string' && validTypes.includes(type)) {
      query += ' AND p.type = ?';
      params.push(type);
    }

    // sort_order 가 큰 글이 위로. 기본값 0 동률이면 기존처럼 최신순.
    query += ' ORDER BY p.sort_order DESC, p.created_at DESC';

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
      'SELECT * FROM posts WHERE org_id = ? ORDER BY sort_order DESC, created_at DESC',
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
  const { title, content, type, event_date, image_url, file_url, summary } = req.body;

  if (!title || !content || !type) {
    res.status(400).json({ error: '제목, 내용, 유형을 모두 입력해주세요.' });
    return;
  }

  if (!VALID_POST_TYPES.includes(type)) {
    res.status(400).json({ error: `유형은 ${VALID_POST_TYPES.join(', ')}만 가능합니다.` });
    return;
  }

  // press_release, notice, document 타입은 관리자 전용
  if (ADMIN_ONLY_POST_TYPES.includes(type) && req.orgRole !== 'admin') {
    res.status(403).json({ error: '관리자만 작성할 수 있는 유형입니다.' });
    return;
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO posts (title, content, summary, type, org_id, event_date, image_url, file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, content, summary || null, type, req.orgId, event_date || null, image_url || null, file_url || null]
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

// 게시글 수정 (본인 글만, admin은 모두 수정 가능)
// 게시글 순서 변경 (관리자 전용)
// ids 는 화면에 보이는 순서대로 전달한다(앞이 위). 목록 전체의 sort_order 를 다시 매기므로
// 기존 글이 전부 0 인 상태에서도 동작한다. '/:id' 라우트보다 먼저 선언해야 한다.
router.patch('/reorder', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => Number.isInteger(id))) {
    res.status(400).json({ error: 'ids 는 게시글 id 배열이어야 합니다.' });
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (let i = 0; i < ids.length; i++) {
      // updated_at = updated_at 로 명시 지정해 ON UPDATE 자동 갱신을 막는다.
      // 순서만 바꾼 것을 '글 수정'으로 기록하지 않기 위함이다.
      await conn.execute(
        'UPDATE posts SET sort_order = ?, updated_at = updated_at WHERE id = ?',
        [ids.length - i, ids[i]]
      );
    }
    await conn.commit();
    res.json({ message: '순서가 변경되었습니다.' });
  } catch (err) {
    await conn.rollback();
    console.error('Reorder posts error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  } finally {
    conn.release();
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, content, type, event_date, image_url, file_url, summary } = req.body;

  if (type !== undefined) {
    if (!VALID_POST_TYPES.includes(type)) {
      res.status(400).json({ error: `유형은 ${VALID_POST_TYPES.join(', ')}만 가능합니다.` });
      return;
    }

    // press_release, notice, document 타입은 관리자 전용
    if (ADMIN_ONLY_POST_TYPES.includes(type) && req.orgRole !== 'admin') {
      res.status(403).json({ error: '관리자만 작성할 수 있는 유형입니다.' });
      return;
    }
  }

  try {
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT org_id FROM posts WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      return;
    }

    if (existing[0].org_id !== req.orgId && req.orgRole !== 'admin') {
      res.status(403).json({ error: '본인의 글만 수정할 수 있습니다.' });
      return;
    }

    await pool.execute(
      'UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content), type = COALESCE(?, type), summary = ?, event_date = ?, image_url = ?, file_url = ? WHERE id = ?',
      [title, content, type ?? null, summary !== undefined ? summary : null, event_date || null, image_url || null, file_url !== undefined ? (file_url || null) : null, req.params.id]
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
