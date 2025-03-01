
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialTarget } from "../TargetsDataService";

interface FormHeaderProps {
  editingTarget: FinancialTarget | null;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ editingTarget }) => {
  // تحديد العنوان بناءً على ما إذا كنا نعدل مستهدفًا موجودًا أم نضيف مستهدفًا جديدًا
  const title = editingTarget ? "تعديل المستهدف" : "إضافة مستهدف جديد";
  
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
  );
};
