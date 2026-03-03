import Hero from '../components/sections/Hero';
import VisionMissionValues from '../components/sections/VisionMissionValues';
import AllianceSection from '../components/sections/AllianceSection';
import MembersGrid from '../components/sections/MembersGrid';
import RainbowDivider from '../components/ui/RainbowDivider';
import Button from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Hero />
      <RainbowDivider />
      <VisionMissionValues />
      <AllianceSection />
      <MembersGrid />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-violet-600 to-violet-800 text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 break-keep">
            K-MEN과 함께 성평등한 사회를 만들어갑니다
          </h2>
          <p className="text-violet-200 text-lg mb-10 max-w-2xl mx-auto break-keep">
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
