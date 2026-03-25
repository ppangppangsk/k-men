import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, FileDown } from 'lucide-react';
import type { Post } from '../types';
import { api } from '../lib/api';

export default function MemberActivityDetail() {
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
        <p className="text-slate-400 text-lg mb-4">활동을 찾을 수 없습니다.</p>
        <Link to="/activities" className="text-kmen-orange hover:underline">
          활동 페이지로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/activities"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-kmen-orange transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            활동 페이지로 돌아가기
          </Link>

          <header className="mb-10">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium mb-4">
              회원사 활동
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4 break-keep">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
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
            {post.file_url && (
              <a
                href={post.file_url}
                download
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors"
              >
                <FileDown className="w-4 h-4" />
                첨부 파일 다운로드
                <span className="text-slate-400">{post.file_url.split('/').pop()}</span>
              </a>
            )}
          </header>

          <div className="h-[2px] mb-10" style={{ background: 'linear-gradient(to right, #E8882F, #F5A623, #34C759, #2BA84A)' }} />

          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full rounded-2xl mb-8"
            />
          )}

          <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-img:rounded-xl prose-img:mx-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.article>
      </div>
    </section>
  );
}
