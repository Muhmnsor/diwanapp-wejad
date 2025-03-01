
export interface ExportOptions {
  reportTitle: string;
  timePeriod: string;
  startDate: Date;
  endDate: Date;
  includeResourceDetails: boolean;
  includeExpenseDetails: boolean;
  includeBudgetItems: boolean;
  includeCharts: boolean;
}

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (reportType: string, options: ExportOptions) => void;
  reportType: string | null;
  isExporting: boolean;
}
