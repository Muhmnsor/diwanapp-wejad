
// Format number with currency
export const formatCurrency = (num: number) => {
  const formatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
  
  // Remove trailing zeros
  return formatted.replace(/\.00$/, '');
};
