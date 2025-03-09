
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { AddSubscriptionDialog } from "./AddSubscriptionDialog";

interface SubscriptionControlsProps {
  onSearch: (query: string) => void;
  onFilterCategory: (category: string) => void;
  onFilterStatus: (status: string) => void;
  onRefresh: () => void;
}

export const SubscriptionControls = ({
  onSearch,
  onFilterCategory,
  onFilterStatus,
  onRefresh,
}: SubscriptionControlsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Input
          placeholder="بحث..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          onClick={handleSearch}
        />
      </div>

      <div className="w-full sm:w-auto flex flex-wrap gap-2">
        <Select onValueChange={onFilterCategory} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="تقنية">تقنية</SelectItem>
            <SelectItem value="برمجيات">برمجيات</SelectItem>
            <SelectItem value="استضافة">استضافة</SelectItem>
            <SelectItem value="دومين">دومين</SelectItem>
            <SelectItem value="خدمات سحابية">خدمات سحابية</SelectItem>
            <SelectItem value="عضوية">عضوية</SelectItem>
            <SelectItem value="أخرى">أخرى</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={onFilterStatus} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="expired">منتهي</SelectItem>
            <SelectItem value="soon">ينتهي قريباً</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          إضافة اشتراك
        </Button>
      </div>

      <AddSubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onRefresh}
      />
    </div>
  );
};
