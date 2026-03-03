import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, X, Trash2, Users, FileText, LogOut, Shield, Image, Upload, Film, FileDown } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Organization, Post, Media } from '../types';

type Tab = 'orgs' | 'posts' | 'media';

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

export default function Admin() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('orgs');
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'photo' | 'video' | 'document'>('photo');
  const [uploadTitle, setUploadTitle] = useState('');

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
      const [orgData, postData, mediaData] = await Promise.all([
        api.admin.getOrganizations(),
        api.admin.getPosts(),
        api.media.getAll(),
      ]);
      setOrgs(orgData);
      setPosts(postData);
      setMedia(mediaData);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeletePost = async (id: number) => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    await api.admin.deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await api.media.upload(file, {
        category: uploadCategory,
        title: uploadTitle || undefined,
      });
      setUploadTitle('');
      const mediaData = await api.media.getAll();
      setMedia(mediaData);
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!confirm('파일을 삭제하시겠습니까?')) return;
    await api.media.delete(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
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
              <Shield className="w-8 h-8 text-violet-600" />
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
              { key: 'posts' as Tab, icon: FileText, label: '게시글 관리', badge: posts.length, badgeColor: 'bg-slate-100 text-slate-600' },
              { key: 'media' as Tab, icon: Image, label: '자료 관리', badge: media.length, badgeColor: 'bg-slate-100 text-slate-600' },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'border-violet-600 text-violet-600'
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
                          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">관리자</span>
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
            /* ===== Posts Tab ===== */
            <div className="space-y-3">
              {posts.length === 0 ? (
                <div className="text-center py-20 text-slate-400">게시글이 없습니다.</div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="flex justify-between items-start gap-4 p-5 bg-white rounded-xl border border-slate-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${post.type === 'news' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                          {post.type === 'news' ? '소식' : '행사'}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">작성: {post.org_name}</p>
                    </div>
                    <button onClick={() => handleDeletePost(post.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0" title="게시글 삭제">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ===== Media Tab ===== */
            <div>
              {/* Upload Form */}
              <div className="bg-violet-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-slate-900 mb-4">파일 업로드</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2">
                    {(['photo', 'video', 'document'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setUploadCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          uploadCategory === cat
                            ? 'bg-violet-600 text-white'
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
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? '업로드 중...' : '파일 선택'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  지원: 이미지(JPG, PNG, GIF, WebP), 영상(MP4, WebM), 문서(PDF) · 최대 50MB
                </p>
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

                        {/* Delete overlay */}
                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
