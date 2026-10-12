const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  if (n < 100) {
    const ten = TENS[Math.floor(n / 10)];
    const one = ONES[n % 10];
    return one ? `${ten} ${one}` : ten;
  }
  const hundred = ONES[Math.floor(n / 100)];
  const remainder = n % 100;
  if (remainder === 0) return `${hundred} Hundred`;
  return `${hundred} Hundred ${convertBelowThousand(remainder)}`;
}

/**
 * Converts a positive number to Indian English words.
 * Uses Indian numbering: Units, Tens, Hundreds, Thousands, Lakhs, Crores.
 */
export function numberToWordsIndian(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) {
    return '';
  }

  // Round to 2 decimal places
  const rounded = Math.round(amount * 100) / 100;
  const rupeesPart = Math.floor(rounded);
  const paisePart = Math.round((rounded - rupeesPart) * 100);

  if (rupeesPart === 0 && paisePart === 0) {
    return '';
  }

  let words: string;

  if (rupeesPart > 0) {
    // Break down by Indian denominations:
    // Crores (>= 1,00,00,000)
    // Lakhs (>= 1,00,000)
    // Thousands (>= 1,000)
    // Hundreds & Below (< 1,000)
    let remaining = rupeesPart;

    const crores = Math.floor(remaining / 10000000);
    remaining %= 10000000;

    const lakhs = Math.floor(remaining / 100000);
    remaining %= 100000;

    const thousands = Math.floor(remaining / 1000);
    remaining %= 1000;

    const belowThousand = remaining;

    const parts: string[] = [];

    if (crores > 0) {
      parts.push(`${convertBelowThousand(crores)} Crore`);
    }
    if (lakhs > 0) {
      parts.push(`${convertBelowThousand(lakhs)} Lakh`);
    }
    if (thousands > 0) {
      parts.push(`${convertBelowThousand(thousands)} Thousand`);
    }
    if (belowThousand > 0) {
      parts.push(convertBelowThousand(belowThousand));
    }

    words = `Rupees ${parts.join(' ')}`;
  } else {
    words = 'Rupees Zero';
  }

  if (paisePart > 0) {
    const paiseWords = convertBelowThousand(paisePart);
    words += ` and ${paiseWords} Paise`;
  }

  words += ' Only';

  return words;
}

/**
 * Splits the amount-in-words string across two cheque lines
 * to prevent text overflow on the physical cheque line.
 * @param text The full amount in words string
 * @param maxCharsLine1 Approximate characters that fit on line 1 before wrapping
 */
export function splitAmountInWords(
  text: string,
  maxCharsLine1 = 48
): { line1: string; line2: string } {
  if (!text) return { line1: '', line2: '' };
  if (text.length <= maxCharsLine1) {
    return { line1: text, line2: '' };
  }

  // Find a clean word boundary before maxCharsLine1
  const words = text.split(' ');
  let line1 = '';
  let line2 = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = line1 ? `${line1} ${word}` : word;
    if (testLine.length <= maxCharsLine1) {
      line1 = testLine;
    } else {
      line2 = words.slice(i).join(' ');
      break;
    }
  }

  return { line1, line2 };
}
