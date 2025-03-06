
import { useState, useEffect } from "react";
import { ResourceObligation } from "../types";

export const useResourceObligations = () => {
  const [obligations, setObligations] = useState<ResourceObligation[]>([]);

  // Calculate total obligations amount
  const calculateTotalObligations = (): number => {
    return obligations.reduce((total, obligation) => total + (obligation.amount || 0), 0);
  };

  // Get total obligations amount
  const totalObligationsAmount = calculateTotalObligations();

  // Add a new empty obligation
  const handleAddObligation = () => {
    setObligations([...obligations, { amount: 0, description: "" }]);
  };

  // Remove an obligation at the specified index
  const handleRemoveObligation = (index: number) => {
    const newObligations = [...obligations];
    newObligations.splice(index, 1);
    setObligations(newObligations);
  };

  // Update a field of an obligation at the specified index
  const handleObligationChange = (
    index: number,
    field: keyof ResourceObligation,
    value: any
  ) => {
    const newObligations = [...obligations];
    newObligations[index] = {
      ...newObligations[index],
      [field]: value
    };
    setObligations(newObligations);
  };

  return {
    obligations,
    setObligations,
    totalObligationsAmount,
    handleAddObligation,
    handleRemoveObligation,
    handleObligationChange
  };
};
