import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB } from './db';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';
import faqRoutes from './routes/faq';
import qnaRoutes from './routes/qna';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Health check — DB 연결 상태 확인용
app.get('/api/health', async (_req, res) => {
  try {
    const pool = (await import('./db')).default;
    const [rows] = await pool.execute('SELECT 1 as ok');
    res.json({ status: 'ok', db: 'connected', rows });
  } catch (err: any) {
    res.status(500).json({ status: 'error', db: 'disconnected', detail: err?.message });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', uploadRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/qna', qnaRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Production: serve static files
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA fallback — only for non-API routes
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

async function start() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  try {
    await initDB();
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

start();
