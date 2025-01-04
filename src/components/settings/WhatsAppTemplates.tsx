import { useTemplateForm } from "./whatsapp-templates/hooks/useTemplateForm";
import { TemplateDialog } from "./whatsapp-templates/TemplateDialog";
import { TemplateHeader } from "./whatsapp-templates/TemplateHeader";
import { TemplateList } from "./whatsapp-templates/TemplateList";

export const WhatsAppTemplates = () => {
  const {
    isOpen,
    setIsOpen,
    name,
    content,
    templateType,
    notificationType,
    targetType,
    isLoading,
    setName,
    setContent,
    setTemplateType,
    setNotificationType,
    setTargetType,
    handleSubmit,
    handleEdit,
    handlePreview,
  } = useTemplateForm();

  return (
    <div className="space-y-4" dir="rtl">
      <TemplateHeader onAddClick={() => setIsOpen(true)} />
      <TemplateDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        name={name}
        content={content}
        templateType={templateType}
        notificationType={notificationType}
        targetType={targetType}
        onNameChange={setName}
        onContentChange={setContent}
        onTemplateTypeChange={setTemplateType}
        onNotificationTypeChange={setNotificationType}
        onTargetTypeChange={setTargetType}
        onSubmit={handleSubmit}
        onPreview={handlePreview}
        isEditing={!!editingTemplate}
        isLoading={isLoading}
      />
      <TemplateList onEdit={handleEdit} />
    </div>
  );
};