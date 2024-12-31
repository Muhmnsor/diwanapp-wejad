import { useNavigate } from "react-router-dom";
import { CreateEventForm } from "./CreateEventForm";
import { useEventForm } from "./useEventForm";

export const CreateEventFormContainer = () => {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    isUploading,
    handleImageChange,
    handleSubmit
  } = useEventForm();

  return (
    <CreateEventForm
      formData={formData}
      setFormData={setFormData}
      onImageChange={handleImageChange}
      onSubmit={handleSubmit}
      isUploading={isUploading}
      onCancel={() => navigate("/")}
    />
  );
};