import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, X, Trash2, Users, FileText, LogOut, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Organization, Post } from '../types';

type Tab = 'orgs' | 'posts';

export default function Admin() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('orgs');
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [orgData, postData] = await Promise.all([
        api.admin.getOrganizations(),
        api.admin.getPosts(),
      ]);
      setOrgs(orgData);
      setPosts(postData);
    } catch {
      // 권한 없으면 로그인으로
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !isAdmin) return null;

  const pendingCount = orgs.filter((o) => !o.approved).length;

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
          <div className="flex gap-2 mb-8 border-b border-slate-200">
            <button
              onClick={() => setTab('orgs')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === 'orgs'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              단체 관리
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('posts')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === 'posts'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              게시글 관리
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                {posts.length}
              </span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">불러오는 중...</div>
          ) : tab === 'orgs' ? (
            /* Organizations Tab */
            <div className="space-y-3">
              {orgs.length === 0 ? (
                <div className="text-center py-20 text-slate-400">등록된 단체가 없습니다.</div>
              ) : (
                orgs.map((org) => (
                  <div
                    key={org.id}
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 rounded-xl border transition-colors ${
                      !org.approved
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{org.name}</span>
                        {org.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                            관리자
                          </span>
                        )}
                        {!org.approved && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            승인 대기
                          </span>
                        )}
                        {org.approved && org.role !== 'admin' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            승인됨
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">
                        {org.email} · 가입일 {new Date(org.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {!org.approved ? (
                        <button
                          onClick={() => handleApprove(org.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          승인
                        </button>
                      ) : org.role !== 'admin' ? (
                        <button
                          onClick={() => handleRevoke(org.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          승인 취소
                        </button>
                      ) : null}

                      {org.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteOrg(org.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="단체 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Posts Tab */
            <div className="space-y-3">
              {posts.length === 0 ? (
                <div className="text-center py-20 text-slate-400">게시글이 없습니다.</div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex justify-between items-start gap-4 p-5 bg-white rounded-xl border border-slate-200"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.type === 'news'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {post.type === 'news' ? '소식' : '행사'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        작성: {post.org_name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                      title="게시글 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
