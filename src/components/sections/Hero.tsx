import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { siteContent } from '../../data/siteContent';

export default function Hero() {
  const { hero } = siteContent;

  return (
    <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-medium text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          {hero.badge}
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight break-keep">
          {hero.titleKo}
          <span className="block text-2xl md:text-4xl text-violet-600 mt-3 font-semibold tracking-normal">
            {hero.titleEn}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl break-keep mb-10">
          <strong className="text-violet-600 font-bold">K-MEN</strong>
          {'은 ' + hero.description.slice(hero.description.indexOf('소년'))}
        </p>

        <div className="flex flex-wrap gap-4">
          <Button to="/about" size="lg">
            자세히 알아보기
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button to="/join" variant="outline" size="lg">
            함께하기
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
