import { useState, useEffect } from "react";
import { DashboardFilters } from "./dashboard/DashboardFilters";
import { DashboardStatsCards } from "./dashboard/DashboardStatsCards";

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
  eventDate,
  eventTime,
  eventPath,
  eventCategory
}: DashboardStatsProps) => {
  const [selectedPath, setSelectedPath] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredStats, setFilteredStats] = useState({
    registrationCount,
    remainingSeats,
    occupancyRate
  });

  useEffect(() => {
    console.log("DashboardStats - Filters changed:", { selectedPath, selectedCategory });
    console.log("DashboardStats - Current event:", { eventPath, eventCategory });

    if (selectedPath === "all" && selectedCategory === "all") {
      setFilteredStats({
        registrationCount,
        remainingSeats,
        occupancyRate
      });
    } else {
      const matchesPath = selectedPath === "all" || selectedPath === eventPath;
      const matchesCategory = selectedCategory === "all" || selectedCategory === eventCategory;

      console.log("DashboardStats - Matches:", { matchesPath, matchesCategory });

      if (matchesPath && matchesCategory) {
        setFilteredStats({
          registrationCount,
          remainingSeats,
          occupancyRate
        });
      } else {
        setFilteredStats({
          registrationCount: 0,
          remainingSeats: 0,
          occupancyRate: 0
        });
      }
    }
  }, [
    selectedPath,
    selectedCategory,
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventPath,
    eventCategory
  ]);

  return (
    <div className="space-y-6">
      <DashboardFilters
        selectedPath={selectedPath}
        selectedCategory={selectedCategory}
        onPathChange={setSelectedPath}
        onCategoryChange={setSelectedCategory}
      />
      <DashboardStatsCards
        stats={filteredStats}
        eventDate={eventDate}
        eventTime={eventTime}
        eventPath={eventPath}
        eventCategory={eventCategory}
      />
    </div>
  );
};