
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AssigneeFormProps } from "./types";

export const AssigneeForm = ({ onAdd }: AssigneeFormProps) => {
  const [name, setName] = useState("");
  const [responsibility, setResponsibility] = useState("");

  const handleAdd = () => {
    if (name && responsibility) {
      onAdd(name, responsibility);
      setName("");
      setResponsibility("");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
      <div className="sm:col-span-5">
        <Input 
          placeholder="اسم المكلف"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="sm:col-span-5">
        <Input 
          placeholder="المهمة أو المسؤولية"
          value={responsibility}
          onChange={(e) => setResponsibility(e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <Button 
          type="button" 
          onClick={handleAdd}
          className="w-full"
          variant="outline"
        >
          <Plus size={16} className="ml-1" />
          إضافة
        </Button>
      </div>
    </div>
  );
};
