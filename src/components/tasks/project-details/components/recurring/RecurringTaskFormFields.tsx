
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RecurringTaskFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  frequency: string;
  setFrequency: (frequency: string) => void;
  interval: number;
  setInterval: (interval: number) => void;
  dueDate: string;
  setDueDate: (dueDate: string) => void;
}

export const RecurringTaskFormFields = ({
  title,
  setTitle,
  description,
  setDescription,
  frequency,
  setFrequency,
  interval,
  setInterval,
  dueDate,
  setDueDate
}: RecurringTaskFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">عنوان المهمة</Label>
        <Input
          id="title"
          placeholder="أدخل عنوان المهمة"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">وصف المهمة</Label>
        <Textarea
          id="description"
          placeholder="أدخل وصف المهمة"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dueDate">تاريخ البدء</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="frequency">التكرار</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع التكرار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="interval">الفاصل الزمني</Label>
          <Input
            id="interval"
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value))}
            placeholder="الفاصل الزمني"
          />
        </div>
      </div>
    </div>
  );
};
