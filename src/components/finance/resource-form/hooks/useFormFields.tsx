
import { useState, useEffect } from "react";
import { BudgetItem, ResourceObligation } from "../types";

export const useFormFields = (
  calculateValues: (total: number, obligations: number, useDefaults: boolean) => BudgetItem[], 
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>, 
  useDefaultPercentages: boolean,
  totalObligationsAmount: number
) => {
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [source, setSource] = useState("منصات التمويل الجماعي");
  const [customSource, setCustomSource] = useState("");

  // Handle total amount change
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setTotalAmount(value);
    
    if (typeof value === "number" && !isNaN(value)) {
      setBudgetItems(calculateValues(value, totalObligationsAmount, useDefaultPercentages));
    }
  };

  // Effect to recalculate when totalObligationsAmount changes
  useEffect(() => {
    if (typeof totalAmount === "number") {
      setBudgetItems(calculateValues(totalAmount, totalObligationsAmount, useDefaultPercentages));
    }
  }, [totalObligationsAmount, totalAmount, useDefaultPercentages, setBudgetItems, calculateValues]);

  // Handle source change
  const handleSourceChange = (value: string) => {
    setSource(value);
  };

  // Handle custom source change
  const handleCustomSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSource(e.target.value);
  };

  return {
    totalAmount,
    source,
    customSource,
    handleTotalAmountChange,
    handleSourceChange,
    handleCustomSourceChange,
  };
};
