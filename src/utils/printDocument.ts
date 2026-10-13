import type { PrintOptions } from '../types/cheque';
import { formatChequeAmount } from './currencyFormat';
import { splitAmountInWords } from './amountToWords';

export function generateChequePrintHtml(options: PrintOptions): string {
  const { chequeData, layout, isTestPrint } = options;

  const feedOrientation = options.feedOrientation || layout.feedOrientation || 'vertical';
  const feedDirection = options.feedDirection || layout.feedDirection || 'stub-first';
  const trayAlignment = options.trayAlignment || layout.trayAlignment || 'center';

  const totalOffsetX = layout.globalOffsetX || 0;
  const totalOffsetY = layout.globalOffsetY || 0;

  // Format Date: exactly 8 digits with equal spacing across all boxes
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

  // Absolute coordinates in mm within the cheque bounding box
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

  // Sheet Dimensions (A4 standard: 210mm x 297mm)
  const sheetWidthMm = 210;

  const isVertical = feedOrientation === 'vertical';
  const slotWidthMm = isVertical ? layout.heightMm : layout.widthMm;
  const slotHeightMm = isVertical ? layout.widthMm : layout.heightMm;

  let slotLeftMm = 0;
  if (isVertical) {
    if (trayAlignment === 'center') {
      slotLeftMm = (sheetWidthMm - slotWidthMm) / 2; // (210 - 93) / 2 = 58.5mm
    } else if (trayAlignment === 'right') {
      slotLeftMm = sheetWidthMm - slotWidthMm; // 117mm
    }
  }

  const containerTransform = isVertical
    ? (feedDirection === 'stub-first'
        ? `translate(${slotLeftMm + layout.heightMm}mm, 0mm) rotate(90deg)`
        : `translate(${slotLeftMm}mm, ${layout.widthMm}mm) rotate(270deg)`)
    : 'translate(0mm, 0mm)';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ChequePrint Output</title>
  <style>
    /* A4 page size with Cheque aligned for printer tray */
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
    /* Full A4 Page */
    .print-sheet {
      position: relative;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      background: ${isTestPrint ? '#FFFFFF' : 'transparent'};
    }
    /* Cheque Bounding Area with Orientation Transform */
    .cheque-container {
      position: absolute;
      top: 0;
      left: 0;
      width: ${layout.widthMm}mm;
      height: ${layout.heightMm}mm;
      transform-origin: top left;
      transform: ${containerTransform};
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

    /* Test calibration guides */
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
      top: ${layout.heightMm - 6}mm;
      left: 8mm;
      font-size: 7pt;
      color: #64748B;
      font-family: monospace;
    }
    .test-tray-guide {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 0;
      border-left: 0.5px dashed #CBD5E1;
      pointer-events: none;
    }
    .test-feeder-banner {
      position: absolute;
      top: 1mm;
      font-size: 6.5pt;
      font-family: monospace;
      color: #047857;
      text-align: center;
      border: 0.5px solid #10B981;
      background: #ECFDF5;
      padding: 1.5px 4px;
      border-radius: 2px;
      white-space: nowrap;
    }
    .test-bottom-marker {
      position: absolute;
      font-size: 6.5pt;
      font-family: monospace;
      color: #64748B;
      border-top: 0.5px dotted #94A3B8;
      padding-top: 1mm;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="print-sheet">
    ${
      isTestPrint && feedOrientation === 'vertical'
        ? `
      <!-- Paper Tray Side Guides -->
      <div class="test-tray-guide" style="left: ${slotLeftMm}mm;"></div>
      <div class="test-tray-guide" style="left: ${slotLeftMm + slotWidthMm}mm;"></div>

      <!-- Feeder Direction Banner -->
      <div class="test-feeder-banner" style="left: ${slotLeftMm}mm; width: ${slotWidthMm}mm;">
        &uarr; INSERT THIS SHORT EDGE (${slotWidthMm}mm) FIRST &uarr;<br>
        (${feedDirection === 'stub-first' ? 'Stub / Left Edge' : 'Date / Right Edge'} &bull; ${trayAlignment.toUpperCase()} TRAY)
      </div>

      <!-- Bottom Edge Marker -->
      <div class="test-bottom-marker" style="top: ${slotHeightMm}mm; left: ${slotLeftMm}mm; width: ${slotWidthMm}mm;">
        &uarr; Physical Cheque Edge (${slotHeightMm}mm) &uarr;
      </div>
    `
        : isTestPrint && feedOrientation === 'horizontal'
        ? `
      <div class="test-bottom-marker" style="top: ${slotHeightMm}mm; left: 0; width: 210mm;">
        &uarr; Physical Cheque Edge (${slotHeightMm}mm) &bull; Insert long edge top-first &uarr;
      </div>
    `
        : ''
    }

    <!-- Transformed Cheque Area -->
    <div class="cheque-container">
      ${
        isTestPrint
          ? `
        <div class="test-cheque-outline"></div>
        <div class="test-header-info">
          CHEQUEPRINT ${feedOrientation.toUpperCase()} &bull; ${layout.name} (${layout.widthMm}mm &times; ${layout.heightMm}mm) &bull; Scale: 100%
        </div>
      `
          : ''
      }

      <!-- Cheque Date: 8 equal 4mm boxes -->
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
  </div>
</body>
</html>`;
}
