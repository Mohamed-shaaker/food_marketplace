/**
 * Formats a decimal string or number from the backend into UGX.
 * Example: "15000.00" -> "UGX 15,000"
 */
export const formatCurrency = (amount) => {
  if (!amount) return "UGX 0";
  
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return "UGX 0";

  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
