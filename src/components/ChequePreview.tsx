import React, { useState } from 'react';
import { Eye, Layers, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import type { ChequeFormData, ChequeLayout } from '../types/cheque';
import { formatChequeAmount } from '../utils/currencyFormat';
import { splitAmountInWords } from '../utils/amountToWords';

interface ChequePreviewProps {
  formData: ChequeFormData;
  layout: ChequeLayout;
  onOpenSettings: () => void;
}

export const ChequePreview: React.FC<ChequePreviewProps> = ({
  formData,
  layout,
  onOpenSettings,
}) => {
  const [showGuides, setShowGuides] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);

  const totalOffsetX = layout.globalOffsetX || 0;
  const totalOffsetY = layout.globalOffsetY || 0;

  // Convert mm coordinates into percentage relative to cheque dimensions (widthMm x heightMm)
  const toPercentX = (mm: number) => ((mm + totalOffsetX) / layout.widthMm) * 100;
  const toPercentY = (mm: number) => ((mm + totalOffsetY) / layout.heightMm) * 100;

  // Format date characters
  const rawDate = (formData.date || '').replace(/\D/g, '');
  const dateChars = rawDate.padEnd(8, ' ').split('');

  // Amount in words
  const { line1: wordsLine1, line2: wordsLine2 } = splitAmountInWords(
    formData.amountInWords || ''
  );

  const formattedAmount = formatChequeAmount(
    formData.amount,
    layout.prefixSuffixMarkers
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
      {/* Header with Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Live Cheque Preview
            </h2>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {layout.widthMm}mm &times; {layout.heightMm}mm
            </span>
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
              title="Click to configure printer feed orientation & tray alignment"
            >
              <span>Feed: {(layout.feedOrientation || 'vertical') === 'vertical' ? 'Anti-Jam 93mm' : 'Horizontal'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Only the variable text below will be physically printed onto your cheque
          </p>
        </div>

        {/* Preview Control Toggles */}
        <div className="flex items-center gap-2">
          {/* Guide Watermark Toggle */}
          <button
            type="button"
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showGuides
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle faint background guides representing standard Indian cheque lines"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cheque Guides</span>
          </button>

          {/* Coordinate Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showCoordinates
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Show field X/Y coordinates in millimetres"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Coordinates</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setPreviewZoom((z) => Math.max(0.8, z - 0.1))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-medium text-slate-600 px-1">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setPreviewZoom((z) => Math.min(1.3, z + 0.1))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cheque Bounding Canvas */}
      <div className="overflow-x-auto p-2 bg-slate-100/70 rounded-xl flex items-center justify-center min-h-[300px]">
        <div
          style={{
            transform: `scale(${previewZoom})`,
            transformOrigin: 'center center',
            transition: 'transform 150ms ease-out',
          }}
          className="relative bg-white border border-slate-300 rounded-sm shadow-md overflow-hidden select-none"
        >
          {/* Physical Aspect Ratio Container: 203mm x 93mm (Aspect Ratio ~2.18 : 1) */}
          <div
            style={{
              width: '680px',
              height: '312px',
            }}
            className="relative font-sans text-slate-900"
          >
            {/* Background Faint Guides (Representing Physical Cheque Pre-printed areas) */}
            {showGuides && (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                {/* Cheque Border */}
                <div className="absolute inset-3 border border-dashed border-slate-300 rounded-xs" />

                {/* Date Boxes Guide (Top Right) */}
                <div
                  style={{
                    left: `${(148 / layout.widthMm) * 100}%`,
                    top: `${(8.5 / layout.heightMm) * 100}%`,
                  }}
                  className="absolute flex items-center"
                >
                  <span className="text-[9px] font-mono uppercase text-slate-400 mr-1.5">
                    DATE
                  </span>
                  {['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'].map((lbl, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${(4.0 / layout.widthMm) * 680}px`,
                        height: '20px',
                      }}
                      className="border border-slate-300 flex items-center justify-center text-[8px] text-slate-400 font-mono -ml-[1px]"
                    >
                      {lbl}
                    </div>
                  ))}
                </div>

                {/* PAY Guide (Line 1) */}
                <div
                  style={{
                    left: `${(14 / layout.widthMm) * 100}%`,
                    top: `${(22.5 / layout.heightMm) * 100}%`,
                  }}
                  className="absolute text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  PAY
                </div>
                <div
                  style={{
                    left: `${(25 / layout.widthMm) * 100}%`,
                    top: `${(25.5 / layout.heightMm) * 100}%`,
                    right: '18%',
                  }}
                  className="absolute border-b border-dotted border-slate-300"
                />

                {/* RUPEES Guide (Line 1 & 2) */}
                <div
                  style={{
                    left: `${(14 / layout.widthMm) * 100}%`,
                    top: `${(30.5 / layout.heightMm) * 100}%`,
                  }}
                  className="absolute text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  RUPEES
                </div>
                <div
                  style={{
                    left: `${(32 / layout.widthMm) * 100}%`,
                    top: `${(33.5 / layout.heightMm) * 100}%`,
                    right: '30%',
                  }}
                  className="absolute border-b border-dotted border-slate-300"
                />
                <div
                  style={{
                    left: `${(14 / layout.widthMm) * 100}%`,
                    top: `${(41.5 / layout.heightMm) * 100}%`,
                    right: '30%',
                  }}
                  className="absolute border-b border-dotted border-slate-300"
                />

                {/* ₹ Box Guide (Middle Right) */}
                <div
                  style={{
                    left: `${(144 / layout.widthMm) * 100}%`,
                    top: `${(35 / layout.heightMm) * 100}%`,
                    width: '130px',
                    height: '34px',
                  }}
                  className="absolute border border-slate-300 rounded-sm flex items-center px-2 bg-slate-50/50"
                >
                  <span className="text-xs font-bold text-slate-300">₹</span>
                </div>

                {/* Bottom MICR Band Guide (Simulated 16mm band at bottom) */}
                <div className="absolute bottom-2 left-8 right-8 h-6 border-t border-slate-200/80 flex items-center justify-between px-4 text-[9px] font-mono text-slate-300">
                  <span>|&bull; 123456 |&bull;</span>
                  <span>110002001 &bull;:</span>
                  <span>000123 &bull; 10</span>
                </div>

                {/* Signature Label Guide */}
                <div
                  style={{
                    right: '6%',
                    bottom: '22%',
                  }}
                  className="absolute text-[9px] text-slate-300 font-medium"
                >
                  Please sign above this line
                </div>
              </div>
            )}

            {/* PRINTED VARIABLE FIELD 1: DATE */}
            <div
              style={{
                left: `${toPercentX(layout.date.x)}%`,
                top: `${toPercentY(layout.date.y)}%`,
                fontSize: `${layout.date.fontSize}pt`,
                fontWeight: layout.date.fontWeight === 'normal' ? 400 : 700,
              }}
              className="absolute flex items-center z-10 font-mono"
            >
              {dateChars.map((char, index) => (
                <span
                  key={index}
                  style={{
                    width: `${((layout.date.letterSpacing || 4.0) / layout.widthMm) * 680}px`,
                  }}
                  className="inline-block text-center text-slate-900 font-mono"
                >
                  {char.trim()}
                </span>
              ))}

              {showCoordinates && (
                <span className="ml-2 text-[8px] bg-slate-800 text-white px-1 rounded font-mono">
                  X:{layout.date.x} Y:{layout.date.y}
                </span>
              )}
            </div>

            {/* PRINTED VARIABLE FIELD 2: PAYEE NAME */}
            <div
              style={{
                left: `${toPercentX(layout.payee.x)}%`,
                top: `${toPercentY(layout.payee.y)}%`,
                fontSize: `${layout.payee.fontSize}pt`,
                fontWeight: layout.payee.fontWeight === 'normal' ? 400 : 700,
                maxWidth: `${(layout.payee.maxWidth || 125) / layout.widthMm * 100}%`,
              }}
              className="absolute z-10 truncate text-slate-900"
            >
              {formData.payeeName ? (
                <span>
                  {layout.prefixSuffixMarkers ? `** ` : ''}
                  {formData.payeeName}
                  {layout.prefixSuffixMarkers ? ` **` : ''}
                </span>
              ) : (
                <span className="text-slate-300 italic font-normal text-xs">
                  [Payee Name]
                </span>
              )}
              {showCoordinates && (
                <span className="ml-1.5 text-[8px] bg-slate-800 text-white px-1 rounded font-mono">
                  X:{layout.payee.x} Y:{layout.payee.y}
                </span>
              )}
            </div>

            {/* PRINTED VARIABLE FIELD 3: AMOUNT IN WORDS LINE 1 */}
            <div
              style={{
                left: `${toPercentX(layout.amountInWordsLine1.x)}%`,
                top: `${toPercentY(layout.amountInWordsLine1.y)}%`,
                fontSize: `${layout.amountInWordsLine1.fontSize}pt`,
                fontWeight: layout.amountInWordsLine1.fontWeight === 'bold' ? 700 : 400,
                maxWidth: `${(layout.amountInWordsLine1.maxWidth || 105) / layout.widthMm * 100}%`,
              }}
              className="absolute z-10 truncate text-slate-900"
            >
              {wordsLine1 ? (
                <span>{wordsLine1}</span>
              ) : (
                <span className="text-slate-300 italic text-xs">
                  [Amount in Words Line 1]
                </span>
              )}
              {showCoordinates && (
                <span className="ml-1.5 text-[8px] bg-slate-800 text-white px-1 rounded font-mono">
                  X:{layout.amountInWordsLine1.x} Y:{layout.amountInWordsLine1.y}
                </span>
              )}
            </div>

            {/* PRINTED VARIABLE FIELD 4: AMOUNT IN WORDS LINE 2 */}
            {wordsLine2 && (
              <div
                style={{
                  left: `${toPercentX(layout.amountInWordsLine2.x)}%`,
                  top: `${toPercentY(layout.amountInWordsLine2.y)}%`,
                  fontSize: `${layout.amountInWordsLine2.fontSize}pt`,
                  fontWeight: layout.amountInWordsLine2.fontWeight === 'bold' ? 700 : 400,
                  maxWidth: `${(layout.amountInWordsLine2.maxWidth || 130) / layout.widthMm * 100}%`,
                }}
                className="absolute z-10 truncate text-slate-900"
              >
                <span>{wordsLine2}</span>
                {showCoordinates && (
                  <span className="ml-1.5 text-[8px] bg-slate-800 text-white px-1 rounded font-mono">
                    X:{layout.amountInWordsLine2.x} Y:{layout.amountInWordsLine2.y}
                  </span>
                )}
              </div>
            )}

            {/* PRINTED VARIABLE FIELD 5: AMOUNT IN NUMBERS */}
            <div
              style={{
                left: `${toPercentX(layout.amountInNumbers.x)}%`,
                top: `${toPercentY(layout.amountInNumbers.y)}%`,
                fontSize: `${layout.amountInNumbers.fontSize}pt`,
                fontWeight: layout.amountInNumbers.fontWeight === 'normal' ? 400 : 700,
              }}
              className="absolute z-10 text-slate-900 font-mono"
            >
              {formattedAmount ? (
                <span>{formattedAmount}</span>
              ) : (
                <span className="text-slate-300 italic font-normal text-xs">
                  [** 0.00 /-]
                </span>
              )}
              {showCoordinates && (
                <span className="ml-1.5 text-[8px] bg-slate-800 text-white px-1 rounded font-mono">
                  X:{layout.amountInNumbers.x} Y:{layout.amountInNumbers.y}
                </span>
              )}
            </div>

            {/* PRINTED VARIABLE FIELD 6: A/C PAYEE CROSSING */}
            {formData.isAcPayee && (
              <div
                style={{
                  left: `${toPercentX(layout.acPayee.x)}%`,
                  top: `${toPercentY(layout.acPayee.y)}%`,
                }}
                className="absolute z-10"
              >
                <div
                  style={{
                    fontSize: `${layout.acPayee.fontSize}pt`,
                  }}
                  className="flex flex-col items-center justify-center border-t-2 border-b-2 border-slate-900 px-2 py-0.5 text-slate-900 font-bold tracking-wider -rotate-30 origin-center bg-white/70"
                >
                  A/C PAYEE ONLY
                </div>
                {showCoordinates && (
                  <span className="block mt-1 text-[8px] bg-slate-800 text-white px-1 rounded font-mono">
                    X:{layout.acPayee.x} Y:{layout.acPayee.y}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Helper Note */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Global Calibration Offset: <strong className="font-mono text-slate-700">X: {totalOffsetX}mm, Y: {totalOffsetY}mm</strong>
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
        >
          Fine-tune field positions &rarr;
        </button>
      </div>
    </div>
  );
};
