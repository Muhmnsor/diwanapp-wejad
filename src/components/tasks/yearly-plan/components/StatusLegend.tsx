
export const StatusLegend = () => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">وسائل الإيضاح</h3>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-green-500"></div>
          <span>مكتملة</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
          <span>قيد التنفيذ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-amber-500"></div>
          <span>قيد الانتظار</span>
        </div>
      </div>
    </div>
  );
};
