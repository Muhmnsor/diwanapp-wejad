
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearNavigationProps {
  year: number;
  onYearChange: (yearDelta: number) => void;
}

export const YearNavigation = ({ year, onYearChange }: YearNavigationProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">الخطة السنوية للمشاريع والمهام {year}</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onYearChange(-1)}
          className="flex items-center gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          السنة السابقة
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => onYearChange(1)}
          className="flex items-center gap-1"
        >
          السنة التالية
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
