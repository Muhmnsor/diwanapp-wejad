import { Project } from "@/types/project";
import { useRegistrations } from "@/hooks/useRegistrations";
import { formatDate } from "@/utils/dateUtils";

interface ProjectInfoProps {
  project: Project;
}

export const ProjectInfo = ({ project }: ProjectInfoProps) => {
  const { data: registrationCounts } = useRegistrations();
  console.log('Registration counts:', registrationCounts);
  console.log('Project ID:', project.id);
  
  const attendeesCount = registrationCounts?.[project.id] || 0;
  console.log('Attendees count:', attendeesCount);

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#1A1F2C]">تفاصيل المشروع</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#4A4E57]">
                <span className="font-medium">تاريخ البداية:</span>
                <span>{formatDate(project.start_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A4E57]">
                <span className="font-medium">تاريخ النهاية:</span>
                <span>{formatDate(project.end_date)}</span>
              </div>
              {project.registration_start_date && (
                <div className="flex items-center gap-2 text-[#4A4E57]">
                  <span className="font-medium">بداية التسجيل:</span>
                  <span>{formatDate(project.registration_start_date)}</span>
                </div>
              )}
              {project.registration_end_date && (
                <div className="flex items-center gap-2 text-[#4A4E57]">
                  <span className="font-medium">نهاية التسجيل:</span>
                  <span>{formatDate(project.registration_end_date)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#1A1F2C]">المشاركين</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#4A4E57]">
                <span className="font-medium">عدد المشاركين:</span>
                <span>{attendeesCount} من {project.max_attendees} مشارك</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-[#1A1F2C]">متطلبات المشروع</h3>
            <div className="space-y-2">
              {project.required_attendance_percentage && (
                <div className="flex items-center gap-2 text-[#4A4E57]">
                  <span className="font-medium">نسبة الحضور المطلوبة:</span>
                  <span>{project.required_attendance_percentage}%</span>
                </div>
              )}
              {project.required_activities_count && (
                <div className="flex items-center gap-2 text-[#4A4E57]">
                  <span className="font-medium">عدد الأنشطة المطلوبة:</span>
                  <span>{project.required_activities_count} نشاط</span>
                </div>
              )}
              {project.attendance_requirement_type && (
                <div className="flex items-center gap-2 text-[#4A4E57]">
                  <span className="font-medium">نوع متطلبات الحضور:</span>
                  <span>
                    {project.attendance_requirement_type === 'count' ? 'عدد الأنشطة' : 'نسبة الحضور'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};