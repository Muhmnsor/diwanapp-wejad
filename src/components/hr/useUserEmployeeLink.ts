
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUserEmployeeLink() {
  const [isLoading, setIsLoading] = useState(false);
  
  const linkUserToEmployee = async (employeeId: string, userId: string) => {
    setIsLoading(true);
    
    try {
      // First check if this user is already linked to another employee
      const { data: existingEmployee, error: checkError } = await supabase
        .from('employees')
        .select('id, full_name')
        .eq('user_id', userId)
        .neq('id', employeeId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      // If user is already linked to another employee
      if (existingEmployee) {
        return {
          success: false,
          alreadyLinked: true,
          existingEmployee,
          error: new Error(`هذا المستخدم مرتبط بالفعل بموظف آخر: ${existingEmployee.full_name}`)
        };
      }
      
      // Update employee with the user_id
      const { error } = await supabase
        .from('employees')
        .update({ 
          user_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);
        
      if (error) throw error;
      
      return {
        success: true
      };
      
    } catch (error: any) {
      console.error('Error linking user to employee:', error);
      return {
        success: false,
        error
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const unlinkUserFromEmployee = async (employeeId: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          user_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);
        
      if (error) throw error;
      
      return {
        success: true
      };
      
    } catch (error: any) {
      console.error('Error unlinking user from employee:', error);
      return {
        success: false,
        error
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    linkUserToEmployee,
    unlinkUserFromEmployee,
    isLoading
  };
}
