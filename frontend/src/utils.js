// Shows 499 as ₹499.00 (Indian rupee format)
export const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value));
