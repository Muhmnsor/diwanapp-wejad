import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // التأكد من استخدام sonner كما هو مستورد
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { useAuthStore } from "@/store/authStore";
import { ProjectDeleteDialog } from "@/components/projects/details/ProjectDeleteDialog";
import { deleteProject } from "@/components/projects/details/deletion/deleteProject";

const ProjectDetails = () => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // إضافة حالة لإظهار مربع حوار الحذف
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          setError("معرف المشروع غير موجود");
          return;
        }

        console.log("Fetching project with ID:", id);
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching project:", fetchError);
          setError("حدث خطأ في جلب بيانات المشروع");
          return;
        }

        if (!data) {
          console.log("No project found with ID:", id);
          setError("المشروع غير موجود");
          return;
        }

        console.log("Fetched project:", data);
        setProject(data);
      } catch (err) {
        console.error("Error in fetchProject:", err);
        setError("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // دالة لمعالجة النقر على زر التعديل
  const handleEdit = () => {
    console.log("Edit project clicked, navigating to edit page");
    navigate(`/projects/${id}/edit`);
  };

  // دالة لمعالجة النقر على زر الحذف لفتح مربع الحوار
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  // دالة لمعالجة تأكيد الحذف
  const handleConfirmDelete = async () => {
    try {
      await deleteProject(id);
      toast.success("تم حذف المشروع بنجاح"); // إضافة رسالة نجاح
      navigate("/"); // الانتقال للصفحة الرئيسية بعد الحذف
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("حدث خطأ أثناء حذف المشروع"); // إضافة رسالة خطأ
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  // التحقق مما إذا كان المستخدم الحالي مشرفًا
  const isAdmin = user?.isAdmin;

  // إذا لم يتم العثور على المشروع بعد التحميل وعدم وجود خطأ (حالة لا ينبغي أن تحدث إذا كان الخطأ مُدارًا بشكل صحيح، ولكن كإجراء احترازي)
  if (!project) {
    return null; // أو يمكنك عرض رسالة "المشروع غير موجود" هنا أيضًا إذا لم يتم التعامل معها في الخطأ
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 py-12">
        {/* عرض تفاصيل المشروع وتمرير دوال التعديل والحذف */}
        <ProjectDetailsView
          project={project}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete} // تمرير دالة فتح مربع حوار الحذف
          id={id} // قد لا تحتاج لتمرير id هنا إذا كان موجودًا بالفعل في project
        />
      </main>

      {/* إضافة مكون ProjectDeleteDialog هنا */}
      <ProjectDeleteDialog
        projectId={id}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete} // تمرير دالة تأكيد الحذف
        title={project.title}
      />

      <Footer />
    </div>
  );
};

export default ProjectDetails;
