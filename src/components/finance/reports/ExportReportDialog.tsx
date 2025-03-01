
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';

interface ExportReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (reportType: string, options: any) => void;
  reportType: string | null;
  isExporting: boolean;
}

export const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  reportType,
  isExporting
}) => {
  const [options, setOptions] = useState({
    reportTitle: "",
    timePeriod: "current-year",
    startDate: new Date(),
    endDate: new Date(),
    includeResourceDetails: false,
    includeExpenseDetails: false,
    includeBudgetItems: false,
    includeCharts: true,
  });

  // Get report title based on report type
  useEffect(() => {
    if (reportType) {
      let title = "";
      switch (reportType) {
        case "summary":
          title = "الملخص المالي";
          break;
        case "resources":
          title = "تقرير الموارد المالية";
          break;
        case "expenses":
          title = "تقرير المصروفات";
          break;
        case "comparison":
          title = "تقرير مقارنة المستهدفات";
          break;
        case "budget-distribution":
          title = "توزيع الإنفاق على البنود";
          break;
        case "comprehensive":
          title = "التقرير المالي الشامل";
          break;
        default:
          title = "تقرير مالي";
      }
      setOptions({...options, reportTitle: title});
    }
  }, [reportType]);

  const getDialogTitle = () => {
    if (!reportType) return "تصدير تقرير";
    
    switch (reportType) {
      case "summary":
        return "تصدير الملخص المالي";
      case "resources":
        return "تصدير تقرير الموارد المالية";
      case "expenses":
        return "تصدير تقرير المصروفات";
      case "comparison":
        return "تصدير تقرير مقارنة المستهدفات";
      case "budget-distribution":
        return "تصدير تقرير توزيع الإنفاق على البنود";
      case "comprehensive":
        return "تصدير التقرير المالي الشامل";
      default:
        return "تصدير تقرير";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reportTitle" className="text-right col-span-1">
              عنوان التقرير
            </Label>
            <Input
              id="reportTitle"
              className="col-span-3 text-right"
              value={options.reportTitle}
              onChange={(e) => setOptions({...options, reportTitle: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timePeriod" className="text-right col-span-1">
              الفترة الزمنية
            </Label>
            <Select
              value={options.timePeriod}
              onValueChange={(value) => setOptions({...options, timePeriod: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-year">السنة الحالية</SelectItem>
                <SelectItem value="last-year">السنة الماضية</SelectItem>
                <SelectItem value="current-quarter">الربع الحالي</SelectItem>
                <SelectItem value="custom">فترة مخصصة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {options.timePeriod === "custom" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right col-span-1">تاريخ البداية</Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-right"
                      >
                        {options.startDate ? (
                          format(options.startDate, "yyyy/MM/dd", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={options.startDate}
                        onSelect={(date) => date && setOptions({...options, startDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right col-span-1">تاريخ النهاية</Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-right"
                      >
                        {options.endDate ? (
                          format(options.endDate, "yyyy/MM/dd", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={options.endDate}
                        onSelect={(date) => date && setOptions({...options, endDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </>
          )}

          {(reportType === "resources" || reportType === "comprehensive") && (
            <div className="flex items-center gap-2 justify-end">
              <Checkbox
                id="includeResourceDetails"
                checked={options.includeResourceDetails}
                onCheckedChange={(checked) => 
                  setOptions({...options, includeResourceDetails: checked === true})
                }
              />
              <Label htmlFor="includeResourceDetails" className="text-right">
                تضمين تفاصيل الموارد
              </Label>
            </div>
          )}

          {(reportType === "expenses" || reportType === "comprehensive") && (
            <div className="flex items-center gap-2 justify-end">
              <Checkbox
                id="includeExpenseDetails"
                checked={options.includeExpenseDetails}
                onCheckedChange={(checked) => 
                  setOptions({...options, includeExpenseDetails: checked === true})
                }
              />
              <Label htmlFor="includeExpenseDetails" className="text-right">
                تضمين تفاصيل المصروفات
              </Label>
            </div>
          )}

          {(reportType === "budget-distribution" || reportType === "comprehensive") && (
            <div className="flex items-center gap-2 justify-end">
              <Checkbox
                id="includeBudgetItems"
                checked={options.includeBudgetItems}
                onCheckedChange={(checked) => 
                  setOptions({...options, includeBudgetItems: checked === true})
                }
              />
              <Label htmlFor="includeBudgetItems" className="text-right">
                تضمين بنود الميزانية
              </Label>
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            <Checkbox
              id="includeCharts"
              checked={options.includeCharts}
              onCheckedChange={(checked) => 
                setOptions({...options, includeCharts: checked === true})
              }
            />
            <Label htmlFor="includeCharts" className="text-right">
              تضمين الرسوم البيانية
            </Label>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="mr-auto"
          >
            إلغاء
          </Button>
          <Button 
            type="submit" 
            onClick={() => reportType && onExport(reportType, options)}
            disabled={isExporting}
          >
            {isExporting ? "جاري التصدير..." : "تصدير التقرير"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
