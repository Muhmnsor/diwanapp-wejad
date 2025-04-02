
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmployeeContract {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string | null;
  probation_end_date: string | null;
  salary: number;
  contract_type: 'permanent' | 'temporary' | 'contract';
  document_url: string | null;
  status: 'active' | 'expired' | 'terminated';
  renewal_reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmployeeContracts(employeeId?: string) {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Get employee contracts
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['employee-contracts', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('hr_employee_contracts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId
  });

  // Get all contracts with near expiry
  const { data: expiringContracts } = useQuery({
    queryKey: ['expiring-contracts'],
    queryFn: async () => {
      // Get contracts expiring in the next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data, error } = await supabase
        .from('hr_employee_contracts')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            position,
            department
          )
        `)
        .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gt('end_date', new Date().toISOString().split('T')[0])
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    }
  });

  // Get employees with probation ending soon
  const { data: endingProbations } = useQuery({
    queryKey: ['ending-probations'],
    queryFn: async () => {
      // Get probations ending in the next 14 days
      const fourteenDaysFromNow = new Date();
      fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
      
      const { data, error } = await supabase
        .from('hr_employee_contracts')
        .select(`
          *,
          employees:employee_id (
            id,
            full_name,
            position,
            department
          )
        `)
        .lte('probation_end_date', fourteenDaysFromNow.toISOString().split('T')[0])
        .gt('probation_end_date', new Date().toISOString().split('T')[0])
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    }
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (contract: Omit<EmployeeContract, 'id' | 'created_at' | 'updated_at' | 'renewal_reminder_sent'>) => {
      const { data, error } = await supabase
        .from('hr_employee_contracts')
        .insert(contract)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts', employeeId] });
      toast.success("تم إنشاء العقد بنجاح");
    },
    onError: (error) => {
      toast.error(`حدث خطأ: ${error.message}`);
    }
  });

  // Update contract mutation
  const updateContractMutation = useMutation({
    mutationFn: async ({ id, ...contract }: Partial<EmployeeContract> & { id: string }) => {
      const { data, error } = await supabase
        .from('hr_employee_contracts')
        .update(contract)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['expiring-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['ending-probations'] });
      toast.success("تم تحديث العقد بنجاح");
    },
    onError: (error) => {
      toast.error(`حدث خطأ: ${error.message}`);
    }
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hr_employee_contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-contracts', employeeId] });
      toast.success("تم حذف العقد بنجاح");
    },
    onError: (error) => {
      toast.error(`حدث خطأ: ${error.message}`);
    }
  });

  // Upload contract document
  const uploadContractDocument = async (file: File, contractId: string): Promise<string | null> => {
    if (!file || !contractId) return null;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${contractId}-${Date.now()}.${fileExt}`;
      const filePath = `contract-documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('hr-documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from('hr-documents')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading contract document:', error);
      toast.error(`حدث خطأ أثناء رفع الملف: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    contracts,
    expiringContracts,
    endingProbations,
    isLoading,
    isUploading,
    error,
    createContract: createContractMutation.mutateAsync,
    updateContract: updateContractMutation.mutateAsync,
    deleteContract: deleteContractMutation.mutateAsync,
    uploadContractDocument
  };
}
