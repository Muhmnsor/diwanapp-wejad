import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserCog, CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface User {
  id: string;
  display_name: string;
  email?: string;
}

interface AssignCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId: string;
  correspondenceNumber: string;
}

export const AssignCorrespondenceDialog: React.FC<AssignCorrespondenceDialogProps> = ({
  isOpen,
  onClose,
  correspondenceId,
  correspondenceNumber,
}) => {
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  
  const { toast } = useToast();
  const { assignCorrespondence, fetchUsers } = useCorrespondence();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setFetchingUsers(true);
    try {
      const result = await fetchUsers();
      if (result.success) {
        setUsers(result.users);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ في تحميل المستخدمين",
          description: "تعذر تحميل قائمة المستخدمين، يرجى المحاولة مرة أخرى"
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!assigneeId) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار الشخص المسؤول"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await assignCorrespondence(correspondenceId, {
        assigneeId,
        instructions,
        deadline: deadline ? format(deadline, 'yyyy-MM-dd') : undefined
      });
      
      if (!result.success) {
        throw new Error(result.error || "فشل في تعيين المعاملة");
      }
      
      toast({
        title: "تم تعيين المعاملة بنجاح",
        description: `تم تعيين المعاملة رقم ${correspondenceNumber} بنجاح`
      });
      
      onClose();
    } catch (error) {
      console.error("Error assigning correspondence:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تعيين المعاملة",
        description: String(error) || "حدث خطأ أثناء تعيين المعاملة، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAssigneeId("");
    setInstructions("");
    setDeadline(undefined);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) resetForm();
        onClose();
      }}
    >
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            تعيين المعاملة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="correspondence-number">رقم المعاملة</Label>
            <Input 
              id="correspondence-number" 
              value={correspondenceNumber} 
              disabled 
            />
          </div>
          
          <div>
            <Label htmlFor="assignee" className="required">تعيين إلى</Label>
            <Select
              value={assigneeId}
              onValueChange={setAssigneeId}
              required
            >
              <SelectTrigger id="assignee" className="w-full">
                <SelectValue placeholder="اختر الشخص المسؤول" />
              </SelectTrigger>
              <SelectContent>
                {fetchingUsers ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التحميل...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    لا يوجد مستخدمين
                  </div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.display_name} {user.email ? `(${user.email})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="instructions">تعليمات</Label>
            <Textarea 
              id="instructions" 
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="أدخل تعليمات للشخص المسؤول"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="deadline">الموعد النهائي</Label>
            <Popover open={deadlineOpen} onOpenChange={setDeadlineOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="deadline"
                  className="w-full justify-start text-right"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? (
                    format(deadline, 'PPP', { locale: ar })
                  ) : (
                    <span>اختر تاريخ...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => {
                    setDeadline(date);
                    setDeadlineOpen(false);
                  }}
                  initialFocus
                  locale={ar}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button 
              type="submit" 
              disabled={loading || !assigneeId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التعيين...
                </>
              ) : (
                'تعيين المعاملة'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
