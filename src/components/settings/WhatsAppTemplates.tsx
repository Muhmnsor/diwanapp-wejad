import { useTemplateForm } from "./whatsapp-templates/hooks/useTemplateForm";
import { TemplateHeader } from "./whatsapp-templates/TemplateHeader";
import { TemplateList } from "./whatsapp-templates/TemplateList";
import { TemplateDialog } from "./whatsapp-templates/TemplateDialog";

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
    editingTemplate,
    setName,
    setContent,
    setTemplateType,
    setNotificationType,
    setTargetType,
    handleSubmit,
    handleEdit,
    handleClose,
    handlePreview,
  } = useTemplateForm();

  return (
    <div className="space-y-6">
      <TemplateHeader onAddClick={() => setIsOpen(true)} />
      
      <TemplateList onEdit={handleEdit} />

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
    </div>
  );
};