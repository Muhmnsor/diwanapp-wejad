
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BudgetItem, ResourceObligation } from "../types";

export const useEditResourceData = (resourceId: string) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [obligations, setObligations] = useState<ResourceObligation[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [useDefaultPercentages, setUseDefaultPercentages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch budget items and distributions
  useEffect(() => {
    const fetchResourceData = async () => {
      try {
        // Fetch budget items
        const { data: itemsData, error: itemsError } = await supabase
          .from('budget_items')
          .select('id, name, default_percentage');

        if (itemsError) throw itemsError;
        
        // Fetch resource distributions
        const { data: distributionsData, error: distributionsError } = await supabase
          .from('resource_distributions')
          .select('*')
          .eq('resource_id', resourceId);

        if (distributionsError) throw distributionsError;
        
        // Fetch resource obligations
        const { data: obligationsData, error: obligationsError } = await supabase
          .from('resource_obligations')
          .select('*')
          .eq('resource_id', resourceId);

        if (obligationsError) throw obligationsError;
        
        setDistributions(distributionsData || []);
        setObligations(obligationsData || []);

        // Prepare budget items with current values
        if (itemsData) {
          const items = itemsData.map(item => {
            const distribution = distributionsData?.find(d => d.budget_item_id === item.id);
            return {
              id: item.id,
              name: item.name,
              percentage: distribution ? distribution.percentage : item.default_percentage,
              value: distribution ? distribution.amount : 0
            };
          });
          
          setBudgetItems(items);
          
          // Determine percentage type (default or custom)
          if (distributionsData && distributionsData.length > 0) {
            // Check if percentages match default percentages
            const isDefault = distributionsData.every(dist => {
              const item = itemsData.find(i => i.id === dist.budget_item_id);
              return item && Math.abs(item.default_percentage - dist.percentage) < 0.1; // Approximate for decimal precision
            });
            
            setUseDefaultPercentages(isDefault);
          }
        }
      } catch (error) {
        console.error('Error fetching resource data:', error);
        toast.error('حدث خطأ أثناء جلب بيانات المورد');
      }
    };

    fetchResourceData();
  }, [resourceId]);

  return {
    budgetItems,
    setBudgetItems,
    obligations,
    setObligations,
    distributions,
    useDefaultPercentages,
    setUseDefaultPercentages,
    isLoading,
    setIsLoading
  };
};
