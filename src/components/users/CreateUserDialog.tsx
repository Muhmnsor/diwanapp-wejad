
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ControlledCreateUserDialog } from "./dialogs/ControlledCreateUserDialog";
import { Role } from "./types";

interface CreateUserDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  roles: Role[];
  onUserCreated?: () => void;
}

export const CreateUserDialog = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onSuccess,
  onUserCreated,
  roles,
}: CreateUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle both controlled and uncontrolled modes
  const dialogOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleClose = externalOnClose || (() => setIsOpen(false));

  // Support for uncontrolled usage with a button
  if (externalIsOpen === undefined) {
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>إضافة مستخدم جديد</Button>
        <ControlledCreateUserDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={onSuccess}
          onUserCreated={onUserCreated}
          roles={roles}
        />
      </>
    );
  }

  // For controlled usage (with isOpen and onClose provided)
  return (
    <ControlledCreateUserDialog
      isOpen={dialogOpen}
      onClose={handleClose}
      onSuccess={onSuccess}
      onUserCreated={onUserCreated}
      roles={roles}
    />
  );
};
