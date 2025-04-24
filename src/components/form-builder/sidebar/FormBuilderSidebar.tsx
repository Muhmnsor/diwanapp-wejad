
import { useFormBuilder } from "../FormBuilderContext";
import { FieldSettings } from "./FieldSettings";

export const FormBuilderSidebar = () => {
  const { formState, removeField, moveFieldUp, moveFieldDown } = useFormBuilder();
  const { selectedFieldIndex, currentForm } = formState;
  
  // إذا لم يتم تحديد أي حقل، عرض رسالة
  if (selectedFieldIndex === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center" dir="rtl">
        <h3 className="text-lg font-medium mb-2">خصائص الحقل</h3>
        <p className="text-sm text-muted-foreground">
          اختر أحد الحقول من منطقة تصميم النموذج لتعديل خصائصه.
        </p>
      </div>
    );
  }

  const field = currentForm.fields[selectedFieldIndex];
  
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">خصائص الحقل</h3>
      </div>

      <div className="space-y-4">
        <FieldSettings
          field={field}
          index={selectedFieldIndex}
          onRemove={() => removeField(selectedFieldIndex)}
          onMoveUp={() => moveFieldUp(selectedFieldIndex)}
          onMoveDown={() => moveFieldDown(selectedFieldIndex)}
        />
      </div>
    </div>
  );
};
