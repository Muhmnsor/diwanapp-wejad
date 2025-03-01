
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface FinancialData {
  totalResources: number;
  totalExpenses: number;
  netBalance: number;
  resourcesData?: any[];
  expensesData?: any[];
}

interface ComparisonData {
  name: string;
  target: number;
  actual: number;
  variance: number;
}

export const exportFinancialReport = async (
  financialData: FinancialData,
  comparisonData: ComparisonData[],
  formatCurrency: (value: number) => string
): Promise<void> => {
  try {
    // إنشاء مصنف Excel جديد
    const workbook = XLSX.utils.book_new();
    
    // إضافة ورقة الملخص المالي
    const summaryData = [
      ['الملخص المالي', ''],
      ['إجمالي الموارد', formatCurrency(financialData.totalResources)],
      ['إجمالي المصروفات', formatCurrency(financialData.totalExpenses)],
      ['الرصيد الصافي', formatCurrency(financialData.netBalance)],
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص المالي');
    
    // إضافة ورقة مقارنة المستهدفات والمصروفات
    if (comparisonData && comparisonData.length > 0) {
      const comparisonHeaders = [['البند', 'المستهدف', 'المصروف الفعلي', 'الفرق']];
      const comparisonRows = comparisonData.map(item => [
        item.name,
        formatCurrency(item.target),
        formatCurrency(item.actual),
        formatCurrency(item.variance)
      ]);
      
      const comparisonSheet = XLSX.utils.aoa_to_sheet([...comparisonHeaders, ...comparisonRows]);
      XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'مقارنة المستهدفات');
    }
    
    // إضافة ورقة تفاصيل الموارد
    if (financialData.resourcesData && financialData.resourcesData.length > 0) {
      const resourcesHeaders = [['المصدر', 'المبلغ', 'التاريخ', 'الوصف']];
      const resourcesRows = financialData.resourcesData.map(resource => [
        resource.source,
        formatCurrency(resource.amount),
        new Date(resource.date).toLocaleDateString('ar-SA'),
        resource.description || ''
      ]);
      
      const resourcesSheet = XLSX.utils.aoa_to_sheet([...resourcesHeaders, ...resourcesRows]);
      XLSX.utils.book_append_sheet(workbook, resourcesSheet, 'الموارد المالية');
    }
    
    // إضافة ورقة تفاصيل المصروفات
    if (financialData.expensesData && financialData.expensesData.length > 0) {
      const expensesHeaders = [['البند', 'المبلغ', 'التاريخ', 'المستفيد', 'الوصف']];
      const expensesRows = financialData.expensesData.map(expense => [
        expense.budget_item_name || 'غير محدد',
        formatCurrency(expense.amount),
        new Date(expense.date).toLocaleDateString('ar-SA'),
        expense.beneficiary || '',
        expense.description || ''
      ]);
      
      const expensesSheet = XLSX.utils.aoa_to_sheet([...expensesHeaders, ...expensesRows]);
      XLSX.utils.book_append_sheet(workbook, expensesSheet, 'المصروفات');
    }
    
    // تحديد عرض الأعمدة لجميع الأوراق
    const sheets = workbook.SheetNames.map(name => workbook.Sheets[name]);
    sheets.forEach(sheet => {
      sheet['!cols'] = [
        { wch: 30 }, // عرض العمود الأول
        { wch: 15 }, // عرض العمود الثاني
        { wch: 15 }, // عرض العمود الثالث
        { wch: 15 }, // عرض العمود الرابع
        { wch: 40 }  // عرض العمود الخامس
      ];
    });
    
    // تغيير اتجاه النص لجميع الأوراق (من اليمين إلى اليسار)
    const wbRtl = {
      Workbook: {
        Views: [{ RTL: true }]
      }
    };
    
    // تحويل المصنف إلى ملف بصيغة xlsx
    const currentDate = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
    const fileName = `التقرير_المالي_${currentDate}.xlsx`;
    
    XLSX.writeFile(workbook, fileName, { bookType: 'xlsx', Props: { Author: 'النظام المالي' }, ...wbRtl });
    
    toast.success('تم تصدير التقرير المالي بنجاح');
    return Promise.resolve();
  } catch (error) {
    console.error('خطأ في تصدير التقرير المالي:', error);
    toast.error('حدث خطأ أثناء تصدير التقرير');
    return Promise.reject(error);
  }
};
