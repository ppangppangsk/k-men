import { motion } from 'motion/react';
import SectionTitle from '../ui/SectionTitle';
import { siteContent } from '../../data/siteContent';

export default function VisionMissionValues() {
  const { vision, mission, values } = siteContent;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          tag="About K-MEN"
          title="비전 · 미션 · 가치"
          subtitle="K-MEN은 성평등을 위해 남성과 소년이 적극적인 변화의 주체가 되는 세상을 만들어갑니다."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[20px] p-10 overflow-hidden transition-transform duration-300 hover:-translate-y-2"
            style={{ background: 'linear-gradient(135deg, #C8E6C9, #DCEDC8)' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full" style={{ background: '#2BA84A' }} />
            <div className="w-12 h-12 rounded-[14px] bg-kmen-green text-white flex items-center justify-center text-[22px] mb-5">🔭</div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3.5 tracking-tight">{vision.title}</h3>
            <p className="text-[15px] leading-[1.8] text-slate-500">{vision.content}</p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative rounded-[20px] p-10 overflow-hidden transition-transform duration-300 hover:-translate-y-2"
            style={{ background: 'linear-gradient(135deg, #FFE0B2, #FFF3E0)' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full" style={{ background: '#E8882F' }} />
            <div className="w-12 h-12 rounded-[14px] bg-kmen-orange text-white flex items-center justify-center text-[22px] mb-5">🚀</div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3.5 tracking-tight">{mission.title}</h3>
            <p className="text-[15px] leading-[1.8] text-slate-500">
              {mission.items.join(', ')}
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative rounded-[20px] p-10 overflow-hidden transition-transform duration-300 hover:-translate-y-2 md:col-span-3 lg:col-span-1"
            style={{ background: 'linear-gradient(135deg, #FFE0B2, #C8E6C9)' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-full" style={{ background: 'linear-gradient(to bottom, #E8882F, #2BA84A)' }} />
            <div className="w-12 h-12 rounded-[14px] text-white flex items-center justify-center text-[22px] mb-5" style={{ background: 'linear-gradient(135deg, #E8882F, #2BA84A)' }}>💎</div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3.5 tracking-tight">{values.title}</h3>
            <p className="text-[15px] leading-[1.8] text-slate-500">
              {values.content} {values.items.join(' · ')}의 가치를 실천합니다.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
