/**
 * Formats a number according to the Indian numbering system.
 * (3 digits on the right, then groups of 2 digits).
 * e.g. 12500 -> 12,500.00
 * e.g. 1050075.5 -> 10,50,075.50
 */
export function formatINR(amount: number | '' | undefined): string {
  if (amount === '' || amount === undefined || isNaN(amount as number)) {
    return '';
  }

  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const [intPart, decPart] = absNum.toFixed(2).split('.');

  // Format integer part with Indian commas
  let lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }

  const formattedInt =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = `${formattedInt}.${decPart}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Formats amount for physical cheque display, usually enclosed with ** and /-
 * e.g. "** 12,500.00 /-"
 */
export function formatChequeAmount(
  amount: number | '' | undefined,
  prefixSuffix = true
): string {
  if (amount === '' || amount === undefined || isNaN(amount as number)) {
    return '';
  }

  const inr = formatINR(amount);
  if (!inr) return '';

  return prefixSuffix ? `** ${inr} /-` : inr;
}
