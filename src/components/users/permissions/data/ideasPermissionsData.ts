
import { Permission } from "../types";

export const ideasPermissions: Permission[] = [
  {
    id: "ideas-view",
    name: "عرض الأفكار",
    description: "عرض جميع الأفكار المقدمة",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-create",
    name: "إنشاء الأفكار",
    description: "القدرة على إنشاء أفكار جديدة",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-edit",
    name: "تعديل الأفكار",
    description: "القدرة على تعديل الأفكار الموجودة",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-delete",
    name: "حذف الأفكار",
    description: "القدرة على حذف الأفكار",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-approve",
    name: "الموافقة على الأفكار",
    description: "القدرة على الموافقة على الأفكار المقدمة",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-reject",
    name: "رفض الأفكار",
    description: "القدرة على رفض الأفكار المقدمة",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-comment",
    name: "التعليق على الأفكار",
    description: "القدرة على إضافة تعليقات على الأفكار",
    module: "إدارة الأفكار"
  },
  {
    id: "ideas-categories",
    name: "إدارة تصنيفات الأفكار",
    description: "القدرة على إضافة وتعديل وحذف تصنيفات الأفكار",
    module: "إدارة الأفكار"
  }
];
