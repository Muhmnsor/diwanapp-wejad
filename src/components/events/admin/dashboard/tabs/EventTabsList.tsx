
import { ClipboardList, LayoutDashboard, Users, CheckCircle, Star } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EventTabsList = () => {
  return (
    <TabsList dir="rtl" className="w-full justify-start border-b rounded-none bg-white mx-0 px-[37px]">
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4" />
        نظرة عامة
      </TabsTrigger>
      <TabsTrigger value="registrations" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        المسجلون
      </TabsTrigger>
      <TabsTrigger value="preparation" className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        التحضير
      </TabsTrigger>
      <TabsTrigger value="feedback" className="flex items-center gap-2">
        <Star className="h-4 w-4" />
        التقييمات
      </TabsTrigger>
      <TabsTrigger value="reports" className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4" />
        التقارير
      </TabsTrigger>
    </TabsList>
  );
};
