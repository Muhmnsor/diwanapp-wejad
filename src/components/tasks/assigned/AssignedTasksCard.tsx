
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignedTasksList } from "../AssignedTasksList";

export const AssignedTasksCard = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">جميع المهام المكلف بها</h2>
        <AssignedTasksList />
      </CardContent>
    </Card>
  );
};
