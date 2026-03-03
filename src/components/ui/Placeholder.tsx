interface Props {
  text?: string;
  aspect?: 'video' | 'square' | 'wide';
  className?: string;
}

const aspects = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[3/1]',
};

export default function Placeholder({ text = '이미지 준비 중', aspect = 'video', className = '' }: Props) {
  return (
    <div
      className={`${aspects[aspect]} bg-violet-50 rounded-2xl flex items-center justify-center text-violet-400 font-medium ${className}`}
    >
      {text}
    </div>
  );
}
