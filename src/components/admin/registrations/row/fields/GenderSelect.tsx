import React from 'react';

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const GenderSelect = ({ value, onChange }: GenderSelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">اختر</option>
      <option value="male">ذكر</option>
      <option value="female">أنثى</option>
    </select>
  );
};