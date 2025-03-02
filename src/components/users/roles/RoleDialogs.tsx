
import { useState } from "react";
import { Role } from "../types";
import { RoleDialog } from "../RoleDialog";
import { RoleDeleteDialog } from "../RoleDeleteDialog";

interface RoleDialogsProps {
  roleToEdit: Role | null;
  roleToDelete: Role | null;
  isAddDialogOpen: boolean;
  onCloseEditDialog: () => void;
  onCloseDeleteDialog: () => void;
  onRoleSaved: () => void;
  onRoleDeleted: () => void;
}

export const RoleDialogs = ({
  roleToEdit,
  roleToDelete,
  isAddDialogOpen,
  onCloseEditDialog,
  onCloseDeleteDialog,
  onRoleSaved,
  onRoleDeleted
}: RoleDialogsProps) => {
  return (
    <>
      <RoleDialog 
        isOpen={isAddDialogOpen || !!roleToEdit}
        onClose={onCloseEditDialog}
        role={roleToEdit}
        onSave={onRoleSaved}
      />

      <RoleDeleteDialog
        role={roleToDelete}
        isOpen={!!roleToDelete}
        onClose={onCloseDeleteDialog}
        onDelete={onRoleDeleted}
      />
    </>
  );
};
