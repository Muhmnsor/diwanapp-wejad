
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ContractAlerts() {
  const { 
    expiringContracts, 
    endingProbations, 
    isLoading,
    error 
  } = useEmployeeContracts();
  
  const { data: permissions } = useHRPermissions();
  
  // Check if user has HR permissions
  const hasAccess = permissions?.canViewHR || permissions?.isAdmin;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري تحميل بيانات العقود...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل بيانات العقود'}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!hasAccess) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>وصول محدود</AlertTitle>
        <AlertDescription>
          لا تملك الصلاحيات الكافية لعرض بيانات العقود
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Contracts Expiring Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center">
            <AlertCircle className="h-5 w-5 ml-2 text-amber-500" />
            عقود قاربت على الانتهاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringContracts && expiringContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                  <TableHead className="text-right">المدة المتبقية</TableHead>
                  <TableHead className="text-right">العقد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringContracts.map((contract: any) => {
                  const daysRemaining = differenceInDays(
                    new Date(contract.end_date),
                    new Date()
                  );
                  
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.employees?.full_name}</TableCell>
                      <TableCell>{contract.employees?.department || 'غير محدد'}</TableCell>
                      <TableCell>{format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar })}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={daysRemaining <= 7 ? "destructive" : "outline"}
                          className={daysRemaining <= 7 ? "" : "border-amber-500 text-amber-500"}
                        >
                          {daysRemaining} يوم
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contract.document_url ? (
                          <a 
                            href={contract.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 ml-1" />
                            عرض
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">غير متوفر</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد عقود على وشك الانتهاء</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Probation Periods Ending Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right flex items-center">
            <AlertCircle className="h-5 w-5 ml-2 text-blue-500" />
            فترات تجربة قاربت على الانتهاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          {endingProbations && endingProbations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">القسم</TableHead>
                  <TableHead className="text-right">تاريخ انتهاء فترة التجربة</TableHead>
                  <TableHead className="text-right">المدة المتبقية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endingProbations.map((contract: any) => {
                  const daysRemaining = differenceInDays(
                    new Date(contract.probation_end_date),
                    new Date()
                  );
                  
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.employees?.full_name}</TableCell>
                      <TableCell>{contract.employees?.department || 'غير محدد'}</TableCell>
                      <TableCell>{format(new Date(contract.probation_end_date), 'yyyy/MM/dd', { locale: ar })}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={daysRemaining <= 7 ? "destructive" : "outline"}
                          className={daysRemaining <= 7 ? "" : "border-blue-500 text-blue-500"}
                        >
                          {daysRemaining} يوم
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد فترات تجربة على وشك الانتهاء</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
