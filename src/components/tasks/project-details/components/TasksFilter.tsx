
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TasksFilterProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TasksFilter = ({ activeTab, onTabChange }: TasksFilterProps) => {
  return (
    <Tabs value={activeTab} className="w-full" onValueChange={onTabChange} dir="rtl">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="delayed">متأخرة</TabsTrigger>
        <TabsTrigger value="completed">مكتملة</TabsTrigger>
        <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
        <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
        <TabsTrigger value="all">الكل</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
