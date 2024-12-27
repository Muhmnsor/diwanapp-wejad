interface EventClassificationProps {
  eventPath?: string;
  eventCategory?: string;
}

export const EventClassification = ({ eventPath, eventCategory }: EventClassificationProps) => {
  if (!eventPath || !eventCategory) return null;
  
  return (
    <div className="flex items-center gap-2 text-gray-600 text-sm">
      <span>التصنيف:</span>
      <span className="font-semibold">{eventPath}</span>
      <span className="mx-1">\</span>
      <span className="font-semibold">{eventCategory}</span>
    </div>
  );
};