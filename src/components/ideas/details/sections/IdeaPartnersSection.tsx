
import { FC } from "react";

interface Partner {
  name: string;
  contribution: string;
}

interface IdeaPartnersSectionProps {
  partners: Partner[];
}

export const IdeaPartnersSection: FC<IdeaPartnersSectionProps> = ({ partners }) => {
  if (!partners?.length) return null;

  return (
    <section className="bg-white p-6 rounded-lg border border-purple-100">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">الشركاء المتوقعون</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-purple-100 rounded-t-lg">
              <th className="p-3 text-right text-purple-800 border-b first:rounded-tr-lg">اسم الشريك</th>
              <th className="p-3 text-right text-purple-800 border-b last:rounded-tl-lg">المساهمة</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner, index) => (
              <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                <td className="p-3 text-gray-700 font-medium">{partner.name}</td>
                <td className="p-3 text-gray-600">{partner.contribution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
