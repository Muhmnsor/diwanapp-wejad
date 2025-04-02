
import * as XLSX from 'xlsx';

interface SheetData {
  name: string;
  data: any[];
}

export const exportToExcel = async (
  sheets: SheetData[],
  fileName: string = 'export'
): Promise<void> => {
  try {
    // Dynamically import XLSX only when needed
    const XLSX = await import('xlsx');
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add each sheet to the workbook
    sheets.forEach(sheet => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });
    
    // Save the workbook
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return Promise.reject(error);
  }
};

export const exportToCSV = async (
  data: any[],
  fileName: string = 'export'
): Promise<void> => {
  try {
    // Dynamically import XLSX only when needed
    const XLSX = await import('xlsx');
    
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Save as CSV
    XLSX.writeFile(workbook, `${fileName}.csv`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return Promise.reject(error);
  }
};
