import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SideNav } from './SideNav';
import { NewPostButton } from '@/components/NewPostButton';
import { useEffect, useState } from 'react';

// main layout component, used to wrap the main pages

export function MainLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <div className="flex flex-1 pt-16 lg:pt-16 pb-0">
        <SideNav />
        <div className="flex-1 w-full">
          <main className={`container mx-auto px-4 py-6 mb-8 transition-all duration-200 ${isScrolled ? 'mt-4' : 'mt-6'}`}>
            <Outlet />
          </main>
        </div>
      </div>
      
      <div className={`mt-auto w-full ${!isMobile ? 'lg:pl-64' : ''}`}>
        <Footer />
      </div>
      
      <NewPostButton />
    </div>
  );
} 