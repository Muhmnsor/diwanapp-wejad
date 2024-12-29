import { Event } from "@/store/eventStore";
import { ImageUpload } from "@/components/ui/image-upload";
import { BasicEventFields } from "./form/fields/BasicEventFields";
import { EventTypeFields } from "./form/fields/EventTypeFields";
import { CertificateFields } from "./form/fields/CertificateFields";
import { RegistrationFields } from "./form/fields/RegistrationFields";
import { EventPathFields } from "./form/fields/EventPathFields";

interface EventFormFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
  onImageChange?: (file: File | null) => void;
  isProjectEvent?: boolean;
}

export const EventFormFields = ({ 
  formData, 
  setFormData, 
  onImageChange,
  isProjectEvent = false
}: EventFormFieldsProps) => {
  console.log('Form data in EventFormFields:', formData);
  console.log('Is project event:', isProjectEvent);
  
  return (
    <div className="space-y-4 text-right" dir="rtl">
      <BasicEventFields formData={formData} setFormData={setFormData} />
      {!isProjectEvent && (
        <>
          <EventTypeFields formData={formData} setFormData={setFormData} />
          <EventPathFields formData={formData} setFormData={setFormData} />
          <CertificateFields formData={formData} setFormData={setFormData} />
          <RegistrationFields formData={formData} setFormData={setFormData} />
        </>
      )}
      
      {onImageChange && (
        <div>
          <label className="text-sm font-medium block mb-1.5">صورة الفعالية</label>
          <ImageUpload
            onChange={onImageChange}
            value={formData.imageUrl || formData.image_url}
          />
        </div>
      )}
    </div>
  );
};