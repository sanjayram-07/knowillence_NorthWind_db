// Northwind DB stores USD; display prices in INR for Foxin
export const USD_TO_INR = 83.5;

export const usdToInr = (usd) => {
  const amount = typeof usd === 'number' ? usd : parseFloat(usd);
  if (Number.isNaN(amount)) return 0;
  return amount * USD_TO_INR;
};
