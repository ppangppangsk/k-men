import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, CheckCircle, Trash2, Pencil } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { QnA } from '../types';

export default function QnADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [post, setPost] = useState<QnA | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Admin answer
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await api.qna.getOne(Number(id));
      setPost(data);
      if (data.is_private && data.content === null) {
        setNeedsPassword(true);
      }
      if (data.answer) {
        setAnswerText(data.answer);
      }
    } catch {
      navigate('/contact?tab=qna');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!passwordInput) return;
    setVerifying(true);
    setPasswordError('');
    try {
      const data = await api.qna.verify(Number(id), passwordInput);
      setPost(data);
      setNeedsPassword(false);
      if (data.answer) setAnswerText(data.answer);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호가 일치하지 않습니다.');
    } finally {
      setVerifying(false);
    }
  };

  const handleAnswer = async () => {
    if (!answerText.trim()) return;
    setAnswerSubmitting(true);
    try {
      await api.qna.answer(Number(id), answerText);
      setPost((prev) => prev ? { ...prev, answer: answerText, answered_at: new Date().toISOString() } : prev);
      setShowAnswerForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '답변 등록 실패');
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim() || !editPassword) {
      alert('제목, 내용, 비밀번호를 모두 입력해주세요.');
      return;
    }
    setEditSubmitting(true);
    try {
      await api.qna.update(Number(id), { title: editTitle, content: editContent, password: editPassword });
      setPost((prev) => prev ? { ...prev, title: editTitle, content: editContent } : prev);
      setEditing(false);
      setEditPassword('');
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정 실패');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin && !deletePassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    try {
      await api.qna.delete(Number(id), isAdmin ? undefined : deletePassword);
      navigate('/contact?tab=qna');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  if (loading) {
    return (
      <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto text-center py-20 text-slate-400">불러오는 중...</div>
      </section>
    );
  }

  if (!post) return null;

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">
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

          {/* Password Modal for private posts */}
          {needsPassword ? (
            <div className="max-w-md mx-auto text-center py-12">
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 mb-2">비밀글입니다</h2>
              <p className="text-sm text-slate-500 mb-6">내용을 확인하려면 비밀번호를 입력해주세요.</p>
              <div className="flex gap-2 max-w-xs mx-auto">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="비밀번호"
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="px-5 py-2.5 bg-kmen-orange text-white rounded-xl text-sm font-medium hover:bg-[#D47A28] transition-colors disabled:opacity-50"
                >
                  {verifying ? '...' : '확인'}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
            </div>
          ) : editing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <SectionTitle title="질문 수정" />
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange resize-y"
              />
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="비밀번호 확인"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setEditing(false); setEditPassword(''); }}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-full text-sm transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleEdit}
                  disabled={editSubmitting}
                  className="px-6 py-2.5 bg-kmen-orange text-white rounded-full text-sm font-medium hover:bg-[#D47A28] transition-colors disabled:opacity-50"
                >
                  {editSubmitting ? '수정 중...' : '수정 완료'}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div>
              {/* Post Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {post.is_private && <Lock className="w-4 h-4 text-slate-400" />}
                  {post.answer && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      답변완료
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{post.author_name}</span>
                  <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => {
                    setEditTitle(post.title);
                    setEditContent(post.content || '');
                    setEditing(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-500 hover:text-kmen-orange hover:bg-orange-50 rounded-full transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  수정
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  삭제
                </button>
              </div>

              {/* Admin Answer */}
              {post.answer && (
                <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-green-600 text-white rounded-full text-xs font-medium">관리자 답변</span>
                    {post.answered_at && (
                      <span className="text-xs text-slate-400">
                        {new Date(post.answered_at).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{post.answer}</p>
                </div>
              )}

              {/* Admin Answer Form */}
              {isAdmin && (
                <div className="mt-6">
                  {showAnswerForm ? (
                    <div className="bg-orange-50 rounded-xl p-6 space-y-3">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {post.answer ? '답변 수정' : '답변 작성'}
                      </h3>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={5}
                        placeholder="답변을 작성해주세요."
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange resize-y"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowAnswerForm(false)}
                          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleAnswer}
                          disabled={answerSubmitting}
                          className="px-5 py-2 bg-kmen-orange text-white text-sm font-medium rounded-full hover:bg-[#D47A28] transition-colors disabled:opacity-50"
                        >
                          {answerSubmitting ? '등록 중...' : '답변 등록'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAnswerForm(true)}
                      className="px-5 py-2.5 bg-kmen-orange text-white rounded-full text-sm font-medium hover:bg-[#D47A28] transition-colors"
                    >
                      {post.answer ? '답변 수정' : '답변 작성'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                <h3 className="font-bold text-slate-900 mb-2">게시글 삭제</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {isAdmin ? '관리자 권한으로 삭제하시겠습니까?' : '비밀번호를 입력하면 삭제됩니다.'}
                </p>
                {!isAdmin && (
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="비밀번호"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange mb-4"
                  />
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
