import { Router, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db';
import { authMiddleware, adminMiddleware, type AuthRequest } from '../middleware/auth';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// uploads 디렉토리 보장
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  },
});

const router = Router();

// 관리자: 파일 업로드
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: '파일이 없습니다.' });
      return;
    }

    const { title, description, category } = req.body;
    const cat = ['photo', 'video', 'document'].includes(category) ? category : 'photo';

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO media (filename, original_name, mime_type, size, category, title, description, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          cat,
          title || req.file.originalname,
          description || null,
          req.orgId,
        ]
      );

      res.status(201).json({
        id: result.insertId,
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        original_name: req.file.originalname,
      });
    } catch (err) {
      console.error('Upload save error:', err);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  }
);

// 공개: 미디어 목록 조회
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT id, filename, original_name, mime_type, size, category, title, description, created_at FROM media';
    const params: string[] = [];

    if (category === 'photo' || category === 'video' || category === 'document') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    const media = (rows as RowDataPacket[]).map((row) => ({
      ...row,
      url: `/uploads/${row.filename}`,
    }));
    res.json(media);
  } catch (err) {
    console.error('Get media error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 미디어 수정 (제목, 설명)
router.patch('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  try {
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM media WHERE id = ?',
      [req.params.id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
      return;
    }

    await pool.execute(
      'UPDATE media SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ?',
      [title || null, description || null, req.params.id]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, filename, original_name, mime_type, size, category, title, description, created_at FROM media WHERE id = ?',
      [req.params.id]
    );
    const row = rows[0];
    res.json({ ...row, url: `/uploads/${row.filename}` });
  } catch (err) {
    console.error('Update media error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 관리자: 미디어 삭제
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT filename FROM media WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
      return;
    }

    // 파일 삭제
    const filePath = path.join(uploadDir, rows[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.execute('DELETE FROM media WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('Delete media error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;
