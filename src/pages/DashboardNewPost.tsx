import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/ui/RichTextEditor';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Post } from '../types';

export default function DashboardNewPost() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'news' | 'event' | 'member_activity'>('news');
  const [eventDate, setEventDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentReady, setContentReady] = useState(!editId);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (editId) {
      api.getPost(Number(editId)).then((post) => {
        setTitle(post.title);
        setContent(post.content);
        setType(post.type as 'news' | 'event' | 'member_activity');
        setEventDate(post.event_date || '');
        setImageUrl(post.image_url || '');
        setFileUrl(post.file_url || '');
        setContentReady(true);
      }).catch(() => {
        navigate('/dashboard');
      });
    }
  }, [editId, isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        title,
        content,
        type,
        event_date: type === 'event' ? eventDate || undefined : undefined,
        image_url: imageUrl || undefined,
        file_url: fileUrl || undefined,
      };

      if (editId) {
        await api.updatePost(Number(editId), data);
      } else {
        await api.createPost(data as Parameters<typeof api.createPost>[0]);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-kmen-orange hover:text-[#D47A28] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </button>

          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            {editId ? '글 수정' : '새 글 작성'}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">유형</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType('news')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    type === 'news'
                      ? 'bg-kmen-orange text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  소식
                </button>
                <button
                  type="button"
                  onClick={() => setType('event')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    type === 'event'
                      ? 'bg-kmen-orange text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  행사
                </button>
                <button
                  type="button"
                  onClick={() => setType('member_activity')}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    type === 'member_activity'
                      ? 'bg-kmen-orange text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  회원사 활동
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">제목</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-kmen-orange focus:border-kmen-orange transition-colors outline-none"
                placeholder="제목을 입력하세요"
              />
            </div>

            {type === 'event' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">행사 일자</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-kmen-orange focus:border-kmen-orange transition-colors outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">이미지 URL (선택)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-kmen-orange focus:border-kmen-orange transition-colors outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">PDF 첨부 (선택)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFileUploading(true);
                    try {
                      const result = await api.uploadPostFile(file);
                      setFileUrl(result.url);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : '파일 업로드 실패');
                    } finally {
                      setFileUploading(false);
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                />
                {fileUploading && <span className="text-xs text-slate-400 whitespace-nowrap">업로드 중...</span>}
                {fileUrl && !fileUploading && <span className="text-xs text-green-600 whitespace-nowrap">첨부 완료</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">내용</label>
              {contentReady && (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="내용을 입력하세요..."
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? '처리 중...' : editId ? '수정하기' : '게시하기'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                취소
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
