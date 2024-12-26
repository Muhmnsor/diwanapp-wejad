import React from 'react';

interface EventDescriptionProps {
  description: string;
}

export const EventDescription = ({ description }: EventDescriptionProps) => {
  return (
    <div className="px-8">
      <h2 className="text-xl font-semibold mb-4 text-[#1A1F2C]">عن الفعالية</h2>
      <p className="text-[#4A4E57] leading-7 break-words whitespace-pre-wrap text-right">
        {description}
      </p>
    </div>
  );
};