
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLeaveTypes } from "@/hooks/hr/useLeaveTypes";

interface LeaveTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  gender?: string;
  label?: string;
  required?: boolean;
}

export function LeaveTypeField({ 
  value, 
  onChange, 
  gender,
  label = "نوع الإجازة",
  required = false 
}: LeaveTypeFieldProps) {
  const { data: leaveTypes, isLoading } = useLeaveTypes(gender);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="leave_type">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="leave_type">
          <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر نوع الإجازة"} />
        </SelectTrigger>
        <SelectContent>
          {leaveTypes?.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name} {type.is_paid === false && "(غير مدفوعة)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
