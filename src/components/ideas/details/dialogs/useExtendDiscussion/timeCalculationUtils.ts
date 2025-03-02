
import { calculateTimeRemaining } from "../../utils/countdownUtils";

interface InitialInputValues {
  days: number;
  hours: number;
}

interface RemainingTimeData {
  days: number;
  hours: number;
}

interface TimeCalculationResult {
  totalHours: number;
  remainingTimeData: RemainingTimeData;
  initialInputValues: InitialInputValues;
}

export const calculateTimeUtils = (
  discussionPeriod: string,
  createdAt: string
): TimeCalculationResult => {
  // Calculate total hours in the current discussion period
  const totalHours = calculateTotalHours(discussionPeriod);
  
  // Calculate remaining time
  const timeRemaining = calculateTimeRemaining(discussionPeriod, createdAt);
  
  // Calculate days and hours from the remaining time
  const remainingTimeData = calculateRemainingTime(timeRemaining);
  
  // Determine initial values for input fields
  const initialInputValues = determineInitialInputValues(totalHours);
  
  return {
    totalHours,
    remainingTimeData,
    initialInputValues
  };
};

export const calculateTotalHours = (discussionPeriod: string): number => {
  let totalHours = 0;
  
  if (discussionPeriod.includes('hours') || discussionPeriod.includes('hour')) {
    const match = discussionPeriod.match(/(\d+)\s+hour/);
    if (match) {
      totalHours = parseInt(match[1]);
    }
  } else if (discussionPeriod.includes('days') || discussionPeriod.includes('day')) {
    const match = discussionPeriod.match(/(\d+)\s+day/);
    if (match) {
      totalHours = parseInt(match[1]) * 24;
    }
  } else {
    totalHours = parseFloat(discussionPeriod);
  }
  
  return totalHours;
};

export const calculateRemainingTime = (
  timeRemaining: { days: number; hours: number; minutes: number; seconds: number }
): RemainingTimeData => {
  const totalHoursRemaining = 
    (timeRemaining.days * 24) + 
    timeRemaining.hours + 
    (timeRemaining.minutes / 60) + 
    (timeRemaining.seconds / 3600);
  
  const remaining_days = Math.floor(totalHoursRemaining / 24);
  const remaining_hours = Math.floor(totalHoursRemaining % 24);
  
  return { days: remaining_days, hours: remaining_hours };
};

export const determineInitialInputValues = (totalHours: number): InitialInputValues => {
  let days = 0;
  let hours = 0;
  
  if (totalHours >= 24) {
    days = Math.floor(totalHours / 24);
    hours = totalHours % 24;
  } else {
    days = 0;
    hours = totalHours;
  }
  
  return { days, hours };
};

export const formatDiscussionPeriod = (totalHours: number): string => {
  const finalDays = Math.floor(totalHours / 24);
  const finalHours = Math.floor(totalHours % 24);
  
  const daysText = finalDays === 1 ? "day" : "days";
  const hoursText = finalHours === 1 ? "hour" : "hours";
  
  let newDiscussionPeriod = "";
  if (finalDays > 0) {
    newDiscussionPeriod += `${finalDays} ${daysText}`;
  }
  if (finalHours > 0) {
    if (newDiscussionPeriod) newDiscussionPeriod += " ";
    newDiscussionPeriod += `${finalHours} ${hoursText}`;
  }
  
  // If period is empty (special case) use default value
  if (!newDiscussionPeriod) {
    newDiscussionPeriod = "0 hours";
  }
  
  return newDiscussionPeriod;
};

export const calculateNewDiscussionPeriod = (
  days: number,
  hours: number,
  operation: string,
  totalCurrentHours: number
): string => {
  // Calculate total hours from user input
  const userInputHours = (days * 24) + hours;
  
  // Calculate new total hours based on operation type
  let newTotalHours = 0;
  
  if (operation === "add") {
    // Add hours to current total
    newTotalHours = totalCurrentHours + userInputHours;
  } else {
    // Subtract hours from current total (ensure it doesn't go below 0)
    newTotalHours = Math.max(0, totalCurrentHours - userInputHours);
  }

  console.log("Current total hours:", totalCurrentHours);
  console.log("User input hours:", userInputHours);
  console.log("Operation:", operation);
  console.log("New total hours:", newTotalHours);
  
  // Format the new discussion period
  return formatDiscussionPeriod(newTotalHours);
};
