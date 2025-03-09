
import React from "react";

interface RequestFormDataDisplayProps {
  formData: Record<string, any>;
}

export const RequestFormDataDisplay: React.FC<RequestFormDataDisplayProps> = ({ formData }) => {
  const renderFormData = (data: Record<string, any>) => {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div key={key} className="mb-4">
            <h4 className="font-medium mb-2">{key}</h4>
            <div className="pl-4 border-l-2 border-gray-200">
              {renderFormData(value)}
            </div>
          </div>
        );
      }
      
      if (Array.isArray(value)) {
        return (
          <div key={key} className="mb-4">
            <h4 className="font-medium mb-2">{key}</h4>
            <div className="pl-4 border-l-2 border-gray-200">
              {value.map((item, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  {typeof item === 'object' ? renderFormData(item) : item.toString()}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      return (
        <div key={key} className="mb-2 grid grid-cols-2">
          <span className="font-medium">{key}:</span>
          <span>{value?.toString() || "-"}</span>
        </div>
      );
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-medium mb-4">بيانات النموذج</h3>
      {renderFormData(formData)}
    </div>
  );
};
