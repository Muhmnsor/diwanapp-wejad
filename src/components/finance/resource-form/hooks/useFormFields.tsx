
import { useState } from "react";
import { BudgetItem } from "../types";

export const useFormFields = (calculateValues: (total: number, obligations: number, useDefaults: boolean) => BudgetItem[], setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>, useDefaultPercentages: boolean) => {
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [obligationsAmount, setObligationsAmount] = useState<number | "">(0);
  const [source, setSource] = useState("منصات التمويل الجماعي");

  // Handle total amount change
  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : parseFloat(e.target.value);
    setTotalAmount(value);
    
    if (typeof value === "number" && !isNaN(value)) {
      const obligations = typeof obligationsAmount === "number" ? obligationsAmount : 0;
      setBudgetItems(calculateValues(value, obligations, useDefaultPercentages));
    }
  };

  // Handle obligations amount change
  const handleObligationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setObligationsAmount(value);
    
    if (typeof totalAmount === "number") {
      setBudgetItems(calculateValues(totalAmount, value, useDefaultPercentages));
    }
  };

  // Handle source change
  const handleSourceChange = (value: string) => {
    setSource(value);
  };

  return {
    totalAmount,
    obligationsAmount,
    source,
    handleTotalAmountChange,
    handleObligationsChange,
    handleSourceChange,
  };
};
