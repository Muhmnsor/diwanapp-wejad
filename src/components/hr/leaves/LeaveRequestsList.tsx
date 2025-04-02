
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LeaveRequest {
  id: string;
  employee_id: string;
  employee: {
    full_name: string;
  };
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
  request: {
    id: string;
    status: string;
    current_step_id: string | null;
  } | null;
}

export function LeaveRequestsList() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user has admin role - replace with your actual role check logic
    const checkAdminRole = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role_id, roles!inner(name)')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const hasAdminRole = data.some(role => 
          role.roles && (role.roles as any).name === 'admin' || (role.roles as any).name === 'hr_admin'
        );
        
        setIsAdmin(hasAdminRole);
      } catch (err) {
        console.error('Error checking admin role:', err);
      }
    };
    
    checkAdminRole();
  }, [user?.id]);

  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['leave-requests', user?.id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('hr_leave_requests')
        .select(`
          *,
          employee:employees!inner(full_name),
          request:requests(id, status, current_step_id)
        `)
        .order('created_at', { ascending: false });
      
      if (!isAdmin && user?.id) {
        // If not admin, only show the user's own requests
        query = query.eq('employees.user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching leave requests:', error);
        throw error;
      }
      
      return data as unknown as LeaveRequest[];
    },
    enabled: !!user?.id
  });

  const filteredRequests = leaveRequests?.filter(request => {
    if (!filter) return true;
    
    const searchLower = filter.toLowerCase();
    return (
      request.employee.full_name.toLowerCase().includes(searchLower) ||
      request.leave_type.toLowerCase().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower)
    );
  });

  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge variant="success">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-64" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>طلبات الإجازات</CardTitle>
            <CardDescription>
              {isAdmin
                ? 'عرض جميع طلبات الإجازات'
                : 'عرض طلبات الإجازات الخاصة بك'}
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن طلبات الإجازات..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRequests?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد طلبات إجازات حالياً</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>الموظف</TableHead>}
                  <TableHead>نوع الإجازة</TableHead>
                  <TableHead>تاريخ البداية</TableHead>
                  <TableHead>تاريخ النهاية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ التقديم</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests?.map((request) => (
                  <TableRow key={request.id}>
                    {isAdmin && <TableCell>{request.employee.full_name}</TableCell>}
                    <TableCell>{request.leave_type}</TableCell>
                    <TableCell>
                      {format(new Date(request.start_date), 'P', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.end_date), 'P', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {renderStatus(request.request?.status || request.status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'P', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {request.request?.id ? (
                        <Button variant="outline" size="sm">
                          عرض الطلب
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          لا يوجد طلب مرتبط
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
