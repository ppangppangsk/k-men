import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB } from './db';
import { uploadsRoot, logUploadsInfo } from './uploads';
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', uploadRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/qna', qnaRoutes);

// Serve uploaded files (경로 결정은 server/uploads.ts 참고)
app.use('/uploads', express.static(uploadsRoot));

// 업로드 파일이 없으면 아래 SPA fallback 으로 흘러가 200 + index.html 이 반환된다.
// 그러면 브라우저와 CDN 이 그 HTML 을 "정상 응답"으로 보고 이미지 URL 에 캐시해버려,
// 나중에 파일을 복구해도 계속 깨진 채로 남는다. 정직하게 404 를 돌려준다.
app.use('/uploads', (_req, res) => {
  // 이 "없음" 응답이 캐시되면, 나중에 같은 이름으로 파일을 올려도 CDN/브라우저가
  // 한동안 계속 깨진 것으로 응답한다. (업로드 직후 에디터에서 이미지가 깨지는 원인)
  // 부정 응답은 절대 캐시되지 않게 한다.
  res.set('Cache-Control', 'no-store');
  res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
});

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
    logUploadsInfo();
  });
  try {
    await initDB();
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

start();
