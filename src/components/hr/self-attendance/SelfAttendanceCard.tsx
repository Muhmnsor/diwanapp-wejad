
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/refactored-auth";
import { supabase } from "@/integrations/supabase/client";
import { useUserEmployeeLink } from "@/hooks/hr/useUserEmployeeLink";
import { SelfAttendanceToolbar } from "./SelfAttendanceToolbar";
import { format } from "date-fns";

export function SelfAttendanceCard() {
  const { user } = useAuthStore();
  const { checkUserEmployeeLink, isLoading } = useUserEmployeeLink();
  const { toast } = useToast();
  const [isLinked, setIsLinked] = useState(false);
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    const checkLink = async () => {
      if (!user?.id) return;
      
      try {
        const result = await checkUserEmployeeLink(user.id);
        
        if (result.success) {
          setIsLinked(result.isLinked);
          if (result.isLinked && result.employee) {
            setEmployee(result.employee);
            console.log("Employee data loaded:", result.employee);
          }
        } else {
          console.error("Error checking employee link:", result.error);
        }
      } catch (error) {
        console.error("Failed to check employee link:", error);
      }
    };

    checkLink();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLinked) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              لم يتم ربط حسابك بسجل موظف، يرجى التواصل مع إدارة الموارد البشرية
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold">
              مرحباً {employee?.full_name}
            </h3>
            <p className="text-muted-foreground">
              {format(new Date(), "yyyy/MM/dd")}
            </p>
          </div>

          <SelfAttendanceToolbar employee={employee} />
        </div>
      </CardContent>
    </Card>
  );
}
