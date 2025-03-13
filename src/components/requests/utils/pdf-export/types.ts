
import { TableCell } from "pdfmake/interfaces";

export interface RequestPdfData {
  request: any;
  requestType: any;
  approvals?: any[];
  attachments?: any[];
}

export interface RequestFormData {
  [key: string]: any;
}

