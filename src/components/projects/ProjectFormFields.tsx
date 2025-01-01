import { Project } from "@/types/project";
import { Card } from "@/components/ui/card";
import { ProjectBasicFields } from "./form/fields/ProjectBasicFields";
import { ProjectCertificateFields } from "./form/fields/ProjectCertificateFields";
import { ProjectPathFields } from "./form/fields/ProjectPathFields";
import { ProjectRegistrationFieldsConfig } from "./form/fields/ProjectRegistrationFieldsConfig";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BeneficiaryType } from "@/types/event";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectFormFieldsProps {
  formData: Project;
  setFormData: (data: Project) => void;
  onImageChange?: (file: File | null) => void;
}

export const ProjectFormFields = ({ formData, setFormData, onImageChange }: ProjectFormFieldsProps) => {
  // Fetch existing registration fields when component mounts
  useEffect(() => {
    const fetchRegistrationFields = async () => {
      if (!formData.id) return;

      const { data, error } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', formData.id)
        .single();

      if (error) {
        console.error('Error fetching registration fields:', error);
        return;
      }

      if (data) {
        setFormData({
          ...formData,
          registration_fields: {
            arabic_name: data.arabic_name || true,
            email: data.email || true,
            phone: data.phone || true,
            english_name: data.english_name || false,
            education_level: data.education_level || false,
            birth_date: data.birth_date || false,
            national_id: data.national_id || false,
            gender: data.gender || false,
            work_status: data.work_status || false,
          }
        });
      }
    };

    fetchRegistrationFields();
  }, [formData.id]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Basic Project Information */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">معلومات المشروع الأساسية</h2>
        <ProjectBasicFields
          formData={formData}
          setFormData={setFormData}
          onImageChange={onImageChange}
        />
      </Card>

      {/* Dates and Registration */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">التواريخ والتسجيل</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">تاريخ البداية</label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="text-right"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">تاريخ النهاية</label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="text-right"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">تاريخ بداية التسجيل</label>
            <Input
              type="date"
              value={formData.registration_start_date || ''}
              onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
              className="text-right"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">تاريخ نهاية التسجيل</label>
            <Input
              type="date"
              value={formData.registration_end_date || ''}
              onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
              className="text-right"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">عدد المقاعد</label>
            <Input
              type="number"
              value={formData.max_attendees}
              onChange={(e) => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
              className="text-right"
            />
          </div>
        </div>
      </Card>

      {/* Registration Fields Configuration */}
      <ProjectRegistrationFieldsConfig
        formData={formData}
        setFormData={setFormData}
      />

      {/* Beneficiaries and Classification */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">المستفيدين والتصنيف</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">نوع المشروع</label>
            <Select
              value={formData.event_type}
              onValueChange={(value: "online" | "in-person") => 
                setFormData({ ...formData, event_type: value })
              }
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر نوع المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">حضوري</SelectItem>
                <SelectItem value="online">عن بعد</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">نوع المستفيدين</label>
            <Select
              value={formData.beneficiary_type}
              onValueChange={(value: BeneficiaryType) => 
                setFormData({ ...formData, beneficiary_type: value })
              }
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر نوع المستفيدين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">رجال</SelectItem>
                <SelectItem value="women">نساء</SelectItem>
                <SelectItem value="both">رجال ونساء</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ProjectCertificateFields
            formData={formData}
            setFormData={setFormData}
          />

          <div>
            <label className="text-sm font-medium block mb-1.5">السعر (اتركه فارغاً للمشاريع المجانية)</label>
            <Input
              type="number"
              value={formData.price || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
              className="text-right"
            />
          </div>

          <ProjectPathFields
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </Card>
    </div>
  );
};