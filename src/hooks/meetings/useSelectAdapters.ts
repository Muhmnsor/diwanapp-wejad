
import { useState } from 'react';

/**
 * A hook that provides type-safe adapters for Select components
 * to resolve type compatibility issues with specific string literal types
 */
export const useSelectAdapters = () => {
  /**
   * Creates an adapter for meeting type select
   */
  const createMeetingTypeAdapter = (initialValue: "board" | "department" | "team" | "committee" | "other") => {
    const [value, setValue] = useState<"board" | "department" | "team" | "committee" | "other">(initialValue);
    
    // Adapter function that handles the conversion safely
    const onValueChange = (newValue: string) => {
      if (newValue === "board" || 
          newValue === "department" || 
          newValue === "team" || 
          newValue === "committee" || 
          newValue === "other") {
        setValue(newValue);
      } else {
        console.error(`Invalid meeting type value: ${newValue}`);
        setValue("other");
      }
    };
    
    return { value, onValueChange };
  };
  
  /**
   * Creates an adapter for meeting status select
   */
  const createMeetingStatusAdapter = (initialValue: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    const [value, setValue] = useState<"scheduled" | "in_progress" | "completed" | "cancelled">(initialValue);
    
    // Adapter function that handles the conversion safely
    const onValueChange = (newValue: string) => {
      if (newValue === "scheduled" || 
          newValue === "in_progress" || 
          newValue === "completed" || 
          newValue === "cancelled") {
        setValue(newValue);
      } else {
        console.error(`Invalid meeting status value: ${newValue}`);
        setValue("scheduled");
      }
    };
    
    return { value, onValueChange };
  };
  
  /**
   * Creates an adapter for attendance type select
   */
  const createAttendanceTypeAdapter = (initialValue: "in_person" | "virtual" | "hybrid") => {
    const [value, setValue] = useState<"in_person" | "virtual" | "hybrid">(initialValue);
    
    // Adapter function that handles the conversion safely
    const onValueChange = (newValue: string) => {
      if (newValue === "in_person" || 
          newValue === "virtual" || 
          newValue === "hybrid") {
        setValue(newValue);
      } else {
        console.error(`Invalid attendance type value: ${newValue}`);
        setValue("in_person");
      }
    };
    
    return { value, onValueChange };
  };
  
  return {
    createMeetingTypeAdapter,
    createMeetingStatusAdapter,
    createAttendanceTypeAdapter
  };
};
