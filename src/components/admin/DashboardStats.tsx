import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

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
    // تحديث الإحصائيات عند تغيير التصفية
    if (selectedPath === "all" && selectedCategory === "all") {
      setFilteredStats({
        registrationCount,
        remainingSeats,
        occupancyRate
      });
    } else {
      // هنا نقوم بتحديث الإحصائيات بناءً على التصفية المحددة
      const matchesPath = selectedPath === "all" || selectedPath === eventPath;
      const matchesCategory = selectedCategory === "all" || selectedCategory === eventCategory;

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
  }, [selectedPath, selectedCategory, registrationCount, remainingSeats, occupancyRate, eventPath, eventCategory]);

  console.log("DashboardStats - Current filters:", {
    selectedPath,
    selectedCategory,
    filteredStats,
    eventPath,
    eventCategory
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center justify-end">
        <Select
          value={selectedPath}
          onValueChange={setSelectedPath}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر المسار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المسارات</SelectItem>
            <SelectItem value="environment">البيئة</SelectItem>
            <SelectItem value="health">الصحة</SelectItem>
            <SelectItem value="education">التعليم</SelectItem>
            <SelectItem value="social">الاجتماعي</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التصنيفات</SelectItem>
            <SelectItem value="free">مجاني</SelectItem>
            <SelectItem value="paid">مدفوع</SelectItem>
            <SelectItem value="spiritual">روحي</SelectItem>
            <SelectItem value="professional">مهني</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد التسجيلات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.registrationCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              معدل الإشغال {filteredStats.occupancyRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقاعد المتبقية</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats.remainingSeats}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {eventDate} - {eventTime}
            </div>
          </CardContent>
        </Card>

        {eventPath && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المسار</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventPath}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {eventCategory}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};