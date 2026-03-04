import { ExternalLink } from 'lucide-react';
import { siteContent } from '../../data/siteContent';

export default function AllianceSection() {
  const { alliance } = siteContent;

  return (
    <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden relative">
      {/* Blob decorations — enhanced visibility */}
      <div className="absolute pointer-events-none rounded-full" style={{ top: '-200px', right: '-200px', width: '600px', height: '600px', background: '#2BA84A', opacity: 0.25, filter: 'blur(100px)' }} />
      <div className="absolute pointer-events-none rounded-full" style={{ bottom: '-150px', left: '-150px', width: '500px', height: '500px', background: '#E8882F', opacity: 0.2, filter: 'blur(80px)' }} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-[2px] text-kmen-green-light">
          <span className="w-6 h-0.5 bg-kmen-green-light rounded-full" />
          Global Network
        </div>

        <h2 className="font-heading text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight mb-5">{alliance.title}</h2>
        <p className="text-base leading-[1.8] text-white/60 max-w-[600px] mb-14 break-keep">
          {alliance.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {alliance.stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white/[0.06] border border-white/[0.08] rounded-[20px] p-9 text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-1"
            >
              <div
                className="font-heading text-[52px] font-black tracking-[-2px] leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #F5A623, #34C759)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >{stat.value}</div>
              <div className="text-sm text-white/50 mt-2 leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>

        <a
          href={alliance.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-kmen-green-light font-semibold text-[15px] hover:gap-3.5 transition-all duration-300"
        >
          {alliance.linkText}
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}
