
import { IdeaExportOption } from "./types";

export const getExportOptions = (): IdeaExportOption[] => {
  return [
    {
      id: "basic",
      label: "معلومات الفكرة الأساسية",
      description: "عنوان الفكرة، الوصف، المشكلة، الفرصة، الفوائد المتوقعة، إلخ",
      required: true,
      default: true,
    },
    {
      id: "comments",
      label: "التعليقات والمناقشات",
      description: "جميع التعليقات والمناقشات المتعلقة بالفكرة",
      default: true,
    },
    {
      id: "votes",
      label: "التصويتات والإحصاءات",
      description: "إحصاءات التصويت على الفكرة",
      default: true,
    },
    {
      id: "decision",
      label: "القرار المتخذ",
      description: "القرار النهائي وتفاصيله إذا كان متوفراً",
      default: true,
    },
    {
      id: "files_links",
      label: "روابط الملفات الداعمة",
      description: "روابط الملفات الداعمة للفكرة (بدون تنزيل الملفات)",
      default: true,
    },
    {
      id: "attachment_links",
      label: "روابط مرفقات التعليقات",
      description: "روابط الملفات المرفقة بالتعليقات (بدون تنزيل الملفات)",
      default: true,
    },
    {
      id: "download_files",
      label: "تنزيل الملفات المرفقة",
      description: "تنزيل الملفات الداعمة ومرفقات التعليقات كجزء من التصدير",
      default: false,
    },
  ];
};

export const getExportFormats = () => {
  return [
    {
      id: "pdf",
      label: "PDF",
      description: "تصدير بصيغة PDF (مستند للقراءة)",
    },
    {
      id: "text",
      label: "نص عادي",
      description: "تصدير بصيغة نص عادي",
      default: true,
    },
    {
      id: "zip",
      label: "ملف مضغوط",
      description: "تصدير جميع المعلومات كملفات نصية في ملف مضغوط ZIP",
    },
  ];
};
