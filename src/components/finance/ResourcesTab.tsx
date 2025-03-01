import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResourcesTable } from "./ResourcesTable";
import { ResourceForm } from "./resource-form";

export const ResourcesTab = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الموارد المالية</h2>
        <Button onClick={handleOpenForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>إضافة مورد جديد</span>
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>إضافة مورد جديد</CardTitle>
            <CardDescription>أدخل تفاصيل المورد المالي والتوزيع على البنود</CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceForm onCancel={handleCloseForm} onSubmit={handleCloseForm} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة الموارد</CardTitle>
          <CardDescription>جميع الموارد المالية التي تمت إضافتها</CardDescription>
        </CardHeader>
        <CardContent>
          <ResourcesTable />
        </CardContent>
      </Card>
    </div>
  );
};
