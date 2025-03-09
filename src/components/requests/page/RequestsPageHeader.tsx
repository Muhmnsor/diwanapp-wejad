
import React from "react";

interface RequestsPageHeaderProps {
  title: string;
  description: string;
}

export const RequestsPageHeader: React.FC<RequestsPageHeaderProps> = ({ 
  title, 
  description 
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
};
