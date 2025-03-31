
import { jsPDF } from "jspdf";
import { configurePdfForArabic } from "./pdfUtils";
import { toast } from "sonner";
import { AttendanceReportData } from "@/hooks/hr/useAttendanceReport";
import { LeaveReportData } from "@/hooks/hr/useLeaveReport";
import { EmployeeReportData } from "@/hooks/hr/useEmployeeReport";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Export attendance report to PDF
export const exportAttendanceReportToPdf = async (
  data: AttendanceReportData,
  startDate?: Date,
  endDate?: Date
): Promise<void> => {
  try {
    toast.info("جاري إنشاء التقرير...");
    
    // Create PDF document with RTL support
    const pdf = new jsPDF();
    configurePdfForArabic(pdf);
    
    // Add report title
    pdf.setFontSize(22);
    pdf.text("تقرير الحضور", pdf.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Add date range
    if (startDate && endDate) {
      pdf.setFontSize(14);
      const dateRange = `الفترة: ${format(startDate, "yyyy/MM/dd", { locale: ar })} - ${format(endDate, "yyyy/MM/dd", { locale: ar })}`;
      pdf.text(dateRange, pdf.internal.pageSize.getWidth() - 20, 35, { align: "right" });
    }
    
    // Add statistics section
    pdf.setFontSize(16);
    pdf.text("إحصائيات الحضور", pdf.internal.pageSize.getWidth() / 2, 50, { align: "center" });
    
    pdf.setFontSize(12);
    const stats = data.stats;
    const statItems = [
      `إجمالي السجلات: ${stats.totalRecords}`,
      `عدد الحضور: ${stats.presentCount} (${stats.presentPercentage.toFixed(1)}%)`,
      `عدد الغياب: ${stats.absentCount} (${stats.absentPercentage.toFixed(1)}%)`,
      `عدد المتأخرين: ${stats.lateCount} (${stats.latePercentage.toFixed(1)}%)`,
      `عدد الإجازات: ${stats.leaveCount} (${stats.leavePercentage.toFixed(1)}%)`,
    ];
    
    let yPos = 65;
    statItems.forEach(item => {
      pdf.text(item, pdf.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
      yPos += 10;
    });
    
    // Add attendance records table
    pdf.setFontSize(16);
    pdf.text("سجلات الحضور", pdf.internal.pageSize.getWidth() / 2, 120, { align: "center" });
    
    // Table headers
    pdf.setFontSize(11);
    const headers = ["الموظف", "التاريخ", "وقت الحضور", "وقت الانصراف", "الحالة", "ملاحظات"];
    const columnWidths = [50, 35, 30, 30, 25, 20];
    
    yPos = 130;
    
    // Draw table headers
    let xPos = 10;
    headers.forEach((header, index) => {
      pdf.text(header, pdf.internal.pageSize.getWidth() - xPos - columnWidths[index], yPos, { align: "right" });
      xPos += columnWidths[index];
    });
    
    // Draw horizontal line
    pdf.line(10, yPos + 5, pdf.internal.pageSize.getWidth() - 10, yPos + 5);
    yPos += 15;
    
    // Draw table rows (limit to first 20 records to fit on page)
    const recordsToShow = data.records.slice(0, 20);
    
    recordsToShow.forEach((record) => {
      if (yPos > pdf.internal.pageSize.getHeight() - 20) {
        // Add new page if we're near the bottom
        pdf.addPage();
        yPos = 20;
      }
      
      // Format status
      let status = record.status;
      if (status === 'present') status = 'حاضر';
      else if (status === 'absent') status = 'غائب';
      else if (status === 'late') status = 'متأخر';
      else if (status === 'leave') status = 'إجازة';
      
      // Format check-in and check-out times
      const checkIn = record.check_in 
        ? new Date(record.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) 
        : '-';
      const checkOut = record.check_out 
        ? new Date(record.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) 
        : '-';
      
      // Draw row
      xPos = 10;
      const rowData = [
        record.employee_name || 'غير محدد',
        record.attendance_date,
        checkIn,
        checkOut,
        status,
        record.notes || '-'
      ];
      
      rowData.forEach((value, index) => {
        pdf.text(
          value.toString().substring(0, 20), // Limit text length
          pdf.internal.pageSize.getWidth() - xPos - columnWidths[index], 
          yPos, 
          { align: "right" }
        );
        xPos += columnWidths[index];
      });
      
      yPos += 10;
    });
    
    // Add notes about truncated data if needed
    if (data.records.length > 20) {
      pdf.setFontSize(10);
      pdf.text(
        `* تم عرض ${recordsToShow.length} سجل من أصل ${data.records.length}`,
        pdf.internal.pageSize.getWidth() / 2,
        yPos + 10,
        { align: "center" }
      );
    }
    
    // Save the PDF
    pdf.save("تقرير_الحضور.pdf");
    
    toast.success("تم تصدير التقرير بنجاح");
  } catch (error) {
    console.error("Error exporting attendance report:", error);
    toast.error("حدث خطأ أثناء تصدير التقرير");
  }
};

// Export leave report to PDF
export const exportLeaveReportToPdf = async (
  data: LeaveReportData,
  startDate?: Date,
  endDate?: Date
): Promise<void> => {
  try {
    toast.info("جاري إنشاء التقرير...");
    
    // Create PDF document with RTL support
    const pdf = new jsPDF();
    configurePdfForArabic(pdf);
    
    // Add report title
    pdf.setFontSize(22);
    pdf.text("تقرير الإجازات", pdf.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Add date range
    if (startDate && endDate) {
      pdf.setFontSize(14);
      const dateRange = `الفترة: ${format(startDate, "yyyy/MM/dd", { locale: ar })} - ${format(endDate, "yyyy/MM/dd", { locale: ar })}`;
      pdf.text(dateRange, pdf.internal.pageSize.getWidth() - 20, 35, { align: "right" });
    }
    
    // Add statistics section
    pdf.setFontSize(16);
    pdf.text("إحصائيات الإجازات", pdf.internal.pageSize.getWidth() / 2, 50, { align: "center" });
    
    pdf.setFontSize(12);
    const stats = data.stats;
    const statItems = [
      `إجمالي الطلبات: ${stats.totalRequests}`,
      `إجمالي أيام الإجازات: ${stats.totalDays} يوم`,
      `طلبات موافق عليها: ${stats.approvedCount} (${stats.approvedPercentage.toFixed(1)}%)`,
      `طلبات مرفوضة: ${stats.rejectedCount} (${stats.rejectedPercentage.toFixed(1)}%)`,
      `طلبات قيد الانتظار: ${stats.pendingCount} (${stats.pendingPercentage.toFixed(1)}%)`,
    ];
    
    let yPos = 65;
    statItems.forEach(item => {
      pdf.text(item, pdf.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
      yPos += 10;
    });
    
    // Add leave type statistics if available
    if (data.leaveTypeStats && data.leaveTypeStats.length > 0) {
      yPos += 10;
      pdf.setFontSize(14);
      pdf.text("توزيع أنواع الإجازات", pdf.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
      yPos += 10;
      
      data.leaveTypeStats.forEach(stat => {
        pdf.setFontSize(11);
        pdf.text(`${stat.leave_type}: ${stat.count} طلب (${stat.days} يوم)`, pdf.internal.pageSize.getWidth() - 30, yPos, { align: "right" });
        yPos += 8;
      });
    }
    
    // Add leave records table
    pdf.setFontSize(16);
    yPos += 10;
    pdf.text("سجلات الإجازات", pdf.internal.pageSize.getWidth() / 2, yPos, { align: "center" });
    
    // Table headers
    pdf.setFontSize(11);
    const headers = ["الموظف", "نوع الإجازة", "تاريخ البداية", "تاريخ النهاية", "المدة", "الحالة"];
    const columnWidths = [50, 35, 30, 30, 20, 25];
    
    yPos += 10;
    
    // Draw table headers
    let xPos = 10;
    headers.forEach((header, index) => {
      pdf.text(header, pdf.internal.pageSize.getWidth() - xPos - columnWidths[index], yPos, { align: "right" });
      xPos += columnWidths[index];
    });
    
    // Draw horizontal line
    pdf.line(10, yPos + 5, pdf.internal.pageSize.getWidth() - 10, yPos + 5);
    yPos += 15;
    
    // Draw table rows (limit to fit on page)
    const recordsToShow = data.records.slice(0, 15);
    
    recordsToShow.forEach((record) => {
      if (yPos > pdf.internal.pageSize.getHeight() - 20) {
        // Add new page if we're near the bottom
        pdf.addPage();
        yPos = 20;
      }
      
      // Format status
      let status = record.status;
      if (status === 'approved') status = 'موافق';
      else if (status === 'rejected') status = 'مرفوض';
      else if (status === 'pending') status = 'قيد الانتظار';
      
      // Draw row
      xPos = 10;
      const rowData = [
        record.employee_name || 'غير محدد',
        record.leave_type,
        new Date(record.start_date).toLocaleDateString('ar-SA'),
        new Date(record.end_date).toLocaleDateString('ar-SA'),
        `${record.duration} يوم`,
        status
      ];
      
      rowData.forEach((value, index) => {
        pdf.text(
          value.toString().substring(0, 20), // Limit text length
          pdf.internal.pageSize.getWidth() - xPos - columnWidths[index], 
          yPos, 
          { align: "right" }
        );
        xPos += columnWidths[index];
      });
      
      yPos += 10;
    });
    
    // Save the PDF
    pdf.save("تقرير_الإجازات.pdf");
    
    toast.success("تم تصدير التقرير بنجاح");
  } catch (error) {
    console.error("Error exporting leave report:", error);
    toast.error("حدث خطأ أثناء تصدير التقرير");
  }
};

// Export employee report to PDF
export const exportEmployeeReportToPdf = async (
  data: EmployeeReportData,
  startDate?: Date,
  endDate?: Date
): Promise<void> => {
  try {
    toast.info("جاري إنشاء التقرير...");
    
    // Create PDF document with RTL support
    const pdf = new jsPDF();
    configurePdfForArabic(pdf);
    
    // Add report title
    pdf.setFontSize(22);
    pdf.text("تقرير الموظفين", pdf.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Add date filter info if provided
    if (startDate && endDate) {
      pdf.setFontSize(14);
      const dateRange = `تم التعيين في الفترة: ${format(startDate, "yyyy/MM/dd", { locale: ar })} - ${format(endDate, "yyyy/MM/dd", { locale: ar })}`;
      pdf.text(dateRange, pdf.internal.pageSize.getWidth() - 20, 35, { align: "right" });
    }
    
    // Add statistics section
    pdf.setFontSize(16);
    pdf.text("إحصائيات الموظفين", pdf.internal.pageSize.getWidth() / 2, 50, { align: "center" });
    
    pdf.setFontSize(12);
    const stats = data.stats;
    const statItems = [
      `إجمالي الموظفين: ${stats.totalEmployees}`,
      `الموظفين النشطين: ${stats.activeCount} (${stats.totalEmployees ? ((stats.activeCount / stats.totalEmployees) * 100).toFixed(1) : 0}%)`,
      `عدد الأقسام: ${stats.departmentCount}`,
      `عدد المناصب: ${stats.positionCount}`,
    ];
    
    let yPos = 65;
    statItems.forEach(item => {
      pdf.text(item, pdf.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
      yPos += 10;
    });
    
    // Add department distribution if available
    if (data.stats.byDepartment && data.stats.byDepartment.length > 0) {
      yPos += 10;
      pdf.setFontSize(14);
      pdf.text("توزيع الموظفين حسب الأقسام", pdf.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
      yPos += 10;
      
      data.stats.byDepartment.forEach(dept => {
        pdf.setFontSize(11);
        pdf.text(`${dept.name || 'غير محدد'}: ${dept.count} موظف`, pdf.internal.pageSize.getWidth() - 30, yPos, { align: "right" });
        yPos += 8;
      });
    }
    
    // Add employees table
    pdf.setFontSize(16);
    yPos += 10;
    if (yPos > pdf.internal.pageSize.getHeight() - 100) {
      // Add new page if we're near the bottom
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.text("قائمة الموظفين", pdf.internal.pageSize.getWidth() / 2, yPos, { align: "center" });
    
    // Table headers
    pdf.setFontSize(11);
    const headers = ["الاسم", "القسم", "المنصب", "تاريخ التعيين", "نوع العقد", "الحالة"];
    const columnWidths = [50, 40, 40, 30, 20, 20];
    
    yPos += 10;
    
    // Draw table headers
    let xPos = 10;
    headers.forEach((header, index) => {
      pdf.text(header, pdf.internal.pageSize.getWidth() - xPos - columnWidths[index], yPos, { align: "right" });
      xPos += columnWidths[index];
    });
    
    // Draw horizontal line
    pdf.line(10, yPos + 5, pdf.internal.pageSize.getWidth() - 10, yPos + 5);
    yPos += 15;
    
    // Draw table rows (limit to fit on page)
    const recordsToShow = data.employees.slice(0, 15);
    
    recordsToShow.forEach((employee) => {
      if (yPos > pdf.internal.pageSize.getHeight() - 20) {
        // Add new page if we're near the bottom
        pdf.addPage();
        yPos = 20;
      }
      
      // Format status
      let status = employee.status;
      if (status === 'active') status = 'نشط';
      else if (status === 'inactive') status = 'غير نشط';
      else if (status === 'vacation') status = 'إجازة';
      else if (status === 'terminated') status = 'منتهي';
      
      // Draw row
      xPos = 10;
      const rowData = [
        employee.full_name,
        employee.department || '-',
        employee.position || '-',
        employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('ar-SA') : '-',
        employee.contract_type || '-',
        status
      ];
      
      rowData.forEach((value, index) => {
        pdf.text(
          value.toString().substring(0, 20), // Limit text length
          pdf.internal.pageSize.getWidth() - xPos - columnWidths[index], 
          yPos, 
          { align: "right" }
        );
        xPos += columnWidths[index];
      });
      
      yPos += 10;
    });
    
    // Add notes about truncated data if needed
    if (data.employees.length > 15) {
      pdf.setFontSize(10);
      pdf.text(
        `* تم عرض ${recordsToShow.length} موظف من أصل ${data.employees.length}`,
        pdf.internal.pageSize.getWidth() / 2,
        yPos + 10,
        { align: "center" }
      );
    }
    
    // Save the PDF
    pdf.save("تقرير_الموظفين.pdf");
    
    toast.success("تم تصدير التقرير بنجاح");
  } catch (error) {
    console.error("Error exporting employee report:", error);
    toast.error("حدث خطأ أثناء تصدير التقرير");
  }
};
