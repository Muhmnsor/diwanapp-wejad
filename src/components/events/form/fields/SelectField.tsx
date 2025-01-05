interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const SelectField = ({
  value,
  onChange,
  options,
  className
}: SelectFieldProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 border rounded-md ${className}`}
    >
      <option value="">اختر...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};