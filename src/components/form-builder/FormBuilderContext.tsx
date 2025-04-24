
import { createContext, useContext, useState, ReactNode } from 'react';
import { DynamicField, DynamicForm, FormBuilderState } from '@/types/form-builder';
import { v4 as uuidv4 } from 'uuid';

interface FormBuilderContextType {
  formState: FormBuilderState;
  addField: (field: Omit<DynamicField, 'id'>) => void;
  updateField: (index: number, field: DynamicField) => void;
  removeField: (index: number) => void;
  selectField: (index: number | null) => void;
  moveFieldUp: (index: number) => void;
  moveFieldDown: (index: number) => void;
  updateFormDetails: (title: string, description?: string) => void;
  togglePreviewMode: () => void;
  resetForm: () => void;
}

const createEmptyForm = (): DynamicForm => ({
  id: uuidv4(),
  title: 'نموذج جديد',
  description: '',
  fields: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const initialState: FormBuilderState = {
  currentForm: createEmptyForm(),
  selectedFieldIndex: null,
  previewMode: false,
};

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export const FormBuilderProvider = ({ children }: { children: ReactNode }) => {
  const [formState, setFormState] = useState<FormBuilderState>(initialState);

  const addField = (field: Omit<DynamicField, 'id'>) => {
    setFormState(prev => {
      const newField: DynamicField = {
        ...field,
        id: uuidv4(),
      };
      
      const updatedForm = {
        ...prev.currentForm,
        fields: [...prev.currentForm.fields, newField],
        updatedAt: new Date(),
      };
      
      return {
        ...prev,
        currentForm: updatedForm,
        selectedFieldIndex: updatedForm.fields.length - 1,
      };
    });
  };

  const updateField = (index: number, field: DynamicField) => {
    setFormState(prev => {
      const updatedFields = [...prev.currentForm.fields];
      updatedFields[index] = field;
      
      return {
        ...prev,
        currentForm: {
          ...prev.currentForm,
          fields: updatedFields,
          updatedAt: new Date(),
        },
      };
    });
  };

  const removeField = (index: number) => {
    setFormState(prev => {
      const updatedFields = [...prev.currentForm.fields];
      updatedFields.splice(index, 1);
      
      return {
        ...prev,
        currentForm: {
          ...prev.currentForm,
          fields: updatedFields,
          updatedAt: new Date(),
        },
        selectedFieldIndex: null,
      };
    });
  };

  const selectField = (index: number | null) => {
    setFormState(prev => ({
      ...prev,
      selectedFieldIndex: index,
    }));
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    
    setFormState(prev => {
      const updatedFields = [...prev.currentForm.fields];
      const temp = updatedFields[index];
      updatedFields[index] = updatedFields[index - 1];
      updatedFields[index - 1] = temp;
      
      return {
        ...prev,
        currentForm: {
          ...prev.currentForm,
          fields: updatedFields,
          updatedAt: new Date(),
        },
        selectedFieldIndex: index - 1,
      };
    });
  };

  const moveFieldDown = (index: number) => {
    setFormState(prev => {
      if (index === prev.currentForm.fields.length - 1) return prev;
      
      const updatedFields = [...prev.currentForm.fields];
      const temp = updatedFields[index];
      updatedFields[index] = updatedFields[index + 1];
      updatedFields[index + 1] = temp;
      
      return {
        ...prev,
        currentForm: {
          ...prev.currentForm,
          fields: updatedFields,
          updatedAt: new Date(),
        },
        selectedFieldIndex: index + 1,
      };
    });
  };

  const updateFormDetails = (title: string, description?: string) => {
    setFormState(prev => ({
      ...prev,
      currentForm: {
        ...prev.currentForm,
        title,
        description: description || prev.currentForm.description,
        updatedAt: new Date(),
      },
    }));
  };

  const togglePreviewMode = () => {
    setFormState(prev => ({
      ...prev,
      previewMode: !prev.previewMode,
      selectedFieldIndex: null,
    }));
  };

  const resetForm = () => {
    setFormState({
      currentForm: createEmptyForm(),
      selectedFieldIndex: null,
      previewMode: false,
    });
  };

  return (
    <FormBuilderContext.Provider
      value={{
        formState,
        addField,
        updateField,
        removeField,
        selectField,
        moveFieldUp,
        moveFieldDown,
        updateFormDetails,
        togglePreviewMode,
        resetForm,
      }}
    >
      {children}
    </FormBuilderContext.Provider>
  );
};

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
};
