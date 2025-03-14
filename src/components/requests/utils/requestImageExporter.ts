
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import React from 'react';
import type { ReactElement } from 'react';

/**
 * Fetch enhanced request data for export
 */
export const fetchRequestExportData = async (requestId: string): Promise<any> => {
  try {
    console.log("Fetching request data for export:", requestId);
    
    // Get enhanced data for export
    const { data, error } = await supabase
      .rpc('get_request_pdf_export_data', { p_request_id: requestId });
    
    if (error) {
      console.error("Supabase error fetching request data:", error);
      throw new Error(error.message);
    }
    
    if (!data) {
      console.error("No data returned for request:", requestId);
      throw new Error("لا توجد بيانات للطلب المطلوب");
    }
    
    console.log("Successfully retrieved request data:", data);
    
    // Record the export action (optional, only if you want to track exports)
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id;
      if (userId) {
        const { data: logData, error: logError } = await supabase.rpc('record_request_pdf_export', {
          p_request_id: requestId,
          p_exported_by: userId
        });
        
        if (logError) {
          console.warn("Failed to record export action:", logError);
        } else {
          console.log("Export action recorded:", logData);
        }
      }
    } catch (recordError) {
      // Log but don't block the export if recording fails
      console.error("Error recording export action:", recordError);
    }
    
    return data;
  } catch (error) {
    console.error("Error in fetchRequestExportData:", error);
    throw error;
  }
};

/**
 * Export request to image and save as PNG
 */
export const exportRequestToImage = async (elementId: string, requestTitle: string): Promise<boolean> => {
  console.log("Starting request export process");
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error("Element not found:", elementId);
    return false;
  }

  try {
    console.log("Setting up export configuration");
    
    // Convert to canvas with enhanced settings for RTL and Arabic text
    console.log("Converting to canvas");
    const canvas = await htmlToImage.toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
      quality: 1,
      skipAutoScale: true,
      canvasWidth: element.offsetWidth * 2,
      canvasHeight: element.offsetHeight * 2,
      style: {
        direction: 'rtl',
        transform: 'none',
        transformOrigin: 'center'
      },
      filter: (node) => {
        // Keep all elements visible
        return true;
      },
      // SVG/QR specific options
      includeQueryParams: true,
      cacheBust: true,
      imagePlaceholder: undefined,
      preferredFontFormat: "woff2"
    });

    // Convert canvas to blob
    console.log("Converting canvas to blob");
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 1.0);
    });

    // Create download URL
    console.log("Creating download URL");
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `طلب_${requestTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
    link.download = fileName;
    
    // Trigger download
    console.log("Triggering download");
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    console.log("Cleaning up");
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error during request export:", error);
    return false;
  }
};

/**
 * Main export function that combines fetching data and exporting to image
 */
export const exportRequest = async (requestId: string): Promise<void> => {
  try {
    toast.info("جاري تجهيز بيانات الطلب...");
    
    // Fetch the request data
    const data = await fetchRequestExportData(requestId);
    
    if (!data.request) {
      toast.error("تعذر العثور على بيانات الطلب");
      return;
    }
    
    // Create a temporary container for the export card
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.id = 'temp-export-container';
    document.body.appendChild(container);
    
    // Import the components dynamically to avoid JSX in TS file
    const ReactDOM = await import('react-dom');
    const ExportCard = await import('../detail/RequestExportCard');
    
    // Create the component element using React.createElement instead of JSX
    const element = React.createElement(ExportCard.RequestExportCard, {
      request: data.request,
      requestType: data.request_type,
      approvals: data.approvals || []
    });
    
    // Render the component to the DOM
    ReactDOM.render(element, container);
    
    // Wait for rendering and fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.info("جاري تصدير الطلب...");
    
    // Export the rendered component to image
    const success = await exportRequestToImage('request-export-card', data.request.title);
    
    // Clean up the temporary container
    document.body.removeChild(container);
    
    if (success) {
      toast.success("تم تصدير الطلب بنجاح");
    } else {
      toast.error("حدث خطأ أثناء تصدير الطلب");
    }
  } catch (error: any) {
    console.error("Error exporting request:", error);
    toast.error(`حدث خطأ أثناء تصدير الطلب: ${error.message || "خطأ غير معروف"}`);
  }
};
