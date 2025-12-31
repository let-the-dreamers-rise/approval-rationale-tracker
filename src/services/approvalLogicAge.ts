/**
 * Approval Logic Age Calculator
 * Calculates the number of months since loan approval date
 * 
 * Requirements: 3.2
 */

/**
 * Calculates the approval logic age in months (floor of months between dates)
 * 
 * @param approvalDate - The date when the loan was approved
 * @param currentDate - Optional current date for testing (defaults to now)
 * @returns Number of complete months since approval
 * 
 * Requirements: 3.2 - Display "Approval Logic Age: X months" calculated from approval date
 */
export function calculateApprovalLogicAge(approvalDate: Date, currentDate: Date = new Date()): number {
  const approvalYear = approvalDate.getFullYear();
  const approvalMonth = approvalDate.getMonth();
  const approvalDay = approvalDate.getDate();
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  
  // Calculate total months difference
  let months = (currentYear - approvalYear) * 12 + (currentMonth - approvalMonth);
  
  // If we haven't reached the same day of the month yet, subtract one month
  if (currentDay < approvalDay) {
    months -= 1;
  }
  
  // Return 0 if the result is negative (approval date is in the future)
  return Math.max(0, months);
}
