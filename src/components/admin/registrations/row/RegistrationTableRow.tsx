import { TableRow, TableCell } from "@/components/ui/table";
import { TextInputCell } from "./fields/TextInputCell";
import { EducationLevelSelect } from "./fields/EducationLevelSelect";
import { WorkStatusSelect } from "./fields/WorkStatusSelect";
import { GenderSelect } from "./fields/GenderSelect";
import { formatDate } from "@/utils/dateUtils";

interface RegistrationTableRowProps {
  registration: {
    id: string;
    arabic_name: string;
    english_name?: string;
    email: string;
    phone: string;
    education_level?: string;
    birth_date?: string;
    national_id?: string;
    gender?: string;
    work_status?: string;
    registration_number: string;
    created_at: string;
  };
  isEditing: boolean;
  loading: boolean;
  editForm: any;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditFormChange: (field: string, value: string) => void;
}

export const RegistrationTableRow = ({
  registration,
  isEditing,
  loading,
  editForm,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditFormChange,
}: RegistrationTableRowProps) => {
  return (
    <TableRow key={registration.id}>
      <TextInputCell
        value={editForm.arabicName}
        onChange={(value) => onEditFormChange("arabicName", value)}
        isEditing={isEditing}
        displayValue={registration.arabic_name}
      />
      <TextInputCell
        value={editForm.englishName}
        onChange={(value) => onEditFormChange("englishName", value)}
        isEditing={isEditing}
        displayValue={registration.english_name}
      />
      <TextInputCell
        value={editForm.email}
        onChange={(value) => onEditFormChange("email", value)}
        isEditing={isEditing}
        displayValue={registration.email}
        type="email"
      />
      <TextInputCell
        value={editForm.phone}
        onChange={(value) => onEditFormChange("phone", value)}
        isEditing={isEditing}
        displayValue={registration.phone}
        type="tel"
      />
      <EducationLevelSelect
        value={editForm.educationLevel}
        onChange={(value) => onEditFormChange("educationLevel", value)}
        isEditing={isEditing}
        educationLevel={registration.education_level}
      />
      <TableCell>
        {registration.birth_date ? formatDate(registration.birth_date) : '-'}
      </TableCell>
      <TextInputCell
        value={editForm.nationalId}
        onChange={(value) => onEditFormChange("nationalId", value)}
        isEditing={isEditing}
        displayValue={registration.national_id}
      />
      <GenderSelect
        value={editForm.gender}
        onChange={(value) => onEditFormChange("gender", value)}
        isEditing={isEditing}
        gender={registration.gender}
      />
      <WorkStatusSelect
        value={editForm.workStatus}
        onChange={(value) => onEditFormChange("workStatus", value)}
        isEditing={isEditing}
        workStatus={registration.work_status}
      />
      <TableCell>{registration.registration_number}</TableCell>
      <TableCell>{formatDate(registration.created_at)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                disabled={loading}
                className="p-1 text-green-600 hover:text-green-700"
              >
                حفظ
              </button>
              <button
                onClick={onCancel}
                disabled={loading}
                className="p-1 text-gray-600 hover:text-gray-700"
              >
                إلغاء
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-1 text-blue-600 hover:text-blue-700"
              >
                تعديل
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-red-600 hover:text-red-700"
              >
                حذف
              </button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};