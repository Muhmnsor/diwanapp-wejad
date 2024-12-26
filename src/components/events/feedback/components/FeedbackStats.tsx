import { FeedbackAverages } from "../types";

interface FeedbackStatsProps {
  feedback: any[];
  averages: FeedbackAverages;
}

export const FeedbackStats = ({ feedback, averages }: FeedbackStatsProps) => {
  return (
    <>
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold">ملخص التقييمات</h3>
        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
          عدد المقيمين: {feedback.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">التقييم العام</p>
          <p className="text-2xl font-bold">{averages.overall.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">تقييم المحتوى</p>
          <p className="text-2xl font-bold">{averages.content.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">تقييم التنظيم</p>
          <p className="text-2xl font-bold">{averages.organization.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-2">تقييم المقدم</p>
          <p className="text-2xl font-bold">{averages.presenter.toFixed(1)}<span className="text-sm text-gray-500"> / 5</span></p>
        </div>
      </div>
    </>
  );
};