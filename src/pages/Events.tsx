import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, MapPin } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import type { Post } from '../types';
import { api } from '../lib/api';

export default function Events() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPosts('event')
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle title="행사" subtitle="K-MEN이 진행하거나 참여하는 행사 정보입니다." center={false} />
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">아직 등록된 행사가 없습니다.</p>
            <p className="text-sm mt-2">곧 새로운 행사 정보가 업데이트됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/events/${post.id}`}>
                  <Card className="p-6 h-full" hover gradientBar>
                    <div className="flex gap-5">
                      {post.event_date && (
                        <div className="shrink-0 w-16 h-16 bg-kmen-orange/10 text-kmen-orange rounded-2xl flex flex-col items-center justify-center">
                          <span className="text-xs font-medium">
                            {new Date(post.event_date).toLocaleDateString('ko-KR', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold leading-tight">
                            {new Date(post.event_date).getDate()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 break-keep">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-3 break-keep">
                          {post.content.replace(/<[^>]*>/g, '')}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          {post.event_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(post.event_date).toLocaleDateString('ko-KR')}
                            </span>
                          )}
                          {post.org_name && <span>· {post.org_name}</span>}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
