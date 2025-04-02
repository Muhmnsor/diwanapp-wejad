
import { useState, useEffect } from "react";
import { useOrganizationalUnitEmployees } from "@/hooks/hr/useOrganizationalUnitEmployees";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Edit, Trash2 } from "lucide-react";

interface OrganizationalUnitEmployeesProps {
  unitId: string;
}

interface Employee {
  id: string;
  full_name: string;
  position?: string;
  department?: string;
}

interface EmployeeAssignment {
  id: string;
  employee_id: string;
  organizational_unit_id: string;
  role?: string;
  is_primary: boolean;
  start_date?: string;
  end_date?: string;
  employee: Employee;
}

export function OrganizationalUnitEmployees({ unitId }: OrganizationalUnitEmployeesProps) {
  const { data: employees = [], isLoading } = useOrganizationalUnitEmployees(unitId);
  const { data: units = [] } = useOrganizationalUnits();
  const [selectedTab, setSelectedTab] = useState<string>("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // البحث عن معلومات الوحدة التنظيمية
  const unitInfo = units.find(unit => unit.id === unitId);
  
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAssignment | null>(null);

  const [formData, setFormData] = useState({
    employee_id: "",
    role: "",
    is_primary: false,
    start_date: new Date().toISOString().split('T')[0],
    end_date: ""
  });

  // إعادة تعيين النموذج عند تغيير الوحدة
  useEffect(() => {
    setSelectedTab("active");
    setSelectedEmployee(null);
  }, [unitId]);

  // الحصول على الموظفين النشطين وغير النشطين
  const activeEmployees = employees.filter(emp => 
    !emp.end_date || new Date(emp.end_date) >= new Date()
  );
  
  const inactiveEmployees = employees.filter(emp => 
    emp.end_date && new Date(emp.end_date) < new Date()
  );
  
  // تحديث البيانات في النموذج
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // فتح حوار تعديل الموظف
  const handleEditEmployee = (employee: EmployeeAssignment) => {
    setSelectedEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      role: employee.role || "",
      is_primary: employee.is_primary,
      start_date: employee.start_date || new Date().toISOString().split('T')[0],
      end_date: employee.end_date || ""
    });
    setIsEditEmployeeOpen(true);
  };

  // حذف موظف من الوحدة
  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_organizational_units')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "تمت العملية بنجاح",
        description: "تم حذف الموظف من الوحدة التنظيمية"
      });
      
      queryClient.invalidateQueries({ queryKey: ['organizational-unit-employees', unitId] });
    } catch (error) {
      console.error("Error deleting employee from unit:", error);
      toast({
        title: "حدث خطأ",
        description: "لم يتم حذف الموظف من الوحدة",
        variant: "destructive"
      });
    }
  };

  // إضافة موظف للوحدة
  const handleAddEmployee = async () => {
    try {
      const { error } = await supabase
        .from('employee_organizational_units')
        .insert([
          {
            employee_id: formData.employee_id,
            organizational_unit_id: unitId,
            role: formData.role || null,
            is_primary: formData.is_primary,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الموظف للوحدة التنظيمية"
      });
      
      setIsAddEmployeeOpen(false);
      queryClient.invalidateQueries({ queryKey: ['organizational-unit-employees', unitId] });
      
      // إعادة تعيين النموذج
      setFormData({
        employee_id: "",
        role: "",
        is_primary: false,
        start_date: new Date().toISOString().split('T')[0],
        end_date: ""
      });
    } catch (error) {
      console.error("Error adding employee to unit:", error);
      toast({
        title: "حدث خطأ",
        description: "لم يتم إضافة الموظف للوحدة",
        variant: "destructive"
      });
    }
  };

  // تحديث بيانات الموظف في الوحدة
  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const { error } = await supabase
        .from('employee_organizational_units')
        .update({
          role: formData.role || null,
          is_primary: formData.is_primary,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null
        })
        .eq('id', selectedEmployee.id);
      
      if (error) throw error;
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الموظف في الوحدة التنظيمية"
      });
      
      setIsEditEmployeeOpen(false);
      queryClient.invalidateQueries({ queryKey: ['organizational-unit-employees', unitId] });
    } catch (error) {
      console.error("Error updating employee in unit:", error);
      toast({
        title: "حدث خطأ",
        description: "لم يتم تحديث بيانات الموظف",
        variant: "destructive"
      });
    }
  };

  // الحصول على قائمة الموظفين
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, full_name, position, department')
          .eq('status', 'active');
          
        if (error) throw error;
        setAllEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    
    fetchEmployees();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-md"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-medium">{unitInfo?.name || "الوحدة التنظيمية"}</h3>
          <p className="text-sm text-muted-foreground">{unitInfo?.description}</p>
          <Badge variant="outline" className="mt-1">
            {unitInfo?.unit_type === "department" ? "إدارة" : 
             unitInfo?.unit_type === "division" ? "قسم" :
             unitInfo?.unit_type === "section" ? "شعبة" :
             unitInfo?.unit_type === "team" ? "فريق" :
             unitInfo?.unit_type === "position" ? "منصب" : 
             "وحدة تنظيمية"}
          </Badge>
        </div>
        
        <Sheet open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
          <SheetTrigger asChild>
            <Button className="gap-1">
              <UserPlus className="h-4 w-4" />
              إضافة موظف
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>إضافة موظف للوحدة التنظيمية</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">الموظف</Label>
                <Select 
                  value={formData.employee_id} 
                  onValueChange={(value) => handleChange("employee_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {allEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">المنصب/الدور</Label>
                <input
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  placeholder="مثال: مدير، موظف، مشرف..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البداية</Label>
                <input
                  id="start_date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ النهاية (اختياري)</Label>
                <input
                  id="end_date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => handleChange("is_primary", checked)}
                />
                <Label htmlFor="is_primary">وحدة أساسية للموظف</Label>
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleAddEmployee}>إضافة</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
        <Sheet open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>تعديل بيانات الموظف في الوحدة</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>الموظف</Label>
                <div className="py-2 px-3 border rounded-md bg-muted">
                  {selectedEmployee?.employee.full_name}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">المنصب/الدور</Label>
                <input
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  placeholder="مثال: مدير، موظف، مشرف..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البداية</Label>
                <input
                  id="start_date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ النهاية (اختياري)</Label>
                <input
                  id="end_date"
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => handleChange("is_primary", checked)}
                />
                <Label htmlFor="is_primary">وحدة أساسية للموظف</Label>
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleUpdateEmployee}>حفظ التغييرات</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="active">الموظفون النشطون ({activeEmployees.length})</TabsTrigger>
          <TabsTrigger value="inactive">الموظفون غير النشطين ({inactiveEmployees.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          {activeEmployees.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-center text-muted-foreground">
                لا يوجد موظفون نشطون في هذه الوحدة
              </CardContent>
            </Card>
          ) : (
            activeEmployees.map((emp) => (
              <Card key={emp.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="font-medium">{emp.employee.full_name}</div>
                      {emp.role && <div className="text-sm text-muted-foreground">{emp.role}</div>}
                      <div className="flex gap-2 mt-1">
                        {emp.is_primary && (
                          <Badge variant="secondary" className="text-xs">
                            أساسي
                          </Badge>
                        )}
                        {emp.start_date && (
                          <Badge variant="outline" className="text-xs">
                            من {new Date(emp.start_date).toLocaleDateString('ar-SA')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(emp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(emp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4 mt-4">
          {inactiveEmployees.length === 0 ? (
            <Card>
              <CardContent className="py-4 text-center text-muted-foreground">
                لا يوجد موظفون غير نشطين في هذه الوحدة
              </CardContent>
            </Card>
          ) : (
            inactiveEmployees.map((emp) => (
              <Card key={emp.id} className="overflow-hidden opacity-75">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="font-medium">{emp.employee.full_name}</div>
                      {emp.role && <div className="text-sm text-muted-foreground">{emp.role}</div>}
                      <div className="flex gap-2 mt-1">
                        {emp.end_date && (
                          <Badge variant="outline" className="text-xs">
                            انتهى في {new Date(emp.end_date).toLocaleDateString('ar-SA')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(emp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
