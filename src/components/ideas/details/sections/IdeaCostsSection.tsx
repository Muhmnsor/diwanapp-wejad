
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
  console.log("Costs data:", costs);
  
  if (!costs?.length) {
    console.log("No costs data available");
    return null;
  }

  const calculateTotalCost = (costs: CostItem[]) => {
    return costs.reduce((sum, cost) => sum + (cost.total_cost || 0), 0);
  };

  return (
    <section className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">التكاليف المتوقعة</h3>
      <div className="overflow-x-auto relative">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-right text-gray-800 rounded-tr-lg">البند</th>
              <th className="p-2 text-center text-gray-800">الكمية</th>
              <th className="p-2 text-center text-gray-800 rounded-tl-lg">التكلفة الإجمالية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {costs.map((cost, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-2 text-gray-700">{cost.item}</td>
                <td className="p-2 text-center text-gray-700">{cost.quantity}</td>
                <td className="p-2 text-center text-gray-700">{cost.total_cost} ريال</td>
              </tr>
            ))}
            <tr className="bg-gray-100">
              <td colSpan={2} className="p-2 font-semibold text-left text-gray-800">المجموع الكلي:</td>
              <td className="p-2 text-center font-semibold text-gray-800">
                {calculateTotalCost(costs)} ريال
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
