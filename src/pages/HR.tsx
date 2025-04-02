
import { useEffect, useState } from "react";
import { HRTabs } from "@/components/hr/HRTabs";
import { DatePicker } from "@/components/ui/date-picker";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";
import { 
  Calendar, 
  Clock, 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Briefcase, 
  Book,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle
} from "lucide-react";

const HR = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  
  const { data: hrStats, isLoading: statsLoading } = useHRStats();
  const { expiringContracts, endingProbations } = useEmployeeContracts();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  
  // Sample data for sparklines
  const attendanceData = [65, 68, 72, 68, 74, 72, 75, 78, 76, 80];
  const leavesData = [5, 4, 6, 8, 7, 5, 4, 3, 5, 4];
  const absenceData = [2, 3, 1, 4, 2, 1, 3, 2, 1, 2];
  
  return (
    <div className="container mx-auto my-6 px-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">إدارة الموارد البشرية</h1>
      </div>
      
      <HRTabs defaultTab="dashboard" />
      
      <div className="mt-6">
        {/* Overview Dashboard will be enhanced here with KPI cards and charts */}
        <Tabs defaultValue="overview" className="w-full mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">النظرة العامة</TabsTrigger>
            <TabsTrigger value="contracts">العقود</TabsTrigger>
            <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">لوحة الإحصائيات</h2>
              <div className="flex gap-2">
                <Button 
                  variant={period === "daily" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setPeriod("daily")}
                >
                  يومي
                </Button>
                <Button 
                  variant={period === "weekly" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setPeriod("weekly")}
                >
                  أسبوعي
                </Button>
                <Button 
                  variant={period === "monthly" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setPeriod("monthly")}
                >
                  شهري
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employee Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : hrStats?.totalEmployees}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center text-sm gap-1 mr-2">
                        <UserCheck className="h-3.5 w-3.5 text-green-500" />
                        <span>{statsLoading ? "..." : `${hrStats?.totalEmployees - (hrStats?.activeLeaves || 0)}`} نشط</span>
                      </span>
                      <span className="inline-flex items-center text-sm gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                        <span>{statsLoading ? "..." : hrStats?.activeLeaves} في إجازة</span>
                      </span>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        {statsLoading ? "..." : hrStats?.newEmployees} جديد
                      </span>
                    </Badge>
                  </div>
                  <div className="h-[40px] mt-4">
                    <Sparklines data={attendanceData} height={40}>
                      <SparklinesLine color="#4ade80" style={{ fill: "none" }} />
                      <SparklinesSpots size={2} style={{ fill: "#4ade80" }} />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>
              
              {/* Attendance Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">الحضور اليومي</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : hrStats?.presentToday}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center text-sm gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        <span>معدل الحضور {statsLoading ? "..." : `${hrStats?.attendanceRate}%`}</span>
                      </span>
                    </div>
                    <Badge variant="outline" className={`ml-auto ${hrStats?.attendanceRate && hrStats.attendanceRate > 80 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {statsLoading ? "..." : hrStats?.attendanceRate}%
                    </Badge>
                  </div>
                  <div className="h-[40px] mt-4">
                    <Sparklines data={attendanceData} height={40}>
                      <SparklinesLine color="#4ade80" style={{ fill: "none" }} />
                      <SparklinesSpots size={2} style={{ fill: "#4ade80" }} />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>
              
              {/* Leave Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">الإجازات</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : hrStats?.activeLeaves}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center text-sm gap-1">
                        <Clock className="h-3.5 w-3.5 text-orange-500" />
                        <span>{statsLoading ? "..." : hrStats?.upcomingLeaves} إجازة قادمة</span>
                      </span>
                    </div>
                    <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700">
                      جارية
                    </Badge>
                  </div>
                  <div className="h-[40px] mt-4">
                    <Sparklines data={leavesData} height={40}>
                      <SparklinesLine color="#60a5fa" style={{ fill: "none" }} />
                      <SparklinesSpots size={2} style={{ fill: "#60a5fa" }} />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contracts Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">العقود</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsLoading ? "..." : hrStats?.expiringContracts}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center text-sm gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span>ينتهي خلال الشهر</span>
                      </span>
                    </div>
                    <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700">
                      يتطلب متابعة
                    </Badge>
                  </div>
                  <div className="h-[40px] mt-4">
                    <Sparklines data={absenceData} height={40}>
                      <SparklinesLine color="#f59e0b" style={{ fill: "none" }} />
                      <SparklinesSpots size={2} style={{ fill: "#f59e0b" }} />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Expiring Contracts Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">العقود المنتهية قريباً</CardTitle>
                </CardHeader>
                <CardContent>
                  {expiringContracts && expiringContracts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-2">الموظف</th>
                            <th className="text-right py-2">تاريخ الانتهاء</th>
                            <th className="text-right py-2">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiringContracts.slice(0, 5).map((contract) => (
                            <tr key={contract.id} className="border-b hover:bg-muted/50">
                              <td className="py-2">
                                {contract.employees?.full_name}
                              </td>
                              <td className="py-2">
                                {new Date(contract.end_date as string).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="py-2">
                                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                                  ينتهي قريباً
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد عقود منتهية خلال الفترة القادمة
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Probation Periods Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">فترات التجربة المنتهية قريباً</CardTitle>
                </CardHeader>
                <CardContent>
                  {endingProbations && endingProbations.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-2">الموظف</th>
                            <th className="text-right py-2">تاريخ الانتهاء</th>
                            <th className="text-right py-2">الإجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endingProbations.slice(0, 5).map((probation) => (
                            <tr key={probation.id} className="border-b hover:bg-muted/50">
                              <td className="py-2">
                                {probation.employees?.full_name}
                              </td>
                              <td className="py-2">
                                {new Date(probation.probation_end_date as string).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="py-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  يتطلب تقييم
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد فترات تجربة منتهية خلال الفترة القادمة
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="contracts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">إدارة العقود</h2>
              <DatePicker
                date={dateRange.startDate}
                setDate={(date) => setDateRange({...dateRange, startDate: date as Date})}
                placeholder="تاريخ البداية"
                locale="ar"
              />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>العقود الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  اختر تاريخ لعرض العقود النشطة خلال هذه الفترة
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">التنبيهات والإشعارات</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>قائمة التنبيهات</CardTitle>
              </CardHeader>
              <CardContent>
                {expiringContracts && expiringContracts.length > 0 ? (
                  <div className="divide-y">
                    {expiringContracts.slice(0, 5).map((contract) => (
                      <div key={contract.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <div>
                            <p className="font-medium">انتهاء عقد {contract.employees?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              ينتهي بتاريخ {new Date(contract.end_date as string).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <Button size="sm">إدارة</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    لا توجد تنبيهات حالية
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HR;
