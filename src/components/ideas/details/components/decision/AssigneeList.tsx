
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { AssigneeListProps } from "./types";

export const AssigneeList = ({ assignees, onRemove, readOnly = false }: AssigneeListProps) => {
  if (assignees.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden mb-2">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="py-2 px-4 text-center">الاسم</th>
            <th className="py-2 px-4 text-center">المهمة</th>
            {!readOnly && (
              <th className="py-2 px-4 text-center w-16">حذف</th>
            )}
          </tr>
        </thead>
        <tbody>
          {assignees.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="py-2 px-4 text-center">{item.name}</td>
              <td className="py-2 px-4 text-center">{item.responsibility}</td>
              {!readOnly && onRemove && (
                <td className="py-2 px-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
