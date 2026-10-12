import type { PrintOptions } from '../types/cheque';
import { formatChequeAmount } from './currencyFormat';
import { splitAmountInWords } from './amountToWords';

export function generateChequePrintHtml(options: PrintOptions): string {
  const { chequeData, layout, isTestPrint } = options;

  const totalOffsetX = layout.globalOffsetX || 0;
  const totalOffsetY = layout.globalOffsetY || 0;

  // Format Date: exactly 8 digits with equal 4mm spacing across all boxes
  const rawDate = (chequeData.date || '').replace(/\D/g, '').padEnd(8, ' ');
  const dateChars = rawDate.split('').slice(0, 8);

  const charPitch = layout.date.letterSpacing || 4.0; // 4mm per digit box

  // Format amount in words split into two lines
  const { line1: wordsLine1, line2: wordsLine2 } = splitAmountInWords(
    chequeData.amountInWords || ''
  );

  const formattedAmount = formatChequeAmount(
    chequeData.amount,
    layout.prefixSuffixMarkers
  );

  // Absolute coordinates in mm within the header cheque portion
  const dateX = layout.date.x + totalOffsetX;
  const dateY = layout.date.y + totalOffsetY;

  const payeeX = layout.payee.x + totalOffsetX;
  const payeeY = layout.payee.y + totalOffsetY;

  const words1X = layout.amountInWordsLine1.x + totalOffsetX;
  const words1Y = layout.amountInWordsLine1.y + totalOffsetY;

  const words2X = layout.amountInWordsLine2.x + totalOffsetX;
  const words2Y = layout.amountInWordsLine2.y + totalOffsetY;

  const amountX = layout.amountInNumbers.x + totalOffsetX;
  const amountY = layout.amountInNumbers.y + totalOffsetY;

  const acPayeeX = layout.acPayee.x + totalOffsetX;
  const acPayeeY = layout.acPayee.y + totalOffsetY;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ChequePrint Output</title>
  <style>
    /* Portrait A4 page size with Cheque located in Header Portion */
    @page {
      size: 210mm 297mm;
      margin: 0mm !important;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 210mm;
      height: 297mm;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Full Portrait A4 Page */
    .portrait-sheet {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      background: ${isTestPrint ? '#FFFFFF' : 'transparent'};
    }
    /* Header Portion: Cheque bounding area at the top of the portrait sheet */
    .cheque-header-area {
      position: absolute;
      top: 0;
      left: 0;
      width: ${layout.widthMm}mm;
      height: ${layout.heightMm}mm;
      overflow: hidden;
    }
    .field {
      position: absolute;
      white-space: nowrap;
      line-height: 1.1;
      color: #000000;
    }
    .date-char {
      display: inline-block;
      width: ${charPitch}mm;
      text-align: center;
      font-family: monospace;
    }
    .ac-payee-badge {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
      padding: 2px 8px;
      letter-spacing: 1px;
      font-weight: bold;
      transform: rotate(-30deg);
      transform-origin: center;
    }

    /* Test calibration guide for A4 Portrait Plain Paper Test */
    .test-cheque-outline {
      position: absolute;
      top: 0;
      left: 0;
      width: ${layout.widthMm}mm;
      height: ${layout.heightMm}mm;
      border: 1px dashed #64748B;
      pointer-events: none;
    }
    .test-header-info {
      position: absolute;
      top: ${layout.heightMm - 5}mm;
      left: 10mm;
      font-size: 7.5pt;
      color: #64748B;
      font-family: monospace;
    }
    .test-sheet-marker {
      position: absolute;
      top: ${layout.heightMm}mm;
      left: 0;
      right: 0;
      border-bottom: 0.5px dotted #CBD5E1;
      font-size: 7pt;
      color: #94A3B8;
      padding-left: 5mm;
      padding-top: 1mm;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="portrait-sheet">
    <!-- Header Portion: Cheque Area -->
    <div class="cheque-header-area">
      ${
        isTestPrint
          ? `
        <div class="test-cheque-outline"></div>
        <div class="test-header-info">
          CHEQUEPRINT PORTRAIT HEADER &bull; ${layout.name} (${layout.widthMm}mm &times; ${layout.heightMm}mm) &bull; Scale: 100%
        </div>
      `
          : ''
      }

      <!-- Cheque Date: 8 equal 4mm boxes without extra gap -->
      <div
        class="field"
        style="
          left: ${dateX}mm;
          top: ${dateY}mm;
          font-size: ${layout.date.fontSize}pt;
          font-weight: ${layout.date.fontWeight || 'bold'};
          display: flex;
          align-items: center;
        "
      >
        ${dateChars
          .map((char) => `<span class="date-char">${char.trim()}</span>`)
          .join('')}
      </div>

      <!-- Payee Name -->
      <div
        class="field"
        style="
          left: ${payeeX}mm;
          top: ${payeeY}mm;
          font-size: ${layout.payee.fontSize}pt;
          font-weight: ${layout.payee.fontWeight || 'bold'};
          max-width: ${layout.payee.maxWidth || 125}mm;
        "
      >
        ${chequeData.payeeName ? `** ${chequeData.payeeName} **` : ''}
      </div>

      <!-- Amount in Words: Line 1 -->
      <div
        class="field"
        style="
          left: ${words1X}mm;
          top: ${words1Y}mm;
          font-size: ${layout.amountInWordsLine1.fontSize}pt;
          font-weight: ${layout.amountInWordsLine1.fontWeight || 'normal'};
          max-width: ${layout.amountInWordsLine1.maxWidth || 110}mm;
        "
      >
        ${wordsLine1}
      </div>

      <!-- Amount in Words: Line 2 -->
      ${
        wordsLine2
          ? `
        <div
          class="field"
          style="
            left: ${words2X}mm;
            top: ${words2Y}mm;
            font-size: ${layout.amountInWordsLine2.fontSize}pt;
            font-weight: ${layout.amountInWordsLine2.fontWeight || 'normal'};
            max-width: ${layout.amountInWordsLine2.maxWidth || 135}mm;
          "
        >
          ${wordsLine2}
        </div>
      `
          : ''
      }

      <!-- Numeric Amount -->
      <div
        class="field"
        style="
          left: ${amountX}mm;
          top: ${amountY}mm;
          font-size: ${layout.amountInNumbers.fontSize}pt;
          font-weight: ${layout.amountInNumbers.fontWeight || 'bold'};
        "
      >
        ${formattedAmount}
      </div>

      <!-- A/C Payee Marking (Optional) -->
      ${
        chequeData.isAcPayee
          ? `
        <div
          class="field"
          style="
            left: ${acPayeeX}mm;
            top: ${acPayeeY}mm;
          "
        >
          <div class="ac-payee-badge" style="font-size: ${layout.acPayee.fontSize}pt;">
            A/C PAYEE ONLY
          </div>
        </div>
      `
          : ''
      }
    </div>

    ${
      isTestPrint
        ? `
      <div class="test-sheet-marker">
        &uarr; Physical Cheque Edge (Top ${layout.heightMm}mm) &bull; Feed paper top-first into printer tray
      </div>
    `
        : ''
    }
  </div>
</body>
</html>`;
}
