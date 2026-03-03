import { motion } from 'motion/react';
import { Globe, ExternalLink } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import Button from '../components/ui/Button';
import { siteContent } from '../data/siteContent';
import { members } from '../data/members';

export default function About() {
  const { about, alliance } = siteContent;

  return (
    <>
      {/* K-MEN 소개 */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 break-keep">
              {about.kmen.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed break-keep">
              {about.kmen.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* MenEngage Alliance */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-5 pointer-events-none">
            <Globe className="w-96 h-96" />
          </div>

          <div className="max-w-3xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{about.menengage.title}</h2>
            <p className="text-xl text-slate-300 leading-relaxed break-keep mb-8">
              {about.menengage.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mb-10">
              {alliance.stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 flex-1"
                >
                  <div className="text-4xl font-black text-violet-400 mb-1">{stat.value}</div>
                  <div className="text-slate-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <Button
              href={alliance.link}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              {alliance.linkText}
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 참여 단체 */}
      <section className="py-24 bg-violet-50/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title={`참여 단체 (${members.length}개)`}
            subtitle="K-MEN과 함께하는 시민사회단체들입니다."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {members.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="px-6 py-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-center hover:border-violet-400 hover:text-violet-600 transition-all duration-300"
              >
                {member.name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
