export interface ReportActionsProps {
  onDelete: () => void;
  onDownload: () => void;
  onEdit: () => void;
  isDeleting?: boolean;
}