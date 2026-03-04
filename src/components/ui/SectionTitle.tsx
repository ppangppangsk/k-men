interface Props {
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
  tag?: string;
  gradient?: boolean;
}

export default function SectionTitle({ title, subtitle, center = true, light = false, tag, gradient = false }: Props) {
  return (
    <div className={`mb-12 md:mb-16 ${center ? 'text-center' : ''}`}>
      {tag && (
        <div className={`flex items-center gap-2 mb-4 text-sm font-semibold uppercase tracking-wider text-kmen-orange ${center ? 'justify-center' : ''}`}>
          <span className="w-6 h-0.5 bg-kmen-orange rounded-full" />
          {tag}
        </div>
      )}
      <h2
        className={`text-3xl md:text-4xl font-bold mb-4 break-keep ${
          gradient ? '' : light ? 'text-white' : 'text-slate-900'
        }`}
        style={gradient ? {
          background: 'linear-gradient(135deg, #E8882F, #D47A28)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        } : undefined}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-lg max-w-2xl break-keep ${center ? 'mx-auto' : ''} ${
            light ? 'text-white/70' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
