
export interface IdeaExportOption {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  default?: boolean;
}

export interface IdeaExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaId: string;
  ideaTitle: string;
}

export interface ExportOptionsProps {
  selectedOptions: string[];
  handleOptionChange: (optionId: string, checked: boolean) => void;
  exportOptions: IdeaExportOption[];
}

export interface ExportFormatsProps {
  selectedFormat: string;
  handleFormatChange: (formatId: string, checked: boolean) => void;
  exportFormats: {
    id: string;
    label: string;
    description: string;
    default?: boolean;
  }[];
}
