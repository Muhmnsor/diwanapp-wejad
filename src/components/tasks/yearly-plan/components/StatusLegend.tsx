
import { Card } from "@/components/ui/card"

export const StatusLegend = () => {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium mb-2">مفتاح حالة المشاريع</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-amber-500"></div>
          <span className="text-sm">قيد الانتظار</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
          <span className="text-sm">قيد التنفيذ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-green-500"></div>
          <span className="text-sm">مكتمل</span>
        </div>
      </div>
    </Card>
  )
}
