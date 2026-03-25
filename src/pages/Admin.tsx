import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Check, X, Trash2, Users, FileText, LogOut, Shield, Image, Upload,
  Film, FileDown, Newspaper, Pencil, Plus, HelpCircle, MessageSquare,
  ChevronUp, ChevronDown, Bell, BookText,
} from 'lucide-react';
import Button from '../components/ui/Button';
import RichTextEditor from '../components/ui/RichTextEditor';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Organization, Post, Media, FAQ, QnA } from '../types';

type Tab = 'orgs' | 'posts' | 'press' | 'notice' | 'document' | 'media' | 'faq' | 'qna';

const categoryLabels: Record<string, string> = {
  photo: '사진',
  video: '영상',
  document: '문서',
};

const categoryIcons: Record<string, typeof Image> = {
  photo: Image,
  video: Film,
  document: FileDown,
};

/* ==============================
 *  Post Form (소식/행사/보도자료 공용)
 * ============================== */
function PostForm({
  postType,
  editingPost,
  onSave,
  onCancel,
}: {
  postType: 'news' | 'event' | 'press_release' | 'notice' | 'document';
  editingPost: Post | null;
  onSave: (post: Post) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(editingPost?.title ?? '');
  const [content, setContent] = useState(editingPost?.content ?? '');
  const [imageUrl, setImageUrl] = useState(editingPost?.image_url ?? '');
  const [eventDate, setEventDate] = useState(editingPost?.event_date ?? '');
  const [summary, setSummary] = useState(editingPost?.summary ?? '');
  const [selectedType, setSelectedType] = useState<'news' | 'event'>(
    editingPost?.type === 'event' ? 'event' : 'news',
  );
  const [fileUrl, setFileUrl] = useState(editingPost?.file_url ?? '');
  const [fileUploading, setFileUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fixedTypes = ['press_release', 'notice', 'document'] as const;
  const actualType = (fixedTypes as readonly string[]).includes(postType) ? postType : selectedType;

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const result = await api.uploadPostFile(file);
    return result.url;
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      let saved: Post;
      if (editingPost) {
        saved = await api.updatePost(editingPost.id, {
          title,
          content,
          image_url: imageUrl || undefined,
          event_date: actualType === 'event' ? eventDate || undefined : undefined,
          summary: postType === 'document' ? summary || undefined : undefined,
          file_url: fileUrl || undefined,
        });
      } else {
        saved = await api.createPost({
          title,
          content,
          type: actualType as Post['type'],
          image_url: imageUrl || undefined,
          event_date: actualType === 'event' ? eventDate || undefined : undefined,
          summary: postType === 'document' ? summary || undefined : undefined,
          file_url: fileUrl || undefined,
        });
      }
      onSave(saved);
      if (!editingPost) {
        setTitle('');
        setContent('');
        setImageUrl('');
        setEventDate('');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-orange-50 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">
          {editingPost ? '수정하기' : '새 글 작성'}
        </h3>
        {editingPost && (
          <button
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            취소
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Type selector for news/event only */}
        {postType === 'news' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedType('news')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === 'news'
                  ? 'bg-kmen-orange text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              소식
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('event')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === 'event'
                  ? 'bg-kmen-orange text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              행사
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white"
        />

        {actualType === 'event' && (
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white"
          />
        )}

        <input
          type="text"
          placeholder="대표 이미지 URL (선택, 목록 썸네일용)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white"
        />

        {postType === 'document' && (
          <textarea
            placeholder="요약문 (목록에 표시됩니다)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white resize-y"
          />
        )}

        {/* PDF 첨부 */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">PDF 첨부 (선택)</label>
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
              className="text-sm"
            />
            {fileUploading && <span className="text-xs text-slate-400">업로드 중...</span>}
            {fileUrl && !fileUploading && (
              <span className="text-xs text-green-600">첨부 완료</span>
            )}
          </div>
        </div>

        <RichTextEditor
          content={content}
          onChange={setContent}
          onImageUpload={handleImageUpload}
          placeholder="내용을 입력하세요..."
        />

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-kmen-orange text-white rounded-full text-sm font-medium hover:bg-[#D47A28] transition-colors disabled:opacity-50"
          >
            {submitting
              ? '저장 중...'
              : editingPost
                ? '수정 완료'
                : postType === 'press_release'
                  ? '보도자료 등록'
                  : postType === 'notice'
                    ? '공지사항 등록'
                    : postType === 'document'
                      ? '문서 자료 등록'
                      : '게시하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==============================
 *  Media Edit Modal
 * ============================== */
function MediaEditModal({
  item,
  onSave,
  onClose,
}: {
  item: Media;
  onSave: (updated: Media) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.media.update(item.id, {
        title: title || undefined,
        description: description || undefined,
      });
      onSave(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : '수정 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-slate-900 mb-4">자료 정보 수정</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange resize-y"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-kmen-orange text-white text-sm font-medium rounded-full hover:bg-[#D47A28] transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==============================
 *  Admin Page
 * ============================== */
export default function Admin() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('orgs');
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pressReleases, setPressReleases] = useState<Post[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'photo' | 'video' | 'document'>('photo');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Post editing
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);

  // Press editing
  const [editingPress, setEditingPress] = useState<Post | null>(null);
  const [showPressForm, setShowPressForm] = useState(false);

  // Notice state
  const [notices, setNotices] = useState<Post[]>([]);
  const [editingNotice, setEditingNotice] = useState<Post | null>(null);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  // Document state
  const [documentPosts, setDocumentPosts] = useState<Post[]>([]);
  const [editingDocument, setEditingDocument] = useState<Post | null>(null);
  const [showDocumentForm, setShowDocumentForm] = useState(false);

  // Media editing
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);

  // FAQ state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqSortOrder, setFaqSortOrder] = useState(0);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // QnA state
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [answeringQna, setAnsweringQna] = useState<number | null>(null);
  const [qnaAnswerText, setQnaAnswerText] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgData, postData, mediaData, pressData, faqData, qnaData, noticeData, documentData] = await Promise.all([
        api.admin.getOrganizations(),
        api.admin.getPosts(),
        api.media.getAll(),
        api.getPosts('press_release'),
        api.faq.getAll(),
        api.qna.getAll(),
        api.getPosts('notice'),
        api.getPosts('document'),
      ]);
      setOrgs(orgData);
      setPosts(postData);
      setMedia(mediaData);
      setPressReleases(pressData);
      setFaqs(faqData);
      setQnas(qnaData);
      setNotices(noticeData);
      setDocumentPosts(documentData);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  /* --- Org handlers --- */
  const handleApprove = async (id: number) => {
    await api.admin.approveOrg(id);
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, approved: true } : o)));
  };

  const handleRevoke = async (id: number) => {
    await api.admin.revokeOrg(id);
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, approved: false } : o)));
  };

  const handleDeleteOrg = async (id: number) => {
    if (!confirm('해당 단체와 모든 게시글이 삭제됩니다. 계속하시겠습니까?')) return;
    await api.admin.deleteOrg(id);
    setOrgs((prev) => prev.filter((o) => o.id !== id));
    setPosts((prev) => prev.filter((p) => p.org_id !== id));
  };

  /* --- Post handlers --- */
  const handleDeletePost = async (id: number) => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    await api.admin.deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePostSave = (saved: Post) => {
    if (editingPost) {
      setPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setEditingPost(null);
    } else {
      setPosts((prev) => [saved, ...prev]);
    }
    setShowPostForm(false);
  };

  /* --- Press handlers --- */
  const handleDeletePress = async (id: number) => {
    if (!confirm('보도자료를 삭제하시겠습니까?')) return;
    await api.deletePost(id);
    setPressReleases((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePressSave = (saved: Post) => {
    if (editingPress) {
      setPressReleases((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setEditingPress(null);
    } else {
      setPressReleases((prev) => [saved, ...prev]);
    }
    setShowPressForm(false);
  };

  /* --- Notice handlers --- */
  const handleDeleteNotice = async (id: number) => {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return;
    await api.deletePost(id);
    setNotices((prev) => prev.filter((p) => p.id !== id));
  };

  const handleNoticeSave = (saved: Post) => {
    if (editingNotice) {
      setNotices((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setEditingNotice(null);
    } else {
      setNotices((prev) => [saved, ...prev]);
    }
    setShowNoticeForm(false);
  };

  /* --- Document handlers --- */
  const handleDeleteDocument = async (id: number) => {
    if (!confirm('문서 자료를 삭제하시겠습니까?')) return;
    await api.deletePost(id);
    setDocumentPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDocumentSave = (saved: Post) => {
    if (editingDocument) {
      setDocumentPosts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setEditingDocument(null);
    } else {
      setDocumentPosts((prev) => [saved, ...prev]);
    }
    setShowDocumentForm(false);
  };

  /* --- Media handlers --- */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      alert('파일을 먼저 선택해주세요.');
      return;
    }
    setUploading(true);
    try {
      await api.media.upload(uploadFile, {
        category: uploadCategory,
        title: uploadTitle || undefined,
        description: uploadDescription || undefined,
      });
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const mediaData = await api.media.getAll();
      setMedia(mediaData);
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!confirm('파일을 삭제하시겠습니까?')) return;
    await api.media.delete(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMediaSave = (updated: Media) => {
    setMedia((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingMedia(null);
  };

  /* --- FAQ handlers --- */
  const handleFaqSubmit = async () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      alert('질문과 답변을 모두 입력해주세요.');
      return;
    }
    try {
      if (editingFaq) {
        const updated = await api.faq.update(editingFaq.id, {
          question: faqQuestion,
          answer: faqAnswer,
          sort_order: faqSortOrder,
        });
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
        setEditingFaq(null);
      } else {
        const created = await api.faq.create({
          question: faqQuestion,
          answer: faqAnswer,
          sort_order: faqSortOrder,
        });
        setFaqs((prev) => [...prev, created]);
      }
      setFaqQuestion('');
      setFaqAnswer('');
      setFaqSortOrder(0);
    } catch (err) {
      alert(err instanceof Error ? err.message : '저장 실패');
    }
  };

  const handleFaqDelete = async (id: number) => {
    if (!confirm('FAQ를 삭제하시겠습니까?')) return;
    await api.faq.delete(id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const startEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqSortOrder(faq.sort_order);
  };

  /* --- QnA handlers --- */
  const handleQnaAnswer = async (id: number) => {
    if (!qnaAnswerText.trim()) return;
    try {
      await api.qna.answer(id, qnaAnswerText);
      setQnas((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, answer: qnaAnswerText, answered_at: new Date().toISOString() } : q,
        ),
      );
      setAnsweringQna(null);
      setQnaAnswerText('');
    } catch (err) {
      alert(err instanceof Error ? err.message : '답변 등록 실패');
    }
  };

  const handleQnaDelete = async (id: number) => {
    if (!confirm('Q&A 게시글을 삭제하시겠습니까?')) return;
    await api.qna.delete(id);
    setQnas((prev) => prev.filter((q) => q.id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !isAdmin) return null;

  const pendingCount = orgs.filter((o) => !o.approved).length;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const typeBadge = (type: string) => {
    switch (type) {
      case 'news': return { label: '소식', cls: 'bg-sky-100 text-sky-700' };
      case 'event': return { label: '행사', cls: 'bg-amber-100 text-amber-700' };
      case 'notice': return { label: '공지', cls: 'bg-green-100 text-green-700' };
      case 'document': return { label: '문서', cls: 'bg-slate-100 text-slate-600' };
      case 'member_activity': return { label: '회원사 활동', cls: 'bg-teal-100 text-teal-700' };
      default: return { label: '보도자료', cls: 'bg-orange-100 text-kmen-orange' };
    }
  };

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-kmen-orange" />
              <div>
                <h1 className="text-3xl font-bold text-slate-900">관리자</h1>
                <p className="text-slate-500 text-sm">{user?.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-200 overflow-x-auto">
            {([
              { key: 'orgs' as Tab, icon: Users, label: '단체 관리', badge: pendingCount > 0 ? pendingCount : null, badgeColor: 'bg-red-100 text-red-600' },
              { key: 'posts' as Tab, icon: FileText, label: '소식/행사', badge: posts.filter((p) => !['press_release', 'notice', 'document'].includes(p.type)).length, badgeColor: 'bg-slate-100 text-slate-600' },
              { key: 'press' as Tab, icon: Newspaper, label: '보도자료', badge: pressReleases.length, badgeColor: 'bg-orange-100 text-kmen-orange' },
              { key: 'notice' as Tab, icon: Bell, label: '공지사항', badge: notices.length, badgeColor: 'bg-green-100 text-green-700' },
              { key: 'document' as Tab, icon: BookText, label: '문서 자료', badge: documentPosts.length, badgeColor: 'bg-slate-100 text-slate-600' },
              { key: 'media' as Tab, icon: Image, label: '미디어', badge: media.length, badgeColor: 'bg-slate-100 text-slate-600' },
              { key: 'faq' as Tab, icon: HelpCircle, label: 'FAQ', badge: faqs.length, badgeColor: 'bg-slate-100 text-slate-600' },
              { key: 'qna' as Tab, icon: MessageSquare, label: 'Q&A', badge: qnas.filter((q) => !q.answer).length || null, badgeColor: 'bg-red-100 text-red-600' },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setEditingPost(null);
                  setEditingPress(null);
                  setEditingNotice(null);
                  setEditingDocument(null);
                  setShowPostForm(false);
                  setShowPressForm(false);
                  setShowNoticeForm(false);
                  setShowDocumentForm(false);
                }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'border-kmen-orange text-kmen-orange'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.badge !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">불러오는 중...</div>
          ) : tab === 'orgs' ? (
            /* ===== Organizations Tab ===== */
            <div className="space-y-3">
              {orgs.length === 0 ? (
                <div className="text-center py-20 text-slate-400">등록된 단체가 없습니다.</div>
              ) : (
                orgs.map((org) => (
                  <div
                    key={org.id}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 rounded-xl border transition-colors ${
                      !org.approved ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{org.name}</span>
                        {org.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-orange-100 text-kmen-orange rounded-full text-xs font-medium">관리자</span>
                        )}
                        {!org.approved && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">승인 대기</span>
                        )}
                        {org.approved && org.role !== 'admin' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">승인됨</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">
                        {org.email} · 가입일 {new Date(org.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!org.approved ? (
                        <button onClick={() => handleApprove(org.id)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors">
                          <Check className="w-4 h-4" /> 승인
                        </button>
                      ) : org.role !== 'admin' ? (
                        <button onClick={() => handleRevoke(org.id)} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors">
                          <X className="w-4 h-4" /> 승인 취소
                        </button>
                      ) : null}
                      {org.role !== 'admin' && (
                        <button onClick={() => handleDeleteOrg(org.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="단체 삭제">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : tab === 'posts' ? (
            /* ===== Posts Tab (소식/행사) ===== */
            <div>
              {/* Create/Edit Form */}
              {(showPostForm || editingPost) ? (
                <PostForm
                  key={editingPost?.id ?? 'new'}
                  postType="news"
                  editingPost={editingPost}
                  onSave={handlePostSave}
                  onCancel={() => { setEditingPost(null); setShowPostForm(false); }}
                />
              ) : (
                <button
                  onClick={() => setShowPostForm(true)}
                  className="flex items-center gap-2 px-5 py-3 mb-6 bg-orange-50 text-kmen-orange rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors w-full justify-center border-2 border-dashed border-kmen-orange/30"
                >
                  <Plus className="w-4 h-4" />
                  새 소식/행사 작성
                </button>
              )}

              {/* Post List */}
              <div className="space-y-3">
                {posts.filter((p) => !['press_release', 'notice', 'document'].includes(p.type)).length === 0 ? (
                  <div className="text-center py-20 text-slate-400">게시글이 없습니다.</div>
                ) : (
                  posts
                    .filter((p) => !['press_release', 'notice', 'document'].includes(p.type))
                    .map((post) => {
                      const badge = typeBadge(post.type);
                      return (
                        <div key={post.id} className="flex justify-between items-start gap-4 p-5 bg-white rounded-xl border border-slate-200">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                                {badge.label}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(post.created_at).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">작성: {post.org_name}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => { setEditingPost(post); setShowPostForm(false); }}
                              className="p-2 text-slate-400 hover:text-kmen-orange transition-colors"
                              title="수정"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          ) : tab === 'press' ? (
            /* ===== Press Release Tab ===== */
            <div>
              {/* Create/Edit Form */}
              {(showPressForm || editingPress) ? (
                <PostForm
                  key={editingPress?.id ?? 'new-press'}
                  postType="press_release"
                  editingPost={editingPress}
                  onSave={handlePressSave}
                  onCancel={() => { setEditingPress(null); setShowPressForm(false); }}
                />
              ) : (
                <button
                  onClick={() => setShowPressForm(true)}
                  className="flex items-center gap-2 px-5 py-3 mb-6 bg-orange-50 text-kmen-orange rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors w-full justify-center border-2 border-dashed border-kmen-orange/30"
                >
                  <Plus className="w-4 h-4" />
                  새 보도자료 작성
                </button>
              )}

              {/* Press Release List */}
              <div className="space-y-3">
                {pressReleases.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">등록된 보도자료가 없습니다.</div>
                ) : (
                  pressReleases.map((pr) => (
                    <div key={pr.id} className="flex justify-between items-start gap-4 p-5 bg-white rounded-xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-kmen-orange">
                            보도자료
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(pr.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 truncate">{pr.title}</h3>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingPress(pr); setShowPressForm(false); }}
                          className="p-2 text-slate-400 hover:text-kmen-orange transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePress(pr.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : tab === 'notice' ? (
            /* ===== Notice Tab ===== */
            <div>
              {(showNoticeForm || editingNotice) ? (
                <PostForm
                  key={editingNotice?.id ?? 'new-notice'}
                  postType="notice"
                  editingPost={editingNotice}
                  onSave={handleNoticeSave}
                  onCancel={() => { setEditingNotice(null); setShowNoticeForm(false); }}
                />
              ) : (
                <button
                  onClick={() => setShowNoticeForm(true)}
                  className="flex items-center gap-2 px-5 py-3 mb-6 bg-orange-50 text-kmen-orange rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors w-full justify-center border-2 border-dashed border-kmen-orange/30"
                >
                  <Plus className="w-4 h-4" />
                  새 공지사항 작성
                </button>
              )}

              <div className="space-y-3">
                {notices.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">등록된 공지사항이 없습니다.</div>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className="flex justify-between items-start gap-4 p-5 bg-white rounded-xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            공지
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 truncate">{notice.title}</h3>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingNotice(notice); setShowNoticeForm(false); }}
                          className="p-2 text-slate-400 hover:text-kmen-orange transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : tab === 'document' ? (
            /* ===== Document Tab ===== */
            <div>
              {(showDocumentForm || editingDocument) ? (
                <PostForm
                  key={editingDocument?.id ?? 'new-document'}
                  postType="document"
                  editingPost={editingDocument}
                  onSave={handleDocumentSave}
                  onCancel={() => { setEditingDocument(null); setShowDocumentForm(false); }}
                />
              ) : (
                <button
                  onClick={() => setShowDocumentForm(true)}
                  className="flex items-center gap-2 px-5 py-3 mb-6 bg-orange-50 text-kmen-orange rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors w-full justify-center border-2 border-dashed border-kmen-orange/30"
                >
                  <Plus className="w-4 h-4" />
                  새 문서 자료 작성
                </button>
              )}

              <div className="space-y-3">
                {documentPosts.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">등록된 문서 자료가 없습니다.</div>
                ) : (
                  documentPosts.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-start gap-4 p-5 bg-white rounded-xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            문서
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                        {doc.summary && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{doc.summary}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingDocument(doc); setShowDocumentForm(false); }}
                          className="p-2 text-slate-400 hover:text-kmen-orange transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : tab === 'media' ? (
            /* ===== Media Tab ===== */
            <div>
              {/* Upload Form */}
              <div className="bg-orange-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-slate-900 mb-4">파일 업로드</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {(['photo', 'video'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setUploadCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          uploadCategory === cat
                            ? 'bg-kmen-orange text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {categoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="제목 (선택)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white"
                  />
                  <textarea
                    placeholder="설명 (선택)"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white resize-y"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/mp4,video/webm,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      파일 선택
                    </button>
                    {uploadFile && (
                      <span className="text-sm text-slate-600 truncate flex-1">
                        {uploadFile.name}
                      </span>
                    )}
                    <button
                      onClick={handleUploadSubmit}
                      disabled={uploading || !uploadFile}
                      className="flex items-center gap-2 px-6 py-2 bg-kmen-orange text-white rounded-full text-sm font-medium hover:bg-[#D47A28] transition-colors disabled:opacity-50 ml-auto"
                    >
                      {uploading ? '업로드 중...' : '등록'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    지원: 이미지(JPG, PNG, GIF, WebP), 영상(MP4, WebM), 문서(PDF) · 최대 50MB
                  </p>
                </div>
              </div>

              {/* Media Grid */}
              {media.length === 0 ? (
                <div className="text-center py-20 text-slate-400">업로드된 자료가 없습니다.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {media.map((item) => {
                    const Icon = categoryIcons[item.category] || Image;
                    const isImage = item.mime_type.startsWith('image/');
                    const isVideo = item.mime_type.startsWith('video/');

                    return (
                      <div key={item.id} className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {/* Preview */}
                        <div className="aspect-square bg-slate-50 flex items-center justify-center">
                          {isImage ? (
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                          ) : isVideo ? (
                            <video src={item.url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <Icon className="w-10 h-10" />
                              <span className="text-xs">{item.mime_type.split('/')[1]?.toUpperCase()}</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.category === 'photo' ? 'bg-blue-50 text-blue-600' :
                              item.category === 'video' ? 'bg-purple-50 text-purple-600' :
                              'bg-slate-50 text-slate-600'
                            }`}>
                              {categoryLabels[item.category]}
                            </span>
                            <span className="text-xs text-slate-400">{formatSize(item.size)}</span>
                          </div>
                        </div>

                        {/* Action overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingMedia(item)}
                            className="p-1.5 bg-white text-slate-600 rounded-full shadow hover:bg-orange-50 hover:text-kmen-orange transition-colors"
                            title="수정"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="p-1.5 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Media Edit Modal */}
              {editingMedia && (
                <MediaEditModal
                  item={editingMedia}
                  onSave={handleMediaSave}
                  onClose={() => setEditingMedia(null)}
                />
              )}
            </div>
          ) : tab === 'faq' ? (
            /* ===== FAQ Tab ===== */
            <div>
              {/* FAQ Form */}
              <div className="bg-orange-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">
                    {editingFaq ? 'FAQ 수정' : '새 FAQ 추가'}
                  </h3>
                  {editingFaq && (
                    <button
                      onClick={() => { setEditingFaq(null); setFaqQuestion(''); setFaqAnswer(''); setFaqSortOrder(0); }}
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      취소
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="질문"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white"
                  />
                  <textarea
                    placeholder="답변"
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white resize-y"
                  />
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-600">순서:</label>
                    <input
                      type="number"
                      value={faqSortOrder}
                      onChange={(e) => setFaqSortOrder(Number(e.target.value))}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange bg-white"
                    />
                    <button
                      onClick={handleFaqSubmit}
                      className="flex items-center gap-2 px-6 py-2.5 bg-kmen-orange text-white rounded-full text-sm font-medium hover:bg-[#D47A28] transition-colors ml-auto"
                    >
                      {editingFaq ? '수정 완료' : 'FAQ 추가'}
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {faqs.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">등록된 FAQ가 없습니다.</div>
                ) : (
                  faqs.sort((a, b) => a.sort_order - b.sort_order).map((faq) => (
                    <div key={faq.id} className="p-5 bg-white rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-kmen-orange font-bold text-sm">Q</span>
                            <span className="font-semibold text-slate-900 text-sm">{faq.question}</span>
                            <span className="text-xs text-slate-400 ml-2">#{faq.sort_order}</span>
                          </div>
                          <div className="flex items-start gap-2 mt-2">
                            <span className="text-kmen-green font-bold text-sm">A</span>
                            <p className="text-slate-600 text-sm whitespace-pre-wrap">{faq.answer}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEditFaq(faq)}
                            className="p-2 text-slate-400 hover:text-kmen-orange transition-colors"
                            title="수정"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFaqDelete(faq.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : tab === 'qna' ? (
            /* ===== QnA Tab ===== */
            <div className="space-y-3">
              {qnas.length === 0 ? (
                <div className="text-center py-20 text-slate-400">등록된 Q&A가 없습니다.</div>
              ) : (
                qnas.map((qna) => (
                  <div key={qna.id} className="p-5 bg-white rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {qna.is_private && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">비밀</span>
                          )}
                          {qna.answer ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">답변완료</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">미답변</span>
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(qna.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">{qna.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">작성자: {qna.author_name}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => {
                            if (answeringQna === qna.id) {
                              setAnsweringQna(null);
                              setQnaAnswerText('');
                            } else {
                              setAnsweringQna(qna.id);
                              setQnaAnswerText(qna.answer || '');
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-kmen-orange transition-colors"
                          title={qna.answer ? '답변 수정' : '답변 작성'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQnaDelete(qna.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Answer Form */}
                    {answeringQna === qna.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <textarea
                          value={qnaAnswerText}
                          onChange={(e) => setQnaAnswerText(e.target.value)}
                          rows={4}
                          placeholder="답변을 작성해주세요."
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kmen-orange resize-y"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setAnsweringQna(null); setQnaAnswerText(''); }}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleQnaAnswer(qna.id)}
                            className="px-5 py-2 bg-kmen-orange text-white text-sm font-medium rounded-full hover:bg-[#D47A28] transition-colors"
                          >
                            답변 등록
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
