import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { mainNav } from '../../data/navigation';
import { useAuth } from '../../lib/auth';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const authLink = isAuthenticated
    ? isAdmin
      ? { to: '/admin', label: '관리자' }
      : { to: '/dashboard', label: '대시보드' }
    : { to: '/login', label: '로그인' };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || mobileOpen
            ? 'bg-kmen-cream/92 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.08)] py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-auto h-10 px-3 bg-kmen-orange rounded-xl flex items-center justify-center text-white font-black text-base tracking-tighter shadow-sm">
              K-MEN
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">한국맨엔게이지네트워크</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            {mainNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`hover:text-kmen-orange transition-colors duration-300 ${
                  location.pathname === item.path ? 'text-kmen-orange font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={authLink.to}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-kmen-green text-white rounded-full hover:bg-kmen-green-dark transition-colors duration-300 shadow-sm"
            >
              {isAdmin && <Shield className="w-3.5 h-3.5" />}
              {authLink.label}
            </Link>
          </div>

          <button
            className="md:hidden text-slate-900 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-kmen-cream/97 backdrop-blur-lg pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-lg font-medium">
            {mainNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${
                  location.pathname === item.path ? 'text-kmen-orange' : 'text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link to={authLink.to} className="text-kmen-green font-semibold">
              {authLink.label}
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link to="/dashboard" className="text-slate-600">
                대시보드
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
