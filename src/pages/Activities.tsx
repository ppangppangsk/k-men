import { type ElementType } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Network, Megaphone } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import { activities } from '../data/activities';

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

export default function Activities() {
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
              title="주요 활동"
              subtitle="K-MEN은 교육·연구, 네트워크 구축, 정책·캠페인 세 가지 축으로 활동합니다."
              center={false}
            />
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto space-y-8">
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
                <Card className={`p-8 md:p-10 ${colors.bg} border-0`}>
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
      </section>
    </>
  );
}
