
import { useState } from "react";
import { useTopPerformers } from "./hooks/useTopPerformers";
import { CategoryPerformersCard } from "./components/CategoryPerformersCard";
import { AchievementsLeaderboard } from "./components/AchievementsLeaderboard";
import { TopPerformersChart } from "./components/TopPerformersChart";
import { Skeleton } from "@/components/ui/skeleton";

export const TopPerformersReport = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const { categories, topPerformers, isLoading, error } = useTopPerformers(period);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">أفضل المستخدمين أداءً</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">أفضل المستخدمين أداءً</h3>
        <select
          className="px-3 py-1 border rounded-md text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly' | 'quarterly')}
        >
          <option value="weekly">أسبوعي</option>
          <option value="monthly">شهري</option>
          <option value="quarterly">ربع سنوي</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.slice(0, 3).map((category) => (
          <CategoryPerformersCard 
            key={category.id} 
            category={category} 
            metric={category.id as any}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopPerformersChart 
          data={topPerformers}
          metricKey="completedTasks"
          metricLabel="عدد المهام المنجزة"
          color="#3b82f6"
        />
        <TopPerformersChart 
          data={topPerformers}
          metricKey="onTimeRate"
          metricLabel="معدل الإنجاز في الوقت المحدد"
          color="#10b981"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.slice(3).map((category) => (
          <CategoryPerformersCard 
            key={category.id} 
            category={category} 
            metric={category.id as any}
          />
        ))}
        <AchievementsLeaderboard performers={topPerformers} />
      </div>
    </div>
  );
};
