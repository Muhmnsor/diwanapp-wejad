interface FeedbackCommentsProps {
  feedback: any[];
}

export const FeedbackComments = ({ feedback }: FeedbackCommentsProps) => {
  const feedbackWithComments = feedback.filter(item => item.feedback_text);

  if (feedbackWithComments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h4 className="font-medium mb-4 text-lg">التعليقات</h4>
      <div className="space-y-4">
        {feedbackWithComments.map((item, index) => (
          <div key={item.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex flex-col gap-2">
              <p className="text-gray-700">{item.feedback_text}</p>
              {(item.name || item.phone) && (
                <div className="text-sm text-gray-500 flex gap-2 mt-2 border-t pt-2">
                  {item.name && <span>الاسم: {item.name}</span>}
                  {item.name && item.phone && <span>•</span>}
                  {item.phone && <span>الجوال: {item.phone}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};