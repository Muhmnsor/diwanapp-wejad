
export const exportOptions = [
  {
    id: "details",
    label: "تفاصيل الفكرة",
    description: "تصدير جميع تفاصيل الفكرة (مطلوب)",
    required: true,
    default: true,
  },
  {
    id: "comments",
    label: "المناقشات",
    description: "تصدير جميع المناقشات حول الفكرة",
    default: true,
  },
  {
    id: "votes",
    label: "التصويتات",
    description: "تصدير بيانات التصويت على الفكرة",
    default: true,
  },
  {
    id: "decision",
    label: "القرار",
    description: "تصدير بيانات القرار المتخذ بشأن الفكرة (إن وجد)",
    default: true,
  },
  {
    id: "download_files",
    label: "تحميل الملفات",
    description: "تحميل الملفات المرفقة بالفكرة والمناقشات (متاح فقط مع تنسيق الملف المضغوط)",
    default: false,
  },
];

export const exportFormats = [
  {
    id: "text",
    label: "ملف نصي",
    description: "تصدير البيانات كملف نصي بسيط (.txt)",
    default: true,
  },
  {
    id: "pdf",
    label: "ملف PDF",
    description: "تصدير البيانات كملف PDF (قريباً)",
  },
  {
    id: "zip",
    label: "ملف مضغوط",
    description: "تصدير البيانات كملف مضغوط (.zip) يحتوي على ملفات منفصلة",
  },
];
