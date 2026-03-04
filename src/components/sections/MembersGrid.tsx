import { motion } from 'motion/react';
import SectionTitle from '../ui/SectionTitle';
import { members } from '../../data/members';

export default function MembersGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          tag="Members"
          title={`K-MEN, ${members.length}개 단체가 함께하고 있습니다!`}
          subtitle="성평등한 사회를 위해 함께 연대하는 단체들입니다."
        />

        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
          {members.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="px-6 py-3.5 bg-slate-100 rounded-full text-sm font-medium text-slate-800 border border-transparent hover:bg-white hover:border-kmen-orange hover:text-kmen-orange hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(232,136,47,0.12)] transition-all duration-300 cursor-default"
            >
              {member.name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
