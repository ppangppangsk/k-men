import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import RainbowDivider from '../components/ui/RainbowDivider';
import type { Post } from '../types';
import { api } from '../lib/api';

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export default function Notice() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPosts('notice')
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle
            title="공지사항"
            subtitle="K-MEN의 주요 공지사항을 확인하세요."
            center
          />

          <RainbowDivider />

          <div className="mt-12">
            {loading ? (
              <div className="text-center py-20 text-slate-400">불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">등록된 공지사항이 없습니다.</div>
            ) : (
              <div className="space-y-12">
                {posts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="group"
                  >
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-kmen-green/10 text-kmen-green rounded-full text-xs font-medium mb-3">
                        공지
                      </span>
                      <Link to={`/notice/${post.id}`}>
                        <h2 className="text-2xl font-bold text-slate-900 group-hover:text-kmen-orange transition-colors break-keep leading-snug">
                          {post.title}
                        </h2>
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        {post.org_name && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {post.org_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {post.image_url && (
                      <Link to={`/notice/${post.id}`}>
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full rounded-2xl mb-4"
                        />
                      </Link>
                    )}

                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                      {stripHtml(post.content).slice(0, 200)}
                    </p>

                    <div className="mt-4">
                      <Link
                        to={`/notice/${post.id}`}
                        className="text-sm text-kmen-orange hover:text-[#D47A28] font-medium"
                      >
                        자세히 보기 →
                      </Link>
                    </div>

                    {i < posts.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mt-12" />
                    )}
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
