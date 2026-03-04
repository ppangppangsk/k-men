import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradientBar?: boolean;
}

export default function Card({ children, className = '', hover = false, gradientBar = false }: Props) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden group ${
        hover ? 'hover:shadow-md hover:border-kmen-orange/30 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
      {gradientBar && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{ background: 'linear-gradient(90deg, #E8882F, #2BA84A)' }}
        />
      )}
    </div>
  );
}
