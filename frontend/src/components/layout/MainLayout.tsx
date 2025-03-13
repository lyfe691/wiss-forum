import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SideNav } from './SideNav';
import { NewPostButton } from '@/components/NewPostButton';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex flex-1 pt-16 pb-0">
        <SideNav />
        <main className="flex-1 container mx-auto px-4 py-8 lg:px-8 mb-8">
          <Outlet />
        </main>
      </div>
      <div className="mt-auto w-full lg:pl-64">
        <Footer />
      </div>
      <NewPostButton />
    </div>
  );
} 