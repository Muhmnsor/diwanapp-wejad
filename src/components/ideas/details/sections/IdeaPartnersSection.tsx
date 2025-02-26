
import { FC } from "react";

interface Partner {
  name: string;
  contribution: string;
}

interface IdeaPartnersSectionProps {
  partners: Partner[];
}

export const IdeaPartnersSection: FC<IdeaPartnersSectionProps> = ({ partners }) => {
  console.log("Partners data:", partners);

  if (!partners?.length) {
    console.log("No partners data available");
    return null;
  }

  return (
    <section className="bg-white p-4 rounded-lg border border-purple-100 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">الشركاء المتوقعون</h3>
      <div className="overflow-x-auto relative">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-purple-100">
              <th className="p-2 text-right text-purple-800 rounded-tr-lg">اسم الشريك</th>
              <th className="p-2 text-right text-purple-800 rounded-tl-lg">المساهمة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {partners.map((partner, index) => (
              <tr key={index} className="hover:bg-purple-50/50 transition-colors">
                <td className="p-2 text-gray-700">{partner.name}</td>
                <td className="p-2 text-gray-600">{partner.contribution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
