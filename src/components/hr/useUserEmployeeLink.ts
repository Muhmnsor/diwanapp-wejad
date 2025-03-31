
// src/hooks/hr/useUserEmployeeLink.ts
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/refactored-auth";

export function useUserEmployeeLink() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { user } = useAuthStore();
  
  // Function to get the current user's linked employee
const getCurrentUserEmployee = async () => {
  if (!user?.id) {
    console.log("User not authenticated in getCurrentUserEmployee");
    return { success: false, error: "User not authenticated", isLinked: false };
  }
  
  setIsFetching(true);
  try {
    console.log("Fetching employee data for user:", user.id);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) throw error;
    
    const isLinked = !!data;
    console.log("Employee link check result:", { isLinked, data: data || null });
    
    return { 
      success: true, 
      data: data || null,
      isLinked
    };
  } catch (error: any) {
    console.error('Error getting current user employee:', error);
    return { 
      success: false, 
      error: error.message || "حدث خطأ أثناء جلب بيانات الموظف",
      isLinked: false
    };
  } finally {
    setIsFetching(false);
  }
};

  
  // Function to link a user to an employee
  const linkUserToEmployee = async (employeeId: string, userId: string) => {
    if (!employeeId || !userId) {
      toast({
        title: "خطأ",
        description: "يجب تحديد كل من الموظف والمستخدم",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      // Check if user is already linked to another employee
      const { data: existingLink, error: checkError } = await supabase
        .from('employees')
        .select('id, full_name')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingLink && existingLink.id !== employeeId) {
        toast({
          title: "تنبيه",
          description: `هذا المستخدم مرتبط بالفعل بموظف آخر: ${existingLink.full_name}`,
          variant: "destructive",
        });
        return { success: false, alreadyLinked: true, employeeId: existingLink.id };
      }
      
      // Update employee with user ID
      const { error } = await supabase
        .from('employees')
        .update({ user_id: userId })
        .eq('id', employeeId);
      
      if (error) throw error;
      
      toast({
        title: "تم بنجاح",
        description: "تم ربط الموظف بحساب المستخدم",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error linking user to employee:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء ربط المستخدم بالموظف",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to unlink a user from an employee
  const unlinkUserFromEmployee = async (employeeId: string) => {
    if (!employeeId) {
      toast({
        title: "خطأ",
        description: "يجب تحديد الموظف",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      // Update employee to remove user ID
      const { error } = await supabase
        .from('employees')
        .update({ user_id: null })
        .eq('id', employeeId);
      
      if (error) throw error;
      
      toast({
        title: "تم بنجاح",
        description: "تم إلغاء ربط الموظف بحساب المستخدم",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error unlinking user from employee:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إلغاء ربط المستخدم بالموظف",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to get employees linked to users
  const getLinkedEmployees = async () => {
    setIsLoading(true);
    try {
      // First get employees with user_id
      const { data: employeesData, error: empError } = await supabase
        .from('employees')
        .select('id, full_name, employee_number, user_id')
        .not('user_id', 'is', null);
      
      if (empError) throw empError;
      
      // Then get user data separately
      const { data: userData, error: userError } = await supabase
        .rpc('get_app_users');
      
      if (userError) throw userError;
      
      // Combine the data
      const combinedData = employeesData.map(emp => {
        const user = userData.find(u => u.id === emp.user_id);
        return {
          ...emp,
          auth_users_view: user ? { email: user.email } : null
        };
      });
      
      return { success: true, data: combinedData };
    } catch (error: any) {
      console.error('Error getting linked employees:', error);
      return { 
        success: false, 
        error: error.message || "حدث خطأ أثناء جلب الموظفين المرتبطين" 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    linkUserToEmployee,
    unlinkUserFromEmployee,
    getLinkedEmployees,
    getCurrentUserEmployee,
    isLoading,
    isFetching
  };
}

