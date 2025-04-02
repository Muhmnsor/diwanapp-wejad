
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log("useEmployees - Fetching employees with schedule information");
      const { data, error } = await supabase
        .from('employees')
        .select('*, schedule_id')
        .order('full_name');
        
      if (error) {
        console.error("useEmployees - Error fetching employees:", error);
        throw error;
      }
      
      console.log(`useEmployees - Retrieved ${data?.length || 0} employees`);
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  
  const addEmployee = async (employeeData: any) => {
    console.log("useAddEmployee - Adding new employee:", employeeData);
    
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();
      
    if (error) {
      console.error("useAddEmployee - Error adding employee:", error);
      throw error;
    }
    
    console.log("useAddEmployee - Successfully added employee:", data);
    return data;
  };
  
  return {
    addEmployee: async (employeeData: any) => {
      const result = await addEmployee(employeeData);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      return result;
    }
  };
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  const updateEmployee = async (id: string, employeeData: any) => {
    console.log(`useUpdateEmployee - Updating employee ${id}:`, employeeData);
    
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("useUpdateEmployee - Error updating employee:", error);
      throw error;
    }
    
    console.log("useUpdateEmployee - Successfully updated employee:", data);
    return data;
  };
  
  return {
    updateEmployee: async (id: string, employeeData: any) => {
      const result = await updateEmployee(id, employeeData);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      return result;
    }
  };
}
