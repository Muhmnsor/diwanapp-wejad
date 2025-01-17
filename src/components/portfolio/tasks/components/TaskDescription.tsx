interface TaskDescriptionProps {
  description: string | null;
}

export const TaskDescription = ({ description }: TaskDescriptionProps) => {
  if (!description) return null;

  return (
    <div>
      <span className="text-sm text-gray-500 block mb-1">الوصف:</span>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};