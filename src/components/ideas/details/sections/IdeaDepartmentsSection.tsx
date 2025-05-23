
import { FC } from "react";

interface Department {
  name: string;
  contribution: string;
}

interface IdeaDepartmentsSectionProps {
  departments: Department[];
}

export const IdeaDepartmentsSection: FC<IdeaDepartmentsSectionProps> = ({ departments }) => {
  console.log("Departments data:", departments);
  
  if (!departments?.length) {
    console.log("No departments data available");
    return null;
  }

  // معالجة البيانات المدمجة في حقل name
  const processedDepartments = departments.map(dept => {
    try {
      if (typeof dept.name === 'string' && dept.name.startsWith('{')) {
        const parsed = JSON.parse(dept.name);
        return {
          name: parsed.name,
          contribution: parsed.contribution
        };
      }
      return dept;
    } catch (error) {
      console.error("Error parsing department data:", error);
      return dept;
    }
  });

  return (
    <section className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">الإدارات المساهمة</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-right text-gray-800 border-b first:rounded-tr-lg w-1/2">الإدارة</th>
              <th className="p-3 text-right text-gray-800 border-b last:rounded-tl-lg w-1/2">المساهمة المتوقعة</th>
            </tr>
          </thead>
          <tbody>
            {processedDepartments.map((dept, index) => {
              console.log("Processed department entry:", dept);
              return (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 text-gray-700">{dept.name}</td>
                  <td className="p-3 text-gray-600">{dept.contribution}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
