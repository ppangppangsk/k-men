import { Globe, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import { siteContent } from '../../data/siteContent';

export default function AllianceSection() {
  const { alliance } = siteContent;

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-5 pointer-events-none">
          <Globe className="w-96 h-96" />
        </div>

        <div className="max-w-3xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-10">{alliance.title}</h2>

          <div className="flex flex-col sm:flex-row gap-6 mb-12">
            {alliance.stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/10 flex-1"
              >
                <div className="text-5xl font-black text-violet-400 mb-2">{stat.value}</div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <p className="text-xl leading-relaxed text-slate-300 mb-10 break-keep">
            {alliance.description}
          </p>

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
  );
}
