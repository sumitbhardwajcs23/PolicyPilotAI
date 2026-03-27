import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { pageLoadAnimation, cleanupAnimations } from '@/lib/animations';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Page load animation
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
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Header */}
      <Header sidebarCollapsed={sidebarCollapsed} onMenuClick={toggleSidebar} />

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
