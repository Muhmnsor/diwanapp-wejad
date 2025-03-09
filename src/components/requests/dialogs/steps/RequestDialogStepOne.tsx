
import { RequestBasicInfoForm, RequestBasicInfo } from "../RequestBasicInfoForm";

interface RequestDialogStepOneProps {
  onSubmit: (data: RequestBasicInfo) => void;
  initialValues: {
    title: string;
    priority: string;
  };
}

export const RequestDialogStepOne = ({ 
  onSubmit, 
  initialValues 
}: RequestDialogStepOneProps) => {
  return (
    <RequestBasicInfoForm 
      onSubmit={onSubmit} 
      initialValues={initialValues}
    />
  );
};
