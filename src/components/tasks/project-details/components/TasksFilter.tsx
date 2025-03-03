
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TasksFilterProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const TasksFilter = ({ activeTab, onTabChange }: TasksFilterProps) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={onTabChange} dir="rtl">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="all">الكل</TabsTrigger>
        <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
        <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
        <TabsTrigger value="completed">مكتملة</TabsTrigger>
        <TabsTrigger value="delayed">متأخرة</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
