import { useState, useEffect, type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Network, Megaphone, Calendar, User } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import { activities } from '../data/activities';
import { api } from '../lib/api';
import type { Post } from '../types';

type Tab = 'main' | 'member';

const iconMap: Record<string, ElementType> = {
  BookOpen,
  Network,
  Megaphone,
};

const colorMap: Record<string, { bg: string; icon: string; badge: string }> = {
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600 bg-teal-100', badge: 'bg-teal-500' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-600 bg-sky-100', badge: 'bg-sky-500' },
  fuchsia: { bg: 'bg-fuchsia-50', icon: 'text-fuchsia-600 bg-fuchsia-100', badge: 'bg-fuchsia-500' },
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export default function Activities() {
  const [tab, setTab] = useState<Tab>('main');
  const [memberActivities, setMemberActivities] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'member' && memberActivities.length === 0) {
      setLoading(true);
      api.getPosts('member_activity')
        .then(setMemberActivities)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [tab, memberActivities.length]);

  return (
    <>
      <section className="pt-32 pb-10 md:pt-44 md:pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle
              title="활동"
              subtitle="K-MEN의 주요 활동과 회원사 활동을 확인하세요."
              center={false}
            />

            {/* Tabs */}
            <div className="flex gap-2 mt-6 overflow-x-auto">
              {([
                { key: 'main' as Tab, label: '주요 활동' },
                { key: 'member' as Tab, label: '회원사 활동' },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    tab === t.key
                      ? 'text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={tab === t.key ? { background: 'linear-gradient(to right, #E8882F, #2BA84A)' } : undefined}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          {tab === 'main' ? (
            <div className="space-y-8">
              {activities.map((activity, idx) => {
                const Icon = iconMap[activity.icon];
                const colors = colorMap[activity.color] || colorMap.teal;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`p-8 md:p-10 ${colors.bg} border-0`} gradientBar>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                          {Icon && <Icon className="w-7 h-7" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-3">{activity.title}</h3>
                          <p className="text-slate-600 text-lg mb-6 break-keep">{activity.description}</p>
                          <ul className="space-y-3">
                            {activity.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-700">
                                <span className={`mt-2 w-1.5 h-1.5 rounded-full ${colors.badge} shrink-0`} />
                                <span className="break-keep">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* ===== Member Activities ===== */
            loading ? (
              <div className="text-center py-20 text-slate-400">불러오는 중...</div>
            ) : memberActivities.length === 0 ? (
              <div className="text-center py-20 text-slate-400">등록된 회원사 활동이 없습니다.</div>
            ) : (
              <div className="space-y-6">
                {memberActivities.map((post, i) => (
                  <motion.article
                    key={post.id}
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
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        회원사 활동
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>

                    <Link to={`/activities/member/${post.id}`}>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-kmen-orange transition-colors mb-2 break-keep">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-slate-600 leading-relaxed line-clamp-3 mb-3">
                      {stripHtml(post.content).slice(0, 200)}
                    </p>

                    <div className="flex items-center justify-between">
                      {post.org_name && (
                        <span className="flex items-center gap-1.5 text-sm text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          {post.org_name}
                        </span>
                      )}
                      <Link
                        to={`/activities/member/${post.id}`}
                        className="text-sm text-kmen-orange hover:text-[#D47A28] font-medium"
                      >
                        자세히 보기 →
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}
