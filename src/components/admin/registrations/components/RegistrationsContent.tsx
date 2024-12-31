import { RegistrationsTable } from "../RegistrationsTable";
import { ExportButton } from "../../ExportButton";

interface RegistrationsContentProps {
  registrations: any[];
  onDeleteRegistration: (id: string) => void;
}

export const RegistrationsContent = ({ 
  registrations,
  onDeleteRegistration 
}: RegistrationsContentProps) => {
  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1A1F2C]">التسجيلات</h2>
        <ExportButton data={registrations} filename="registrations" />
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <RegistrationsTable 
          registrations={registrations} 
          onDeleteRegistration={onDeleteRegistration}
        />
      </div>
    </div>
  );
};