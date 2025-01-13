import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PortfolioProjectFormData } from "../types/portfolio";

export const usePortfolioProjectSubmit = (
  portfolioId: string,
  onSuccess?: () => void,
  onOpenChange?: (open: boolean) => void,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: PortfolioProjectFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Creating portfolio project with data:', formData);
      console.log('Portfolio ID:', portfolioId);

      // First verify that the portfolio exists
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id, asana_gid')
        .eq('id', portfolioId)
        .maybeSingle();

      if (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError);
        throw new Error('خطأ في جلب بيانات المحفظة');
      }

      if (!portfolioData) {
        console.error('Portfolio not found for ID:', portfolioId);
        throw new Error('لم يتم العثور على المحفظة');
      }

      console.log('Found portfolio:', portfolioData);
      let asanaGid = null;

      // If portfolio has Asana GID, try to create Asana project
      if (portfolioData.asana_gid) {
        console.log('Found portfolio Asana GID:', portfolioData.asana_gid);
        try {
          const { data: asanaData, error: asanaError } = await supabase.functions.invoke('create-asana-project', {
            body: {
              portfolioGid: portfolioData.asana_gid,
              name: formData.name,
              description: formData.description,
              startDate: formData.startDate || null,
              dueDate: formData.dueDate || null,
              status: formData.status,
              public: formData.privacy === 'public'
            }
          });

          if (asanaError) {
            console.error('Error creating Asana project:', asanaError);
            // Don't throw here, just log the error and continue without Asana integration
          } else {
            console.log('Successfully created Asana project:', asanaData);
            asanaGid = asanaData.gid;
          }
        } catch (asanaError) {
          console.error('Error in Asana project creation:', asanaError);
          // Don't throw here, just log the error and continue without Asana integration
        }
      } else {
        console.log('No Asana GID found for portfolio, skipping Asana integration');
      }

      // Create the portfolio project in database
      const { data: projectData, error: projectError } = await supabase
        .from('portfolio_only_projects')
        .insert([{
          name: formData.name,
          description: formData.description,
          start_date: formData.startDate || null,
          due_date: formData.dueDate || null,
          status: formData.status,
          privacy: formData.privacy,
          portfolio_id: portfolioId,
          asana_gid: asanaGid
        }])
        .select()
        .single();

      if (projectError) {
        console.error('Error creating portfolio project:', projectError);
        throw projectError;
      }

      console.log('Successfully created portfolio project:', projectData);

      toast.success("تم إنشاء المشروع بنجاح");
      onSuccess?.();
      onOpenChange?.(false);
    } catch (error) {
      console.error('Error in project creation:', error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};