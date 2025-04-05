
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { JournalEntryForm } from "./journal/JournalEntryForm";
import { JournalEntriesTable } from "./journal/JournalEntriesTable";

export const JournalEntries = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setShowForm(true);
  };

  const handleEditEntry = (entry: any) => {
    setSelectedEntry(entry);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedEntry(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">القيود المحاسبية</h2>
        <Button onClick={handleAddEntry} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          قيد محاسبي جديد
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">
              {selectedEntry ? "تعديل قيد محاسبي" : "إنشاء قيد محاسبي جديد"}
            </CardTitle>
            <CardDescription className="text-right">
              {selectedEntry ? "قم بتعديل بيانات القيد المحاسبي" : "أدخل بيانات القيد المحاسبي الجديد"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JournalEntryForm 
              entry={selectedEntry}
              onCancel={handleFormClose}
              onSuccess={handleFormClose}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-right">سجل القيود المحاسبية</CardTitle>
          <CardDescription className="text-right">
            سجل جميع القيود المحاسبية التي تم إدخالها في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JournalEntriesTable onEditEntry={handleEditEntry} />
        </CardContent>
      </Card>
    </>
  );
};
