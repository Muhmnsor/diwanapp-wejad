import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ProjectTypeFields } from "@/components/projects/form/fields/ProjectTypeFields";
import { ProjectPathFields } from "@/components/projects/form/fields/ProjectPathFields";
import { ProjectCertificateFields } from "@/components/projects/form/fields/ProjectCertificateFields";
import { ProjectRegistrationFields } from "@/components/projects/form/fields/ProjectRegistrationFields";

const CreateProject = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    max_attendees: 0,
    image_url: "",
    beneficiary_type: "both",
    price: null,
    registration_start_date: "",
    registration_end_date: "",
    certificate_type: "none",
    event_path: "environment",
    event_category: "social",
    event_type: "in-person"
  });

  const handleImageChange = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `project-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert([formData]);

      if (error) throw error;

      toast.success("تم إنشاء المشروع بنجاح");
      navigate("/");
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">إنشاء مشروع جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          <div className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-medium mb-1.5">عنوان المشروع</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">وصف المشروع</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">تاريخ البداية</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">تاريخ النهاية</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <ProjectTypeFields formData={formData} setFormData={setFormData} />
            <ProjectPathFields formData={formData} setFormData={setFormData} />
            <ProjectCertificateFields formData={formData} setFormData={setFormData} />
            <ProjectRegistrationFields formData={formData} setFormData={setFormData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">تاريخ بدء التسجيل</label>
                <Input
                  type="date"
                  value={formData.registration_start_date}
                  onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">تاريخ نهاية التسجيل</label>
                <Input
                  type="date"
                  value={formData.registration_end_date}
                  onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">صورة المشروع</label>
              <ImageUpload
                onChange={handleImageChange}
                value={formData.image_url}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;