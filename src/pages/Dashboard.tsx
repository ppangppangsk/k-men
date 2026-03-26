import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Post } from '../types';

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    api.getMyPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 실패');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
              <p className="text-slate-500 mt-1">안녕하세요, {user?.name}님</p>
            </div>
            <div className="flex gap-3">
              <Button to="/dashboard/new" size="sm">
                <Plus className="w-4 h-4" />
                새 글 작성
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                로그아웃
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg mb-4">아직 작성한 글이 없습니다.</p>
              <Button to="/dashboard/new">
                <Plus className="w-4 h-4" />
                첫 글 작성하기
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id}>
                <Card className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.type === 'news'
                              ? 'bg-sky-100 text-sky-700'
                              : post.type === 'member_activity'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {post.type === 'news' ? '소식' : post.type === 'member_activity' ? '회원 기관 활동' : '행사'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 truncate">{post.title}</h3>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        to={`/dashboard/new?edit=${post.id}`}
                        className="p-2 text-slate-400 hover:text-kmen-orange transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
