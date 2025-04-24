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
import { deleteProject } from "./handlers/deleteProject"

interface ProjectDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
}

export const ProjectDeleteDialog = ({
  isOpen,
  onClose,
  projectId,
  projectName,
}: ProjectDeleteDialogProps) => {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(projectId)
      toast.success("تم حذف المشروع بنجاح")
      navigate("/")
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("حدث خطأ أثناء حذف المشروع")
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف المشروع</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف مشروع "{projectName}"؟
            <br />
            هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة به.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
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

