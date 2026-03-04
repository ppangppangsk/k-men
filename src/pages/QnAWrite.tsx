import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import { api } from '../lib/api';

export default function QnAWrite() {
  const navigate = useNavigate();
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !title.trim() || !content.trim() || !password) {
      alert('작성자, 제목, 내용, 비밀번호를 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await api.qna.create({
        author_name: authorName,
        author_email: authorEmail || undefined,
        title,
        content,
        password,
        is_private: isPrivate,
      });
      navigate('/contact?tab=qna');
    } catch (err) {
      alert(err instanceof Error ? err.message : '작성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[700px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate('/contact?tab=qna')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-kmen-orange transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Q&A 목록으로
          </button>

          <SectionTitle title="질문하기" subtitle="궁금한 점을 자유롭게 질문해주세요." />

          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">작성자 *</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="이름 또는 닉네임"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일 (선택)</label>
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="답변 알림용"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="질문 제목"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">내용 *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="질문 내용을 자세히 작성해주세요."
                rows={8}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호 *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="수정/삭제 시 필요합니다"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-kmen-orange focus:ring-kmen-orange"
              />
              <span className="text-sm text-slate-700">비밀글로 작성</span>
            </label>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-kmen-orange text-white rounded-full text-sm font-medium hover:bg-[#D47A28] transition-colors disabled:opacity-50"
              >
                {submitting ? '등록 중...' : '질문 등록'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
