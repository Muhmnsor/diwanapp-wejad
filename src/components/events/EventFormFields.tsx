import { Event } from "@/store/eventStore";
import { ImageUpload } from "@/components/ui/image-upload";
import { BasicEventFields } from "./form/fields/BasicEventFields";
import { EventTypeFields } from "./form/fields/EventTypeFields";
import { CertificateFields } from "./form/fields/CertificateFields";
import { RegistrationFields } from "./form/fields/RegistrationFields";
import { EventPathFields } from "./form/fields/EventPathFields";
import { Card } from "@/components/ui/card";

interface EventFormFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
  onImageChange?: (file: File | null) => void;
}

export const EventFormFields = ({ formData, setFormData, onImageChange }: EventFormFieldsProps) => {
  console.log('Form data in EventFormFields:', formData);
  
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Basic Event Information */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">معلومات الفعالية الأساسية</h2>
        <div className="space-y-4">
          <BasicEventFields formData={formData} setFormData={setFormData} />
          
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
      </Card>

      {/* Event Type and Beneficiaries */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">نوع الفعالية والمستفيدين</h2>
        <div className="space-y-4">
          <EventTypeFields formData={formData} setFormData={setFormData} />
          <EventPathFields formData={formData} setFormData={setFormData} />
        </div>
      </Card>

      {/* Certificate and Registration */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">الشهادة والتسجيل</h2>
        <div className="space-y-4">
          <CertificateFields formData={formData} setFormData={setFormData} />
          <RegistrationFields formData={formData} setFormData={setFormData} />
        </div>
      </Card>
    </div>
  );
};