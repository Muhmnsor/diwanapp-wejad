import { useState } from "react";
import { DashboardFilters } from "./dashboard/DashboardFilters";
import { DashboardStatsCards } from "./dashboard/DashboardStatsCards";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
}

export const DashboardStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
}: DashboardStatsProps) => {
  const [filters, setFilters] = useState({
    path: 'all',
    category: 'all',
    price: 'all'
  });

  const { data: filteredStats } = useQuery({
    queryKey: ['filtered-stats', filters],
    queryFn: async () => {
      console.log("Fetching filtered stats with filters:", filters);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          registrations (count)
        `);

      if (filters.path !== 'all') {
        query = query.eq('event_path', filters.path);
      }
      
      if (filters.category !== 'all') {
        query = query.eq('event_category', filters.category);
      }
      
      if (filters.price !== 'all') {
        if (filters.price === 'free') {
          query = query.eq('price', 0);
        } else {
          query = query.gt('price', 0);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching filtered stats:", error);
        throw error;
      }

      console.log("Filtered events data:", data);

      const totalEvents = data?.length || 0;
      const totalRegistrations = data?.reduce((sum, event) => sum + event.registrations[0].count, 0) || 0;
      const totalSeats = data?.reduce((sum, event) => sum + event.max_attendees, 0) || 0;
      const remainingSeats = totalSeats - totalRegistrations;
      const occupancyRate = totalSeats > 0 ? (totalRegistrations / totalSeats) * 100 : 0;

      return {
        eventCount: totalEvents,
        registrationCount: totalRegistrations,
        remainingSeats,
        occupancyRate
      };
    }
  });

  const handleFilterChange = (type: string, value: string) => {
    console.log("Filter changed:", type, value);
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="space-y-8">
      <DashboardStatsCards
        title="الإحصائيات الكلية"
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        eventCount={0}
      />

      <div className="border-t pt-8">
        <DashboardFilters
          onFilterChange={handleFilterChange}
          selectedPath={filters.path}
          selectedCategory={filters.category}
          selectedPrice={filters.price}
        />

        {filteredStats && (
          <DashboardStatsCards
            title="الإحصائيات المصفاة"
            registrationCount={filteredStats.registrationCount}
            remainingSeats={filteredStats.remainingSeats}
            occupancyRate={filteredStats.occupancyRate}
            eventCount={filteredStats.eventCount}
          />
        )}
      </div>
    </div>
  );
};