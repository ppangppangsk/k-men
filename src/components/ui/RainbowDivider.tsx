interface Props {
  className?: string;
}

export default function RainbowDivider({ className = '' }: Props) {
  return (
    <div
      className={`h-[3px] w-full ${className}`}
      style={{ background: 'linear-gradient(to right, #E8882F, #F5A623, #34C759, #2BA84A)' }}
      role="separator"
    />
  );
}
