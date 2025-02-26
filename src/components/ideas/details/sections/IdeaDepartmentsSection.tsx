
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

  return (
    <section className="bg-white p-4 rounded-lg border border-purple-100 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">الإدارات المساهمة</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-100">
              <th className="p-3 text-right text-purple-800 border-b first:rounded-tr-lg w-1/2">الإدارة</th>
              <th className="p-3 text-right text-purple-800 border-b last:rounded-tl-lg w-1/2">المساهمة المتوقعة</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => {
              console.log("Department entry:", dept); // للتأكد من شكل البيانات
              return (
                <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
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
