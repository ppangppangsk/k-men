import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image, Film, FileDown, Download, ExternalLink } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import RainbowDivider from '../components/ui/RainbowDivider';
import { api } from '../lib/api';
import type { Media } from '../types';

type Category = 'all' | 'photo' | 'video' | 'document';

const categoryLabels: Record<string, string> = {
  all: '전체',
  photo: '사진',
  video: '영상',
  document: '문서',
};

const categoryIcons: Record<string, typeof Image> = {
  photo: Image,
  video: Film,
  document: FileDown,
};

const staticResources = [
  {
    title: 'K-MEN 소개 브로셔',
    description: '한국맨엔게이지네트워크 소개 자료입니다.',
    url: '/assets/brochure.png',
    type: 'image' as const,
    category: 'document' as const,
  },
  {
    title: 'K-MEN 출범 보도자료',
    description: '한국맨엔게이지네트워크 출범 선포 보도 요청 자료입니다.',
    url: '/assets/press-release.pdf',
    type: 'pdf' as const,
    category: 'document' as const,
  },
];

export default function Resources() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filter, setFilter] = useState<Category>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.media
      .getAll()
      .then(setMedia)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredMedia =
    filter === 'all' ? media : media.filter((m) => m.category === filter);

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
          <SectionTitle
            title="자료실"
            subtitle="K-MEN의 활동 자료, 사진, 영상, 문서를 확인하세요."
            center
          />

          {/* Static Resources */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {staticResources.map((res) => (
              <a
                key={res.url}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all"
              >
                <div className="shrink-0 w-16 h-16 bg-violet-50 rounded-xl flex items-center justify-center">
                  {res.type === 'image' ? (
                    <Image className="w-7 h-7 text-violet-600" />
                  ) : (
                    <FileDown className="w-7 h-7 text-violet-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{res.description}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-violet-500 shrink-0 mt-1 transition-colors" />
              </a>
            ))}
          </div>

          <RainbowDivider />

          {/* Uploaded Media */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              활동 자료
            </h2>

            {/* Filter */}
            <div className="flex gap-2 mb-8 overflow-x-auto">
              {(['all', 'photo', 'video', 'document'] as Category[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === cat
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ),
              )}
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400">
                불러오는 중...
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                {filter === 'all'
                  ? '등록된 자료가 없습니다.'
                  : `등록된 ${categoryLabels[filter]} 자료가 없습니다.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredMedia.map((item, i) => {
                  const Icon = categoryIcons[item.category] || Image;
                  const isImage = item.mime_type.startsWith('image/');
                  const isVideo = item.mime_type.startsWith('video/');

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Preview */}
                      <div className="aspect-video bg-slate-50 flex items-center justify-center">
                        {isImage ? (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : isVideo ? (
                          <video
                            src={item.url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Icon className="w-12 h-12" />
                            <span className="text-sm">
                              {item.mime_type.split('/')[1]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.category === 'photo'
                                ? 'bg-blue-50 text-blue-600'
                                : item.category === 'video'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {categoryLabels[item.category]}
                          </span>
                          <a
                            href={item.url}
                            download
                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-600 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            {formatSize(item.size)}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
