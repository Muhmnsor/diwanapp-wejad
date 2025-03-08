
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecurringTasksFilterProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export const RecurringTasksFilter: React.FC<RecurringTasksFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <Tabs defaultValue={activeFilter} className="w-full max-w-md" onValueChange={onFilterChange}>
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="paused">متوقفة</TabsTrigger>
        <TabsTrigger value="active">نشطة</TabsTrigger>
        <TabsTrigger value="all">جميع المهام</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
