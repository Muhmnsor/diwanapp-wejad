
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialTarget } from "../TargetsDataService";

interface FormHeaderProps {
  editingTarget: FinancialTarget | null;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ editingTarget }) => {
  return (
    <CardHeader>
      <CardTitle>{editingTarget ? "تعديل المستهدف" : "إضافة مستهدف جديد"}</CardTitle>
    </CardHeader>
  );
};
