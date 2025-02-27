
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/utils/dateUtils";
import { getStatusClass, getStatusDisplay } from "../../utils/statusUtils";
import { DecisionDisplayProps } from "./types";
import { AssigneeList } from "./AssigneeList";

export const DecisionDisplay = ({ 
  decision, 
  status, 
  reason, 
  assignees, 
  timeline, 
  budget 
}: DecisionDisplayProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-md p-3 border bg-muted/10">
        <div className="flex items-center mb-3">
          <span className="font-semibold ml-2">حالة القرار:</span>
          <span className={`px-2 py-0.5 rounded-full text-sm ${getStatusClass(decision?.status || status)}`}>
            {getStatusDisplay(decision?.status || status)}
          </span>
          <span className="mr-3 text-gray-600 text-sm">
            تم اتخاذ القرار في {decision?.created_at ? formatDate(decision.created_at) : 'تاريخ غير معروف'}
          </span>
        </div>
        
        <Separator className="my-3" />
        
        <div className="space-y-3 text-right">
          <div>
            <h4 className="font-semibold mb-1">السبب / الملاحظات:</h4>
            <p className="text-gray-700 whitespace-pre-line">{decision?.reason || reason}</p>
          </div>
          
          {(decision?.status === 'approved' || status === 'approved') && (
            <>
              {assignees.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-right">المكلفون بالتنفيذ:</h4>
                  <AssigneeList assignees={assignees} readOnly />
                </div>
              )}
              
              {(timeline || decision?.timeline) && (
                <div className="text-right">
                  <h4 className="font-semibold mb-1">الإطار الزمني المقترح:</h4>
                  <p className="text-gray-700">{decision?.timeline || timeline}</p>
                </div>
              )}
              
              {(budget || decision?.budget) && (
                <div className="text-right">
                  <h4 className="font-semibold mb-1">الميزانية المقترحة:</h4>
                  <p className="text-gray-700">{decision?.budget || budget}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
