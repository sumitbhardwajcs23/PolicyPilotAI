import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { UserSidebar } from './UserSidebar';
import { UserHeader } from './UserHeader';
import { pageLoadAnimation, cleanupAnimations } from '@/lib/animations';

export function UserLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const timer = setTimeout(() => {
      pageLoadAnimation();
    }, 100);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
      cleanupAnimations();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <UserSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Header */}
      <UserHeader sidebarCollapsed={sidebarCollapsed} onMenuClick={toggleSidebar} />

      {/* Main Content */}
      <main
        className={`
          pt-16 min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'ml-20' : 'ml-72'}
        `}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {!sidebarCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}
