
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";

interface ListItem {
  id: string;
  content: string;
  order_number: number;
}

interface DynamicListInputProps {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder: string;
  addLabel: string;
}

export const DynamicListInput = ({ 
  items, 
  onChange, 
  placeholder,
  addLabel
}: DynamicListInputProps) => {
  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      content: "",
      order_number: items.length + 1
    };
    
    onChange([...items, newItem]);
  };
  
  const updateItem = (id: string, content: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, content } : item
    );
    onChange(updatedItems);
  };
  
  const removeItem = (id: string) => {
    let filteredItems = items.filter(item => item.id !== id);
    
    // Reorder the remaining items
    filteredItems = filteredItems.map((item, index) => ({
      ...item,
      order_number: index + 1
    }));
    
    onChange(filteredItems);
  };
  
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 rtl">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full">
              {item.order_number}
            </div>
            <Input
              value={item.content}
              onChange={(e) => updateItem(item.id, e.target.value)}
              placeholder={placeholder}
              className="flex-grow rtl"
              dir="rtl"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              className="text-red-500"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="mt-2"
      >
        <Plus className="h-4 w-4 ml-2" />
        {addLabel}
      </Button>
    </div>
  );
};
