import { useState, useEffect, useCallback, memo } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { POSHeader } from './POSHeader';
import { cn } from '@/lib/utils';
import { useSessionValidator } from '@/hooks/useSessionValidator';
import { SessionExpiredModal } from '@/components/shared/SessionExpiredModal';

interface POSLayoutProps {
  title?: string;
}

export const POSLayout = memo(({ title = 'Punto de Venta' }: POSLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isSessionExpired, handleRedirect } = useSessionValidator();

  const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  // Auto-collapse on tablet screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1023) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1023) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-[100dvh] bg-background flex overflow-hidden">
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onLogin={handleRedirect}
      />

      {/* Sidebar - with user info enabled */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        showUserInfo={true}
      />

      {/* Main Content Wrapper */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >

        {/* POS Header */}
        <POSHeader
          title={title}
          onMenuClick={toggleSidebar}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
});

POSLayout.displayName = 'POSLayout';
export default POSLayout;
