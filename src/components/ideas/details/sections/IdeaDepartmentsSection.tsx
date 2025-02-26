
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
    <section className="bg-white p-4 rounded-lg border border-purple-100 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">الإدارات المساهمة</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-100">
              <th className="p-2 text-right text-purple-800 rounded-tr-lg">الإدارة</th>
              <th className="p-2 text-right text-purple-800 rounded-tl-lg">المساهمة</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                <td className="p-2 text-gray-700">{dept.name}</td>
                <td className="p-2 text-gray-600">{dept.contribution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
