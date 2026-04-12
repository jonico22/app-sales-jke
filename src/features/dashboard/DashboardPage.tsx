import { StatsGrid } from './components/StatsGrid';
import { BusinessHeader } from './components/BusinessHeader';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 0. Business Header */}
      <BusinessHeader />

      {/* 1. Stats Grid */}
      <StatsGrid />

      {/* Legacy chart area temporarily disabled while the new dashboard chart library is integrated. */}
    </div>
  );
}
