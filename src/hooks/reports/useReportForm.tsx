import { useState } from "react";
import { useReportPhotos } from "./useReportPhotos";
import { useReportQueries } from "./useReportQueries";
import { useReportSubmit } from "./useReportSubmit";

export const useReportForm = (projectId: string, report?: any, onSuccess?: () => void) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(report?.activity_id || null);
  const [formData, setFormData] = useState({
    reportName: report?.report_name || "",
    reportText: report?.report_text || "",
    objectives: report?.activity_objectives || "",
    impact: report?.impact_on_participants || "",
  });

  const { photos, setPhotos } = useReportPhotos(report?.photos);
  const { project, activities, attendanceCount } = useReportQueries(projectId, selectedActivity);
  const { handleSubmit } = useReportSubmit(projectId, report, onSuccess);

  const selectedActivityDetails = activities.find(a => a.id === selectedActivity);

  const wrappedHandleSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e, {
      selectedActivity,
      photos,
      formData,
      project,
      attendanceCount,
      selectedActivityDetails,
    });
  };

  return {
    selectedActivity,
    setSelectedActivity,
    photos,
    setPhotos,
    formData,
    setFormData,
    project,
    activities,
    attendanceCount,
    selectedActivityDetails,
    handleSubmit: wrappedHandleSubmit,
  };
};