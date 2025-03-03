
import { Permission } from "../types";

/**
 * بيانات الصلاحيات المتاحة في النظام
 */
export const permissionsData: Permission[] = [
  // وحدة إدارة المستخدمين
  {
    id: "users-view",
    name: "عرض المستخدمين",
    description: "عرض قائمة المستخدمين وبياناتهم",
    module: "إدارة المستخدمين"
  },
  {
    id: "users-create",
    name: "إضافة مستخدم",
    description: "إضافة مستخدمين جدد للنظام",
    module: "إدارة المستخدمين"
  },
  {
    id: "users-edit",
    name: "تعديل مستخدم",
    description: "تعديل بيانات المستخدمين الحاليين",
    module: "إدارة المستخدمين"
  },
  {
    id: "users-delete",
    name: "حذف مستخدم",
    description: "حذف مستخدمين من النظام",
    module: "إدارة المستخدمين"
  },
  {
    id: "roles-manage",
    name: "إدارة الأدوار",
    description: "إنشاء وتعديل وحذف الأدوار والصلاحيات",
    module: "إدارة المستخدمين"
  },

  // وحدة إدارة الأفكار
  {
    id: "ideas-view",
    name: "عرض الأفكار",
    description: "عرض قائمة الأفكار وتفاصيلها",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-create",
    name: "إضافة فكرة",
    description: "إضافة أفكار جديدة للنظام",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-edit",
    name: "تعديل فكرة",
    description: "تعديل بيانات الأفكار الحالية",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-delete",
    name: "حذف فكرة",
    description: "حذف الأفكار من النظام",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-review",
    name: "مراجعة الأفكار",
    description: "مراجعة الأفكار والموافقة عليها أو رفضها",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-comment",
    name: "التعليق على الأفكار",
    description: "إضافة تعليقات على الأفكار",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-assign",
    name: "إسناد الأفكار",
    description: "إسناد الأفكار للمراجعين أو المنفذين",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-categories",
    name: "إدارة تصنيفات الأفكار",
    description: "إضافة وتعديل وحذف تصنيفات الأفكار",
    module: "إدارة الأفكار"
  },

  // وحدة إدارة الفعاليات
  {
    id: "events-view",
    name: "عرض الفعاليات",
    description: "عرض قائمة الفعاليات وبياناتها",
    module: "إدارة الفعاليات"
  },
  {
    id: "events-create",
    name: "إضافة فعالية",
    description: "إضافة فعاليات جديدة للنظام",
    module: "إدارة الفعاليات"
  },
  {
    id: "events-edit",
    name: "تعديل فعالية",
    description: "تعديل بيانات الفعاليات الحالية",
    module: "إدارة الفعاليات"
  },
  {
    id: "events-delete",
    name: "حذف فعالية",
    description: "حذف فعاليات من النظام",
    module: "إدارة الفعاليات"
  },

  // وحدة التقارير
  {
    id: "reports-view",
    name: "عرض التقارير",
    description: "عرض تقارير النظام",
    module: "التقارير"
  },
  {
    id: "reports-export",
    name: "تصدير التقارير",
    description: "تصدير التقارير بتنسيقات مختلفة",
    module: "التقارير"
  }
];
