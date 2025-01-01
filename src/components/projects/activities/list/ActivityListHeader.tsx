import { Button } from "@/components/ui/button";
import { Plus, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { EditActivityForm } from "../form/EditActivityForm";

interface ActivityListHeaderProps {
  projectId: string;
  onSuccess?: () => void;
}

export const ActivityListHeader = ({ projectId, onSuccess }: ActivityListHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">أنشطة المشروع</h2>
        <CollapsibleTrigger asChild>
          <Button>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <Plus className="h-4 w-4 ml-2" />
            )}
            {isOpen ? "إغلاق" : "إضافة نشاط"}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-4">
        <div className="rounded-md border p-4 bg-white">
          <EditActivityForm
            projectId={projectId}
            onSuccess={() => {
              setIsOpen(false);
              onSuccess?.();
            }}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};