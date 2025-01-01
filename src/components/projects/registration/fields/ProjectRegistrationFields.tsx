import { PersonalInfoFields } from "../../../events/registration/fields/PersonalInfoFields";
import { PaymentFields } from "../../../events/registration/fields/PaymentFields";

interface ProjectRegistrationFieldsProps {
  registrationFields: {
    arabic_name: boolean;
    email: boolean;
    phone: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
  projectPrice: number | "free" | null;
  showPaymentFields: boolean;
}

export const ProjectRegistrationFields = ({
  registrationFields,
  projectPrice,
  showPaymentFields
}: ProjectRegistrationFieldsProps) => {
  console.log('Project registration fields:', registrationFields);

  return (
    <div className="space-y-4">
      <PersonalInfoFields
        registrationFields={registrationFields}
      />
      {showPaymentFields && (
        <PaymentFields
          price={projectPrice}
        />
      )}
    </div>
  );
};