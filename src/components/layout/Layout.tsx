import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-kmen-cream text-slate-900 selection:bg-orange-200 selection:text-orange-900">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
