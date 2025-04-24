// src/components/projects/details/ProjectDeleteDialog.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteProject } from "../deletion/deleteProject"

interface ProjectDeleteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  title: string
  onConfirm: () => Promise<void>
}

export const ProjectDeleteDialog = ({
  isOpen,
  onOpenChange,
  projectId,
  title,
  onConfirm,
}: ProjectDeleteDialogProps) => {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("حدث خطأ أثناء حذف المشروع")
    } finally {
      setIsDeleting(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف المشروع</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف مشروع "{title}"؟
            <br />
            هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة به.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "جاري الحذف..." : "حذف المشروع"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
