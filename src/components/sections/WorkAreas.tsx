import { siteContent } from '../../data/siteContent';

export default function WorkAreas() {
  const { workAreas } = siteContent;

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold uppercase tracking-[2px]" style={{ color: '#E8882F' }}>
            <span className="w-6 h-0.5 rounded-full" style={{ background: '#E8882F' }} />
            Work Areas
          </div>
          <h2 className="font-heading text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight text-slate-900 mb-4">
            {workAreas.title}
          </h2>
          <p className="text-base leading-[1.8] text-slate-500 max-w-[600px] mx-auto break-keep">
            {workAreas.description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {workAreas.areas.map((area, i) => (
            <div
              key={i}
              className="group bg-[#FFF8F0] border border-orange-100 rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-200"
            >
              <div className="text-4xl mb-4">{area.icon}</div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{area.titleKo}</h4>
              <p className="text-xs text-slate-400">{area.titleEn}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
