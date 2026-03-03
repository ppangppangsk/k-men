interface Props {
  className?: string;
}

export default function RainbowDivider({ className = '' }: Props) {
  return (
    <div
      className={`h-[2px] w-full bg-gradient-to-r from-violet-500 via-pink-500 via-amber-400 to-teal-400 ${className}`}
      role="separator"
    />
  );
}
