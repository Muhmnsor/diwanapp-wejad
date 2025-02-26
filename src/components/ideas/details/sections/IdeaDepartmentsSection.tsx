
import { FC } from "react";

interface Department {
  name: string;
  contribution: string;
}

interface IdeaDepartmentsSectionProps {
  departments: Department[];
}

export const IdeaDepartmentsSection: FC<IdeaDepartmentsSectionProps> = ({ departments }) => {
  if (!departments?.length) return null;

  return (
    <section className="bg-white p-6 rounded-lg border border-purple-100">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">الإدارات المساهمة</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {departments.map((dept, index) => (
          <div key={index} className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-purple-700">{dept.name}</h4>
            <p className="text-sm text-gray-600">{dept.contribution}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
