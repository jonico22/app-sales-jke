import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { MobileNavFooter } from './MobileNavFooter';
import { cn } from '@/lib/utils';
import { useSessionValidator } from '@/hooks/useSessionValidator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SessionExpiredModal } from '@/components/shared/SessionExpiredModal';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isSessionExpired, handleRedirect } = useSessionValidator();

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Auto-collapse on tablet screens
  useEffect(() => {
    if (isTablet) {
      setIsCollapsed(true);
    } else if (isDesktop) {
      setIsCollapsed(false);
    }
  }, [isTablet, isDesktop]);

  // Close sidebar when entering mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsCollapsed(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onLogin={handleRedirect}
      />

      {/* Sidebar */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      {/* Main Content Wrapper */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >

        {/* Header - Passing toggler */}
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Page Content - extra bottom padding on mobile for nav footer */}
        <main className="flex-1 p-6 pb-24 lg:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation Footer */}
      <MobileNavFooter onMenuClick={() => setIsSidebarOpen(true)} />
    </div>
  );
}

