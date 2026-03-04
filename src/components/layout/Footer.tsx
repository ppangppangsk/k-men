import { Link } from 'react-router-dom';
import RainbowDivider from '../ui/RainbowDivider';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <RainbowDivider />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-kmen-orange rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tighter">
                KM
              </div>
              <span className="font-bold text-xl tracking-tight text-white">K-MEN</span>
            </div>
            <p className="text-sm leading-relaxed">
              Korea MenEngage Network
              <br />
              한국맨엔게이지네트워크
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">바로가기</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/about" className="hover:text-kmen-orange-light transition-colors">소개</Link>
              <Link to="/activities" className="hover:text-kmen-orange-light transition-colors">활동</Link>
              <Link to="/news" className="hover:text-kmen-orange-light transition-colors">소식</Link>
              <Link to="/events" className="hover:text-kmen-orange-light transition-colors">행사</Link>
              <Link to="/join" className="hover:text-kmen-orange-light transition-colors">함께하기</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">연락처</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="mailto:koreamenengagenetwork@gmail.com"
                className="hover:text-kmen-orange-light transition-colors break-all"
              >
                koreamenengagenetwork@gmail.com
              </a>
              <a
                href="https://menengage.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-kmen-orange-light transition-colors"
              >
                MenEngage Alliance
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-sm opacity-60">
          © {new Date().getFullYear()} K-MEN. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
