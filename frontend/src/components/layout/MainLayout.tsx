import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SideNav } from './SideNav';
import { NewPostButton } from '@/components/NewPostButton';
import { useEffect, useState } from 'react';

export function MainLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex flex-1 pt-16 pb-0">
        <SideNav />
        <main className={`flex-1 container mx-auto px-4 py-8 ${!isMobile ? 'lg:px-8' : 'px-4'} mb-8`}>
          <Outlet />
        </main>
      </div>
      <div className={`mt-auto w-full ${!isMobile ? 'lg:pl-64' : ''}`}>
        <Footer />
      </div>
      <NewPostButton />
    </div>
  );
} 