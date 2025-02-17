
import { Card, CardContent } from "@/components/ui/card";
import { CreateEventForm } from "./CreateEventForm";

export const CreateEventFormContainer = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">المعلومات الأساسية</h2>
          <CreateEventForm />
        </CardContent>
      </Card>
    </div>
  );
};
