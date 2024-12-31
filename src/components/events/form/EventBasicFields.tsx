import { Event } from "@/store/eventStore";
import { EventTitleDescriptionFields } from "./fields/EventTitleDescriptionFields";
import { EventDateTimeFields } from "./fields/EventDateTimeFields";
import { EventLocationFields } from "./fields/EventLocationFields";
import { EventTypeAndBeneficiaryFields } from "./fields/EventTypeAndBeneficiaryFields";
import { EventPriceAndSeatsFields } from "./fields/EventPriceAndSeatsFields";
import { EventRegistrationDatesFields } from "./fields/EventRegistrationDatesFields";

interface EventBasicFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventBasicFields = ({ formData, setFormData }: EventBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <EventTitleDescriptionFields formData={formData} setFormData={setFormData} />
      <EventDateTimeFields formData={formData} setFormData={setFormData} />
      <EventLocationFields formData={formData} setFormData={setFormData} />
      <EventTypeAndBeneficiaryFields formData={formData} setFormData={setFormData} />
      <EventPriceAndSeatsFields formData={formData} setFormData={setFormData} />
      <EventRegistrationDatesFields formData={formData} setFormData={setFormData} />
    </div>
  );
};