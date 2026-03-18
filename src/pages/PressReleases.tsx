import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import RainbowDivider from '../components/ui/RainbowDivider';
import type { Post } from '../types';
import { api } from '../lib/api';

export default function PressReleases() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPosts('press_release')
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
            title="보도자료"
            subtitle="K-MEN의 공식 보도자료를 확인하세요."
            center
          />

          <RainbowDivider />

          <div className="mt-12">
            {loading ? (
              <div className="text-center py-20 text-slate-400">불러오는 중...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">등록된 보도자료가 없습니다.</div>
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
                    {/* Header */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-kmen-orange/10 text-kmen-orange rounded-full text-xs font-medium mb-3">
                        보도자료
                      </span>
                      <Link to={`/press-release/${post.id}`}>
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

                    {/* Representative Image */}
                    {post.image_url && (
                      <Link to={`/press-release/${post.id}`}>
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full rounded-2xl mb-4"
                        />
                      </Link>
                    )}

                    {/* Preview */}
                    <p className="text-slate-500 text-[15px] leading-[1.8] line-clamp-3">
                      {post.content.replace(/<[^>]*>/g, '').slice(0, 200)}
                    </p>

                    {/* Read more link */}
                    <div className="mt-4">
                      <Link
                        to={`/press-release/${post.id}`}
                        className="text-sm text-kmen-orange hover:text-[#D47A28] font-medium"
                      >
                        자세히 보기 →
                      </Link>
                    </div>

                    {/* Divider between posts */}
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
