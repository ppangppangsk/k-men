import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import type { Post } from '../types';
import { api } from '../lib/api';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getPost(Number(id))
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-44 pb-24 text-center text-slate-400">불러오는 중...</div>
    );
  }

  if (!post) {
    return (
      <div className="pt-44 pb-24 text-center">
        <p className="text-slate-400 text-lg mb-4">행사를 찾을 수 없습니다.</p>
        <Link to="/events" className="text-violet-600 hover:underline">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">
        <Link to="/events" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          행사 목록
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 break-keep">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-200">
            {post.event_date && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-violet-600 rounded-full font-medium">
                <Calendar className="w-4 h-4" />
                {new Date(post.event_date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {post.org_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.org_name}
              </span>
            )}
          </div>

          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full rounded-2xl mb-8"
            />
          )}

          <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-violet-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.article>
      </div>
    </section>
  );
}
