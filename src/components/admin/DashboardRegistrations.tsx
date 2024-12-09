import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButton } from "./ExportButton";
import { RegistrationsTable } from "./RegistrationsTable";
import { Registration } from "./types";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { useState } from "react";

interface DashboardRegistrationsProps {
  registrations: Registration[];
  eventTitle: string;
}

export const DashboardRegistrations = ({ registrations, eventTitle }: DashboardRegistrationsProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatRegistrationNumber = (number: string) => {
    return number.split('-').pop() || number;
  };

  const exportToExcel = async () => {
    if (!registrations?.length) {
      toast.error("لا يوجد بيانات للتصدير");
      return;
    }
    
    setIsExporting(true);
    try {
      const exportData = registrations.map(reg => ({
        'رقم التسجيل': formatRegistrationNumber(reg.registration_number),
        'الاسم': reg.name,
        'البريد الإلكتروني': reg.email,
        'رقم الجوال': reg.phone,
        'تاريخ التسجيل': new Date(reg.created_at).toLocaleString('ar-SA')
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "المسجلين");
      
      const fileName = `المسجلين-${eventTitle}-${new Date().toLocaleDateString('ar-SA')}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>قائمة المسجلين</CardTitle>
        <ExportButton
          onClick={exportToExcel}
          isExporting={isExporting}
          disabled={!registrations?.length}
        />
      </CardHeader>
      <CardContent>
        <RegistrationsTable 
          registrations={registrations} 
          eventTitle={eventTitle}
        />
      </CardContent>
    </Card>
  );
};