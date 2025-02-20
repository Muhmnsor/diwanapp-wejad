
import { differenceInDays } from "date-fns";

export const determineStatus = (expiryDate: string) => {
  const remainingDays = differenceInDays(new Date(expiryDate), new Date());
  
  if (remainingDays < 0) {
    return "منتهي";
  } else if (remainingDays <= 30) {
    return "قريب من الانتهاء";
  } else {
    return "ساري";
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "ساري":
      return "text-green-600";
    case "قريب من الانتهاء":
      return "text-yellow-600";
    case "منتهي":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const getRemainingDays = (expiryDate: string) => {
  return differenceInDays(new Date(expiryDate), new Date());
};
