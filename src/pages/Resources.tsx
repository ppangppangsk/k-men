import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Image, Film, FileText, Download, Calendar, User, LayoutGrid, Square, Maximize2 } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import { api } from '../lib/api';
import type { Media, Post } from '../types';

type Tab = 'photo' | 'video' | 'document';

const tabConfig: { key: Tab; label: string; icon: typeof Image }[] = [
  { key: 'photo', label: '사진', icon: Image },
  { key: 'video', label: '영상', icon: Film },
  { key: 'document', label: '문서', icon: FileText },
];

export default function Resources() {
  const [media, setMedia] = useState<Media[]>([]);
  const [documents, setDocuments] = useState<Post[]>([]);
  const [tab, setTab] = useState<Tab>('photo');
  const [viewSize, setViewSize] = useState<'large' | 'medium' | 'small'>('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.media.getAll(), api.getPosts('document')])
      .then(([mediaData, docData]) => {
        setMedia(mediaData);
        setDocuments(docData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredMedia = media.filter((m) => m.category === tab);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '');
  }

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle
            title="자료실"
            subtitle="K-MEN의 활동 자료, 사진, 영상, 문서를 확인하세요."
            center
          />

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {tabConfig.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={tab === t.key ? { background: 'linear-gradient(to right, #E8882F, #2BA84A)' } : undefined}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* View size toggle (photo/video only) */}
          {tab !== 'document' && (
            <div className="flex items-center gap-1 mb-6 justify-end">
              <span className="text-xs text-slate-400 mr-2">보기</span>
              {([
                { key: 'small' as const, icon: LayoutGrid, label: '작게' },
                { key: 'medium' as const, icon: Square, label: '보통' },
                { key: 'large' as const, icon: Maximize2, label: '크게' },
              ]).map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewSize(v.key)}
                  title={v.label}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewSize === v.key
                      ? 'bg-kmen-orange text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <v.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-slate-400">불러오는 중...</div>
          ) : tab === 'document' ? (
            /* ===== Document Tab: Blog-style list from posts ===== */
            documents.length === 0 ? (
              <div className="text-center py-20 text-slate-400">등록된 문서 자료가 없습니다.</div>
            ) : (
              <div className="space-y-6">
                {documents.map((doc, i) => (
                  <motion.article
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="group bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                      style={{ background: 'linear-gradient(90deg, #E8882F, #2BA84A)' }}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        문서
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <Link to={`/resources/document/${doc.id}`}>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-kmen-orange transition-colors mb-2 break-keep">
                        {doc.title}
                      </h3>
                    </Link>
                    {doc.summary ? (
                      <p className="text-slate-600 leading-relaxed line-clamp-3 mb-3">
                        {doc.summary}
                      </p>
                    ) : (
                      <p className="text-slate-500 leading-relaxed line-clamp-2 mb-3">
                        {stripHtml(doc.content).slice(0, 200)}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {doc.org_name && (
                        <span className="flex items-center gap-1.5 text-sm text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          {doc.org_name}
                        </span>
                      )}
                      <Link
                        to={`/resources/document/${doc.id}`}
                        className="text-sm text-kmen-orange hover:text-[#D47A28] font-medium"
                      >
                        자세히 보기 →
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            )
          ) : (
            /* ===== Photo / Video Tabs: Blog-style cards ===== */
            filteredMedia.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                등록된 {tab === 'photo' ? '사진' : '영상'} 자료가 없습니다.
              </div>
            ) : (
              <div className={
                viewSize === 'small'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
                  : viewSize === 'medium'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-5'
                    : 'space-y-6'
              }>
                {filteredMedia.map((item, i) => {
                  const isImage = item.mime_type.startsWith('image/');
                  const isVideo = item.mime_type.startsWith('video/');

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-lg transition-shadow relative"
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"
                        style={{ background: 'linear-gradient(90deg, #E8882F, #2BA84A)' }}
                      />

                      {/* Media Preview */}
                      <div className="bg-slate-50 flex items-center justify-center">
                        {isImage ? (
                          <img
                            src={item.url}
                            alt={item.title || ''}
                            className={
                              viewSize === 'small'
                                ? 'w-full max-h-[250px] object-contain'
                                : viewSize === 'medium'
                                  ? 'w-full max-h-[400px] object-contain'
                                  : 'w-full'
                            }
                          />
                        ) : isVideo ? (
                          <video
                            src={item.url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <FileText className="w-12 h-12" />
                            <span className="text-sm">
                              {item.mime_type.split('/')[1]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className={viewSize === 'small' ? 'p-3' : 'p-5'}>
                        {item.description && viewSize !== 'small' && (
                          <p className="text-slate-600 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        )}
                        <div className={viewSize === 'small' ? 'flex items-center justify-between' : 'flex items-center justify-between'}>
                          <div className={`flex items-center gap-3 ${viewSize === 'small' ? 'text-xs' : 'text-sm'} text-slate-400`}>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(item.created_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <a
                            href={item.url}
                            download
                            className={`flex items-center gap-1.5 ${viewSize === 'small' ? 'text-xs' : 'text-sm'} text-slate-500 hover:text-kmen-orange transition-colors`}
                          >
                            <Download className={viewSize === 'small' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                            {formatSize(item.size)}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
