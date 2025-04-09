import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Save } from "lucide-react";

interface AdvancedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (criteria: SearchCriteria) => void;
}

export interface SearchCriteria {
  number?: string;
  subject?: string;
  sender?: string;
  recipient?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  type?: string;
  hasAttachments?: boolean;
  priority?: string;
  is_confidential?: boolean;
  tags?: string[];
  archive_number?: string;
  save_search?: boolean;
}

export const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const [criteria, setCriteria] = useState<SearchCriteria>({});
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchName, setSearchName] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    onSearch(criteria);
    onClose();
  };

  const handleSaveSearch = () => {
    if (!searchName) return;

    // الحصول على عمليات البحث المحفوظة سابقاً
    const savedSearches = localStorage.getItem('savedSearches')
      ? JSON.parse(localStorage.getItem('savedSearches') || '{}')
      : {};

    // حفظ عملية البحث الجديدة
    savedSearches[searchName] = criteria;
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));

    // إعادة ضبط حقل الاسم
    setSearchName("");

    // إظهار رسالة تأكيد (يمكن استخدام toast هنا)
    alert("تم حفظ عملية البحث بنجاح");
  };

  const loadSavedSearch = (name: string) => {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '{}');
    setCriteria(savedSearches[name] || {});
    setShowSavedSearches(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>البحث المتقدم في المعاملات</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="number">رقم المعاملة</Label>
            <Input
              id="number"
              name="number"
              placeholder="أدخل رقم المعاملة"
              value={criteria.number || ""}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="subject">موضوع المعاملة</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="أدخل موضوع المعاملة"
              value={criteria.subject || ""}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="sender">الجهة المرسلة</Label>
            <Input
              id="sender"
              name="sender"
              placeholder="أدخل الجهة المرسلة"
              value={criteria.sender || ""}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="recipient">الجهة المستلمة</Label>
            <Input
              id="recipient"
              name="recipient"
              placeholder="أدخل الجهة المستلمة"
              value={criteria.recipient || ""}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="fromDate">من تاريخ</Label>
            <Input
              id="fromDate"
              name="fromDate"
              type="date"
              value={criteria.fromDate || ""}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="toDate">إلى تاريخ</Label>
            <Input
              id="toDate"
              name="toDate"
              type="date"
              value={criteria.toDate || ""}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="status">الحالة</Label>
            <Select
              value={criteria.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                <SelectItem value="مكتمل">مكتمل</SelectItem>
                <SelectItem value="معلق">معلق</SelectItem>
                <SelectItem value="مرسل">مرسل</SelectItem>
                <SelectItem value="قيد الإعداد">قيد الإعداد</SelectItem>
                <SelectItem value="معتمد">معتمد</SelectItem>
                <SelectItem value="مسودة">مسودة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">النوع</Label>
            <Select
              value={criteria.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="incoming">وارد</SelectItem>
                <SelectItem value="outgoing">صادر</SelectItem>
                <SelectItem value="letter">خطاب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">الأولوية</Label>
            <Select
              value={criteria.priority}
              onValueChange={(value) => handleSelectChange('priority', value)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="high">عاجل</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">عادي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="hasAttachments"
              name="hasAttachments"
              checked={criteria.hasAttachments || false}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, hasAttachments: checked === true }))
              }
            />
            <Label htmlFor="hasAttachments">تحتوي على مرفقات</Label>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="is_confidential"
              name="is_confidential"
              checked={criteria.is_confidential || false}
              onCheckedChange={(checked) =>
                setCriteria(prev => ({ ...prev, is_confidential: checked === true }))
              }
            />
            <Label htmlFor="is_confidential">المعاملات السرية فقط</Label>
          </div>

          {/* إضافة خيارات بحث إضافية في مكون البحث المتقدم */}
          <div>
            <Label htmlFor="tags">بحث في الوسوم</Label>
            <Select
              name="tags"
              value={criteria.tags}
              onValueChange={(value) => handleSelectChange('tags', value)}
            >
              <SelectTrigger id="tags">
                <SelectValue placeholder="اختر وسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">كل الوسوم</SelectItem>
                <SelectItem value="إداري">إداري</SelectItem>
                <SelectItem value="مالي">مالي</SelectItem>
                <SelectItem value="مهم">مهم</SelectItem>
                <SelectItem value="مستعجل">مستعجل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="archive_number">رقم الأرشفة</Label>
            <Input
              id="archive_number"
              name="archive_number"
              placeholder="أدخل رقم الأرشفة"
              value={criteria.archive_number || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse mt-4">
          <Checkbox
            id="save_search"
            name="save_search"
            checked={criteria.save_search || false}
            onChange={handleInputChange}
          />
          <Label htmlFor="save_search">حفظ معايير البحث للاستخدام لاحقاً</Label>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="searchName">حفظ عملية البحث</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
            >
              {showSavedSearches ? 'إخفاء' : 'عرض'} البحث المحفوظ
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              id="searchName"
              placeholder="أدخل اسم لحفظ عملية البحث"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
            <Button
              type="button"
              onClick={handleSaveSearch}
              disabled={!searchName}
            >
              <Save className="h-4 w-4 ml-1" />
              حفظ
            </Button>
          </div>

          {showSavedSearches && (
            <div className="mt-2 p-2 border rounded-md max-h-40 overflow-y-auto">
              {Object.keys(JSON.parse(localStorage.getItem('savedSearches') || '{}')).length > 0 ? (
                Object.keys(JSON.parse(localStorage.getItem('savedSearches') || '{}')).map(name => (
                  <Button
                    key={name}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-right"
                    onClick={() => loadSavedSearch(name)}
                  >
                    {name}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  لا توجد عمليات بحث محفوظة
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 gap-2">
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 ml-1" />
            بحث
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
