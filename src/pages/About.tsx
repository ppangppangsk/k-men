import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import { siteContent } from '../data/siteContent';
import { members } from '../data/members';

export default function About() {
  const { about, alliance } = siteContent;

  return (
    <>
      {/* K-MEN 소개 */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute pointer-events-none rounded-full" style={{ top: '80px', right: 0, width: '400px', height: '400px', background: '#2BA84A', opacity: 0.2, filter: 'blur(60px)' }} />
        <div className="absolute pointer-events-none rounded-full" style={{ bottom: 0, left: '40px', width: '300px', height: '300px', background: '#E8882F', opacity: 0.2, filter: 'blur(60px)' }} />

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
            <p className="text-xl text-slate-500 leading-relaxed break-keep">
              {about.kmen.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* MenEngage Alliance */}
      <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden relative">
        <div className="absolute pointer-events-none rounded-full" style={{ top: '-200px', right: '-200px', width: '600px', height: '600px', background: '#2BA84A', opacity: 0.25, filter: 'blur(100px)' }} />
        <div className="absolute pointer-events-none rounded-full" style={{ bottom: '-150px', left: '-150px', width: '500px', height: '500px', background: '#E8882F', opacity: 0.2, filter: 'blur(80px)' }} />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-[2px] text-kmen-green-light">
              <span className="w-6 h-0.5 bg-kmen-green-light rounded-full" />
              Global Network
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">{about.menengage.title}</h2>
            <p className="text-xl text-white/60 leading-relaxed break-keep mb-8">
              {about.menengage.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {alliance.stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/[0.06] p-6 rounded-[20px] backdrop-blur-sm border border-white/[0.08] text-center hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="font-heading text-4xl font-black mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #F5A623, #34C759)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >{stat.value}</div>
                  <div className="text-sm text-white/50 leading-relaxed">{stat.label}</div>
                </div>
              ))}
            </div>

            <a
              href={alliance.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-kmen-green-light font-semibold hover:gap-3.5 transition-all duration-300"
            >
              {alliance.linkText}
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* 참여 단체 */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            tag="Members"
            title={`참여 단체 (${members.length}개)`}
            subtitle="K-MEN과 함께하는 시민사회단체들입니다."
          />

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {members.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="px-6 py-3 bg-slate-100 rounded-full text-slate-700 font-semibold border border-transparent hover:border-kmen-orange hover:text-kmen-orange hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(232,136,47,0.12)] transition-all duration-300"
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
