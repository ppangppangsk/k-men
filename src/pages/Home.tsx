import Hero from '../components/sections/Hero';
import VisionMissionValues from '../components/sections/VisionMissionValues';
import AllianceSection from '../components/sections/AllianceSection';
import WorkAreas from '../components/sections/WorkAreas';
import MembersGrid from '../components/sections/MembersGrid';
import Button from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Hero />
      <VisionMissionValues />
      <AllianceSection />
      <WorkAreas />
      <MembersGrid />

      {/* CTA Section — matching kmen.html contact style */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #E8882F, #D47A28)' }}>
        {/* Blob decoration */}
        <div className="absolute pointer-events-none rounded-full" style={{ top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute pointer-events-none rounded-full" style={{ bottom: '-80px', left: '-80px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.08)' }} />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold uppercase tracking-[2px] text-white/80">
            <span className="w-6 h-0.5 bg-white/80 rounded-full" />
            Join Us
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 break-keep text-white">
            K-MEN과 함께 성평등한 사회를 만들어갑니다
          </h2>
          <p className="text-white/80 text-base mb-10 max-w-[600px] mx-auto break-keep leading-[1.8]">
            소년과 남성을 성평등의 주체로 초대하는 여정에 동참해주세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button to="/join" variant="secondary" size="lg">
              함께하기
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button to="/contact" variant="outline" size="lg">
              문의하기
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
