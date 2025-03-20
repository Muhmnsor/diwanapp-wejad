
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, ArrowUp, ArrowDown } from "lucide-react";

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder: string;
}

export const ListEditor: React.FC<ListEditorProps> = ({
  items,
  onChange,
  label,
  placeholder
}) => {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (newItem.trim() !== "") {
      onChange([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newItems = [...items];
      const temp = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = temp;
      onChange(newItems);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < items.length - 1) {
      const newItems = [...items];
      const temp = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = temp;
      onChange(newItems);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="space-y-4 rtl">
      <Label htmlFor={label}>{label}</Label>
      
      <div className="flex space-x-2 space-x-reverse rtl">
        <Input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          className="rtl text-right"
        />
        <Button 
          type="button" 
          onClick={handleAddItem}
          variant="outline"
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 rtl">
            <span className="font-bold ml-2">{index + 1}.</span>
            <span className="flex-grow text-right">{item}</span>
            <div className="flex gap-1">
              <Button
                type="button"
                onClick={() => handleMoveUp(index)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={() => handleMoveDown(index)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={index === items.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={() => handleRemoveItem(index)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
