
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FetchedIdeaData, TimeCalculationResult } from "./types";
import { calculateTimeUtils } from "./timeCalculationUtils";

export const useFetchIdeaData = (
  isOpen: boolean,
  ideaId: string,
  setDays: (value: number) => void,
  setHours: (value: number) => void
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [ideaData, setIdeaData] = useState<FetchedIdeaData | null>(null);
  const [timeState, setTimeState] = useState<TimeCalculationResult>({
    remainingDays: 0,
    remainingHours: 0,
    totalCurrentHours: 0
  });

  // Fetch idea details when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchIdeaDetails();
    }
  }, [isOpen, ideaId]);

  const fetchIdeaDetails = async () => {
    setIsLoading(true);
    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from("ideas")
        .select("discussion_period, created_at")
        .eq("id", ideaId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log("Idea data fetched:", fetchedData);
      setIdeaData(fetchedData);

      if (fetchedData) {
        processFetchedIdeaData(fetchedData);
      }
    } catch (error) {
      console.error("Error fetching idea details:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الفكرة");
    } finally {
      setIsLoading(false);
    }
  };

  const processFetchedIdeaData = (fetchedData: FetchedIdeaData) => {
    const { discussion_period, created_at } = fetchedData;
    
    if (discussion_period && created_at) {
      console.log("Discussion period from DB:", discussion_period);
      console.log("Created at from DB:", created_at);
      
      // Calculate time values using the utility functions
      const { totalHours, remainingTimeData, initialInputValues } = calculateTimeUtils(
        discussion_period,
        created_at
      );
      
      // Set the time state
      setTimeState({
        totalCurrentHours: totalHours,
        remainingDays: remainingTimeData.days,
        remainingHours: remainingTimeData.hours
      });
      
      // Set initial input values
      setDays(initialInputValues.days);
      setHours(initialInputValues.hours);
    }
  };

  return {
    isLoading,
    ideaData,
    ...timeState
  };
};
