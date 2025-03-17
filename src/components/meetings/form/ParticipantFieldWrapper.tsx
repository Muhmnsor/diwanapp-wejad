
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MeetingParticipant } from "@/components/meetings/types";
import { UseFormReturn } from "react-hook-form";
import { formatFormError } from "../types/meetingTypes";

interface ParticipantFieldWrapperProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  children: React.ReactNode;
}

export const ParticipantFieldWrapper: React.FC<ParticipantFieldWrapperProps> = ({
  form,
  name,
  label,
  children
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {children}
          </FormControl>
          {fieldState.error && (
            <FormMessage>
              {formatFormError(fieldState.error)}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
};
