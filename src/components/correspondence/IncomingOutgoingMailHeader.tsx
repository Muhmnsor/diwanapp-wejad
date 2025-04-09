
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  X
} from 'lucide-react';

interface IncomingOutgoingMailHeaderProps {
  onSearch: (query: string) => void;
  onFilterType: (type: string) => void;
  onFilterStatus: (status: string) => void;
  onAddNew: () => void;
  onExport?: () => void;
  onImport?: () => void;
  showAdvanced: boolean;
  toggleAdvanced: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  selectedStatus: string;
}

export const IncomingOutgoingMailHeader: React.FC<IncomingOutgoingMailHeaderProps> = ({
  onSearch,
  onFilterType,
  onFilterStatus,
  onAddNew,
  onExport,
  onImport,
  showAdvanced,
  toggleAdvanced,
  searchQuery,
  setSearchQuery,
  selectedType,
  selectedStatus
}) => {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h2 className="text-2xl font-bold">المعاملات الصادرة والواردة</h2>
        <div className="flex gap-2">
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 ml-1" />
            معاملة جديدة
          </Button>
          <Button
            variant="outline"
            onClick={toggleAdvanced}
          >
            <Filter className="h-4 w-4 ml-1" />
            {showAdvanced ? 'إخفاء التصفية' : 'تصفية متقدمة'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form className="w-full sm:max-w-md flex-1" onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="بحث عن معاملة..."
              className="pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <Select value={selectedType} onValueChange={onFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="وارد">وارد</SelectItem>
            <SelectItem value="صادر">صادر</SelectItem>
            <SelectItem value="داخلي">داخلي</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={onFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
            <SelectItem value="مكتمل">مكتمل</SelectItem>
            <SelectItem value="معلق">معلق</SelectItem>
            <SelectItem value="مرسل">مرسل</SelectItem>
            <SelectItem value="قيد الإعداد">قيد الإعداد</SelectItem>
            <SelectItem value="معتمد">معتمد</SelectItem>
            <SelectItem value="مسودة">مسودة</SelectItem>
          </SelectContent>
        </Select>

        {(onExport || onImport) && (
          <div className="flex gap-1">
            {onExport && (
              <Button variant="outline" size="icon" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onImport && (
              <Button variant="outline" size="icon" onClick={onImport}>
                <Upload className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-md border relative">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={toggleAdvanced} 
            className="absolute top-2 right-2 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">التاريخ من</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">التاريخ إلى</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">المرسل</label>
              <Input placeholder="اسم المرسل" />
            </div>
            <div>
              <label className="text-sm font-medium">المستلم</label>
              <Input placeholder="اسم المستلم" />
            </div>
            <div>
              <label className="text-sm font-medium">الأولوية</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="عاجل">عاجل</SelectItem>
                  <SelectItem value="مهم">مهم</SelectItem>
                  <SelectItem value="عادي">عادي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">السرية</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="true">سري</SelectItem>
                  <SelectItem value="false">غير سري</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="ml-2">إعادة تعيين</Button>
            <Button>تطبيق</Button>
          </div>
        </div>
      )}
    </div>
  );
};
