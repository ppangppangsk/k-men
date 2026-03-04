import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; to?: undefined };
type AnchorProps = BaseProps & { href: string; to?: undefined; target?: string; rel?: string };
type RouterProps = BaseProps & Omit<LinkProps, 'className'> & { href?: undefined };

type Props = ButtonProps | AnchorProps | RouterProps;

const variants: Record<Variant, string> = {
  primary:
    'bg-kmen-orange text-white hover:bg-[#D47A28] shadow-[0_4px_20px_rgba(232,136,47,0.3)]',
  secondary:
    'bg-kmen-cream text-slate-800 hover:bg-orange-50',
  outline:
    'border-2 border-slate-200 text-slate-800 hover:border-kmen-green hover:text-kmen-green',
  ghost:
    'text-kmen-orange hover:bg-orange-50',
  gradient:
    'text-white shadow-[0_4px_20px_rgba(232,136,47,0.3)] hover:shadow-[0_6px_28px_rgba(232,136,47,0.4)]',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

const gradientStyle = { background: 'linear-gradient(to right, #E8882F, #2BA84A)' };

export default function Button({ variant = 'primary', size = 'md', children, ...rest }: Props) {
  const cls = `inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${variants[variant]} ${sizes[size]}`;
  const style = variant === 'gradient' ? gradientStyle : undefined;

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as RouterProps;
    return (
      <Link to={to} className={cls} style={style} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <a href={href} className={cls} style={style} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} style={style} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
