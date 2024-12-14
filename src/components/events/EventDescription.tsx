interface EventDescriptionProps {
  description: string;
}

export const EventDescription = ({ description }: EventDescriptionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">عن الفعالية</h2>
      <p className="text-gray-600 leading-relaxed break-words whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
};