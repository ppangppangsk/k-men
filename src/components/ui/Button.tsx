import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
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
    'bg-violet-600 text-white hover:bg-violet-700 shadow-sm',
  secondary:
    'bg-violet-50 text-violet-700 hover:bg-violet-100',
  outline:
    'border-2 border-violet-600 text-violet-600 hover:bg-violet-50',
  ghost:
    'text-violet-600 hover:bg-violet-50',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export default function Button({ variant = 'primary', size = 'md', children, ...rest }: Props) {
  const cls = `inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer ${variants[variant]} ${sizes[size]}`;

  if ('to' in rest && rest.to) {
    const { to, ...linkRest } = rest as RouterProps;
    return (
      <Link to={to} className={cls} {...linkRest}>
        {children}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <a href={href} className={cls} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
