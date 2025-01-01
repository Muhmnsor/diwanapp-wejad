import { Folder, Tag } from "lucide-react";

interface ProjectCategoriesProps {
  eventPath?: string;
  eventCategory?: string;
}

export const ProjectCategories = ({ eventPath, eventCategory }: ProjectCategoriesProps) => {
  const formatEventPath = (path?: string) => {
    if (!path) return '';
    const pathMap: Record<string, string> = {
      'environment': 'البيئة',
      'community': 'المجتمع',
      'content': 'المحتوى'
    };
    return pathMap[path] || path;
  };

  const formatEventCategory = (category?: string) => {
    if (!category) return '';
    const categoryMap: Record<string, string> = {
      'social': 'اجتماعي',
      'entertainment': 'ترفيهي',
      'service': 'خدمي',
      'educational': 'تعليمي',
      'consulting': 'استشاري',
      'interest': 'اهتمام',
      'specialization': 'تخصص',
      'spiritual': 'روحي',
      'cultural': 'ثقافي',
      'behavioral': 'سلوكي',
      'skill': 'مهاري',
      'health': 'صحي',
      'diverse': 'متنوع'
    };
    return categoryMap[category] || category;
  };

  if (!eventPath && !eventCategory) return null;

  return (
    <div className="px-8 flex items-center gap-6">
      {eventPath && (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <span>المسار: {formatEventPath(eventPath)}</span>
        </div>
      )}
      {eventCategory && (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <span>التصنيف: {formatEventCategory(eventCategory)}</span>
        </div>
      )}
    </div>
  );
};