
import { jsPDF } from "jspdf";
import { configurePdfForArabic, addElementToPdf, generatePdfFilename } from "./pdfUtils";
import { toast } from "sonner";

export interface PersonalReportData {
  userName: string;
  userEmail?: string;
  period: string;
  tasksStats: {
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
  };
  performanceStats: {
    completionRate: number;
    averageDelayDays: number;
    earlyCompletions: number;
    lateCompletions: number;
  };
}

export const exportPersonalReport = async (reportData: PersonalReportData): Promise<void> => {
  try {
    toast.info("جاري إنشاء التقرير...");
    
    // Create PDF document with RTL support
    const pdf = new jsPDF();
    configurePdfForArabic(pdf);
    
    // Add report title
    pdf.setFontSize(22);
    pdf.text("تقرير المهام الشخصي", pdf.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    
    // Add user info section
    pdf.setFontSize(14);
    pdf.text(`المستخدم: ${reportData.userName}`, pdf.internal.pageSize.getWidth() - 20, 40, { align: "right" });
    if (reportData.userEmail) {
      pdf.text(`البريد الإلكتروني: ${reportData.userEmail}`, pdf.internal.pageSize.getWidth() - 20, 50, { align: "right" });
    }
    pdf.text(`الفترة: ${reportData.period}`, pdf.internal.pageSize.getWidth() - 20, 60, { align: "right" });
    pdf.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`, pdf.internal.pageSize.getWidth() - 20, 70, { align: "right" });
    
    // Add horizontal line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 80, pdf.internal.pageSize.getWidth() - 20, 80);
    
    // Add task statistics section
    pdf.setFontSize(16);
    pdf.text("إحصائيات المهام", pdf.internal.pageSize.getWidth() / 2, 100, { align: "center" });
    
    pdf.setFontSize(12);
    const stats = reportData.tasksStats;
    const statItems = [
      `إجمالي المهام: ${stats.completedTasks + stats.pendingTasks + stats.inProgressTasks}`,
      `المهام المكتملة: ${stats.completedTasks}`,
      `المهام قيد التنفيذ: ${stats.inProgressTasks}`,
      `المهام المعلقة: ${stats.pendingTasks}`,
      `المهام المتأخرة: ${stats.overdueTasks}`,
    ];
    
    let yPos = 120;
    statItems.forEach(item => {
      pdf.text(item, pdf.internal.pageSize.getWidth() - 30, yPos, { align: "right" });
      yPos += 10;
    });
    
    // Add performance statistics section
    pdf.setFontSize(16);
    pdf.text("إحصائيات الأداء", pdf.internal.pageSize.getWidth() / 2, 180, { align: "center" });
    
    pdf.setFontSize(12);
    const performance = reportData.performanceStats;
    const performanceItems = [
      `نسبة إنجاز المهام: ${performance.completionRate}%`,
      `متوسط وقت التأخير: ${performance.averageDelayDays} يوم`,
      `المهام المنجزة قبل الموعد: ${performance.earlyCompletions}`,
      `المهام المتأخرة: ${performance.lateCompletions}`,
    ];
    
    yPos = 200;
    performanceItems.forEach(item => {
      pdf.text(item, pdf.internal.pageSize.getWidth() - 30, yPos, { align: "right" });
      yPos += 10;
    });
    
    // Add chart elements if they exist in the DOM
    try {
      const chartIds = [
        "status-distribution-chart",
        "productivity-chart",
        "completion-time-chart",
        "delay-time-chart",
        "on-time-completion-chart"
      ];
      
      let currentY = 250;
      
      for (const chartId of chartIds) {
        const element = document.getElementById(chartId);
        if (element) {
          if (currentY > pdf.internal.pageSize.getHeight() - 60) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFontSize(14);
          pdf.text(`الرسم البياني: ${element.getAttribute("data-title") || chartId}`, 
            pdf.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
          
          currentY += 10;
          
          const newY = await addElementToPdf(chartId, pdf, {
            y: currentY,
            width: pdf.internal.pageSize.getWidth() - 40,
          });
          
          if (newY > 0) {
            currentY = newY + 20; // Add some padding
          } else {
            currentY += 100; // Fallback if chart couldn't be added
          }
        }
      }
    } catch (error) {
      console.error("Error adding charts to PDF:", error);
    }
    
    // Save the PDF
    const filename = generatePdfFilename("تقرير-المهام-الشخصي");
    pdf.save(filename);
    
    toast.success("تم تصدير التقرير بنجاح");
  } catch (error) {
    console.error("Error exporting personal report:", error);
    toast.error("حدث خطأ أثناء تصدير التقرير");
  }
};
