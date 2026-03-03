import { motion } from 'motion/react';
import SectionTitle from '../ui/SectionTitle';
import { members } from '../../data/members';

export default function MembersGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title={`K-MEN, ${members.length}개 단체가 함께하고 있습니다!`}
          subtitle="성평등한 사회를 위해 연대하는 파트너들입니다."
        />

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-5xl mx-auto">
          {members.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="px-5 py-3 md:px-6 md:py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700 font-semibold hover:border-violet-400 hover:text-violet-600 hover:shadow-md transition-all duration-300 cursor-default"
            >
              {member.name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
