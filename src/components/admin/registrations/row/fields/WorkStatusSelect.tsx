import React from 'react';

interface WorkStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const WorkStatusSelect = ({ value, onChange }: WorkStatusSelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">اختر</option>
      <option value="employed">موظف</option>
      <option value="unemployed">غير موظف</option>
      <option value="student">طالب</option>
      <option value="retired">متقاعد</option>
    </select>
  );
};