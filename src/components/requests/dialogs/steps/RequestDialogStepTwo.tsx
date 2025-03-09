
import { DynamicForm } from "../../DynamicForm";
import { FormSchema } from "../../types";

interface RequestDialogStepTwoProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, any>) => void;
  onBack: () => void;
  isSubmitting: boolean;
  showSuccess: boolean;
}

export const RequestDialogStepTwo = ({ 
  schema, 
  onSubmit, 
  onBack, 
  isSubmitting, 
  showSuccess 
}: RequestDialogStepTwoProps) => {
  return (
    <DynamicForm
      schema={schema}
      onSubmit={onSubmit}
      onBack={onBack}
      isSubmitting={isSubmitting}
      showSuccess={showSuccess}
    />
  );
};
