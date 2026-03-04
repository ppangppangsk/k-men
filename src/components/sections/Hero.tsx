import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { siteContent } from '../../data/siteContent';

export default function Hero() {
  const { hero, vision, mission } = siteContent;

  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-[68px]">
      {/* ===== Gradient background — soft & natural ===== */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Soft radial wash */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 90% 80% at 70% 25%, rgba(232,136,47,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 70% at 20% 75%, rgba(43,168,74,0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 50% 45%, rgba(245,166,35,0.08) 0%, transparent 50%)',
          }}
        />
        {/* Orange glow top-right */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-150px', right: '-80px', width: '750px', height: '750px',
            background: 'radial-gradient(circle, rgba(232,136,47,0.3) 0%, rgba(232,136,47,0.08) 45%, transparent 70%)',
            animation: 'blob-float 20s ease-in-out infinite',
          }}
        />
        {/* Green glow bottom-left */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-120px', left: '-100px', width: '650px', height: '650px',
            background: 'radial-gradient(circle, rgba(43,168,74,0.22) 0%, rgba(43,168,74,0.05) 45%, transparent 70%)',
            animation: 'blob-float 20s ease-in-out infinite 10s',
          }}
        />
        {/* Warm center accent */}
        <div
          className="absolute rounded-full"
          style={{
            top: '35%', left: '30%', width: '550px', height: '550px',
            background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 55%)',
            animation: 'blob-float 20s ease-in-out infinite 5s',
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto w-full py-20 relative" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="font-heading text-[clamp(40px,5vw,64px)] font-black tracking-[-2px] leading-[1.1] text-slate-900 mb-2 break-keep">
              지금, <span className="text-kmen-orange">K-MEN</span>과
              <br />
              함께 <span className="text-kmen-green">변화</span>를
              <br />
              만들어보세요
            </h1>

            <p className="font-heading text-lg font-bold text-slate-900 mb-5 tracking-tight">
              {hero.titleEn}
            </p>

            <p className="text-[17px] leading-[1.8] text-slate-500 max-w-[520px] mb-9 break-keep">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button to="/join" variant="primary" size="lg">
                함께하기
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button to="/about" variant="outline" size="lg">
                더 알아보기
              </Button>
            </div>
          </motion.div>

          {/* Right: Floating cards (hidden on mobile) */}
          <div className="hidden lg:block relative" style={{ width: 400, height: 420 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-0 left-0 w-[300px] bg-kmen-green text-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] z-10"
              style={{ animation: 'card-float 6s ease-in-out infinite' }}
            >
              <div className="text-[11px] font-bold uppercase tracking-[2px] opacity-70 mb-3">비전 Vision</div>
              <p className="text-[17px] font-medium leading-relaxed">{vision.content}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute bottom-0 right-0 w-[280px] bg-white text-slate-900 rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-100"
              style={{ animation: 'card-float 6s ease-in-out infinite 3s' }}
            >
              <div className="text-[11px] font-bold uppercase tracking-[2px] opacity-50 mb-3">미션 Mission</div>
              <p className="text-[15px] leading-[1.7] text-slate-500">{mission.items[0]}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
