
import { FC } from "react";

interface CostItem {
  item: string;
  quantity: number;
  total_cost: number;
}

interface IdeaCostsSectionProps {
  costs: CostItem[];
}

export const IdeaCostsSection: FC<IdeaCostsSectionProps> = ({ costs }) => {
  if (!costs?.length) return null;

  const calculateTotalCost = (costs: CostItem[]) => {
    return costs.reduce((sum, cost) => sum + (cost.total_cost || 0), 0);
  };

  return (
    <section className="bg-purple-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-purple-800">التكاليف المتوقعة</h3>
      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-100">
              <th className="p-3 text-right text-purple-800">البند</th>
              <th className="p-3 text-center text-purple-800">الكمية</th>
              <th className="p-3 text-center text-purple-800">التكلفة الإجمالية</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost, index) => (
              <tr key={index} className="border-b border-purple-50 hover:bg-purple-50/50 transition-colors">
                <td className="p-3 text-gray-700">{cost.item}</td>
                <td className="p-3 text-center text-gray-700">{cost.quantity}</td>
                <td className="p-3 text-center text-gray-700">{cost.total_cost} ريال</td>
              </tr>
            ))}
            <tr className="bg-purple-100">
              <td colSpan={2} className="p-3 font-semibold text-left text-purple-800">المجموع الكلي:</td>
              <td className="p-3 text-center font-semibold text-purple-800">
                {calculateTotalCost(costs)} ريال
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
