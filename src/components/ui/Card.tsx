import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: Props) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${
        hover ? 'hover:shadow-md hover:border-violet-300 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
