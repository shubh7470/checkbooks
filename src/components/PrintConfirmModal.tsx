import React, { useState } from 'react';
import {
  Printer,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  Eye,
  Info,
  ArrowUp
} from 'lucide-react';
import type { ChequeFormData, ChequeLayout, PrinterDevice } from '../types/cheque';
import { formatChequeAmount } from '../utils/currencyFormat';
import { splitAmountInWords } from '../utils/amountToWords';

interface PrintConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onOpenPdfPreview: () => void;
  onSavePdf: () => void;
  formData: ChequeFormData;
  layout: ChequeLayout;
  isTestPrint: boolean;
  isPrinting: boolean;
  isGeneratingPdf: boolean;
  printError?: string;
  selectedPrinter?: string;
  printers: PrinterDevice[];
}

export const PrintConfirmModal: React.FC<PrintConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onOpenPdfPreview,
  onSavePdf,
  formData,
  layout,
  isTestPrint,
  isPrinting,
  isGeneratingPdf,
  printError,
  selectedPrinter,
  printers,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview');
  const [previewMode, setPreviewMode] = useState<'sheet' | 'cheque'>('sheet');

  if (!isOpen) return null;

  const currentPrinterObj = printers.find((p) => p.name === selectedPrinter);
  const printerDisplay = currentPrinterObj
    ? currentPrinterObj.displayName || currentPrinterObj.name
    : 'System Default Printer (Dialog)';

  const formattedAmount = formatChequeAmount(formData.amount, layout.prefixSuffixMarkers);
  const { line1: wordsLine1, line2: wordsLine2 } = splitAmountInWords(formData.amountInWords);
  const rawDate = (formData.date || '').replace(/\D/g, '');
  const dateChars = rawDate.padEnd(8, ' ').split('');

  const totalOffsetX = layout.globalOffsetX || 0;
  const totalOffsetY = layout.globalOffsetY || 0;

  const toPercentX = (mm: number) => ((mm + totalOffsetX) / layout.widthMm) * 100;
  const toPercentY = (mm: number) => ((mm + totalOffsetY) / layout.heightMm) * 100;

  const isVerticalFeed = (layout.feedOrientation || 'vertical') === 'vertical';
  const feedDirection = layout.feedDirection || 'stub-first';
  const trayAlignment = layout.trayAlignment || 'center';

  const slotWidthMm = isVerticalFeed ? layout.heightMm : layout.widthMm;
  const slotHeightMm = isVerticalFeed ? layout.widthMm : layout.heightMm;

  let slotLeftMm = 0;
  if (isVerticalFeed) {
    if (trayAlignment === 'center') {
      slotLeftMm = (210 - slotWidthMm) / 2; // ~58.5mm
    } else if (trayAlignment === 'right') {
      slotLeftMm = 210 - slotWidthMm; // ~117mm
    }
  }

  const slotLeftPercent = (slotLeftMm / 210) * 100;
  const slotWidthPercent = (slotWidthMm / 210) * 100;
  const slotHeightPercent = (slotHeightMm / 297) * 100;

  // Reusable cheque fields component
  const renderFields = (scale: number = 0.8) => (
    <>
      {isTestPrint && (
        <>
          <div className="absolute inset-0 border border-dashed border-slate-400" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t border-l border-slate-300 opacity-60" />
          <div className="absolute bottom-1.5 left-2 font-mono text-[8px] text-slate-400">
            TEST CALIBRATION OUTLINE (Scale: 100%)
          </div>
        </>
      )}

      {/* DATE */}
      <div
        style={{
          left: `${toPercentX(layout.date.x)}%`,
          top: `${toPercentY(layout.date.y)}%`,
          fontSize: `${layout.date.fontSize * scale}pt`,
          fontWeight: layout.date.fontWeight === 'normal' ? 400 : 700,
        }}
        className="absolute flex items-center z-10 font-mono"
      >
        {dateChars.map((char, index) => (
          <span
            key={index}
            style={{
              width: `${((layout.date.letterSpacing || 4.0) / layout.widthMm) * 580 * (scale / 0.8)}px`,
            }}
            className="inline-block text-center text-slate-900 font-mono"
          >
            {char.trim()}
          </span>
        ))}
      </div>

      {/* PAYEE */}
      <div
        style={{
          left: `${toPercentX(layout.payee.x)}%`,
          top: `${toPercentY(layout.payee.y)}%`,
          fontSize: `${layout.payee.fontSize * scale}pt`,
          fontWeight: layout.payee.fontWeight === 'normal' ? 400 : 700,
          maxWidth: `${((layout.payee.maxWidth || 125) / layout.widthMm) * 100}%`,
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
          <span className="text-slate-300 italic text-[10px]">[Payee Name]</span>
        )}
      </div>

      {/* WORDS LINE 1 */}
      <div
        style={{
          left: `${toPercentX(layout.amountInWordsLine1.x)}%`,
          top: `${toPercentY(layout.amountInWordsLine1.y)}%`,
          fontSize: `${layout.amountInWordsLine1.fontSize * scale}pt`,
          fontWeight: layout.amountInWordsLine1.fontWeight === 'bold' ? 700 : 400,
          maxWidth: `${((layout.amountInWordsLine1.maxWidth || 105) / layout.widthMm) * 100}%`,
        }}
        className="absolute z-10 truncate text-slate-900"
      >
        {wordsLine1 || <span className="text-slate-300 italic text-[10px]">[Amount in Words]</span>}
      </div>

      {/* WORDS LINE 2 */}
      {wordsLine2 && (
        <div
          style={{
            left: `${toPercentX(layout.amountInWordsLine2.x)}%`,
            top: `${toPercentY(layout.amountInWordsLine2.y)}%`,
            fontSize: `${layout.amountInWordsLine2.fontSize * scale}pt`,
            fontWeight: layout.amountInWordsLine2.fontWeight === 'bold' ? 700 : 400,
            maxWidth: `${((layout.amountInWordsLine2.maxWidth || 130) / layout.widthMm) * 100}%`,
          }}
          className="absolute z-10 truncate text-slate-900"
        >
          {wordsLine2}
        </div>
      )}

      {/* AMOUNT IN NUMBERS */}
      <div
        style={{
          left: `${toPercentX(layout.amountInNumbers.x)}%`,
          top: `${toPercentY(layout.amountInNumbers.y)}%`,
          fontSize: `${layout.amountInNumbers.fontSize * scale}pt`,
          fontWeight: layout.amountInNumbers.fontWeight === 'normal' ? 400 : 700,
        }}
        className="absolute z-10 text-slate-900 font-mono font-bold"
      >
        {formattedAmount || <span className="text-slate-300 italic text-[10px]">[** 0.00 /-]</span>}
      </div>

      {/* A/C PAYEE */}
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
              fontSize: `${layout.acPayee.fontSize * (scale * 0.9)}pt`,
            }}
            className="border-t-2 border-b-2 border-slate-900 px-1 py-0.5 text-slate-900 font-bold tracking-wider -rotate-30 origin-center bg-white/70"
          >
            A/C PAYEE ONLY
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              isTestPrint ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                {isTestPrint ? 'Plain Paper Calibration Test' : 'Print Cheque & Visual Preview'}
              </h3>
              <p className="text-xs text-slate-500">
                Review the exact physical print layout before sending to the printer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPrinting || isGeneratingPdf}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-200 flex items-center justify-between bg-white text-xs">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`py-2.5 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Exact Sheet Preview (100% Scale)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-2.5 border-b-2 font-semibold transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Summary & Checklist
            </button>
          </div>

          {/* Quick PDF Actions */}
          <div className="flex items-center gap-2 py-1">
            <button
              type="button"
              onClick={onOpenPdfPreview}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title="Open full vector PDF in system PDF reader"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isGeneratingPdf ? 'Opening PDF...' : 'Open PDF Preview'}</span>
            </button>
            <button
              type="button"
              onClick={onSavePdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title="Save exact cheque layout to a PDF file on your computer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Save PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Error Notice */}
          {printError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Printing Error:</strong> {printError}
              </div>
            </div>
          )}

          {/* TAB 1: EXACT SHEET PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Important Explanatory Banner */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5 text-[11px] leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Feed Orientation: {isVerticalFeed ? 'Anti-Jam Rotated Feed (93mm)' : 'Horizontal Feed (203mm)'}</strong>
                  <p className="mt-0.5 text-blue-800">
                    {isVerticalFeed
                      ? 'The cheque is fed short-edge (~93mm) first into your printer tray. The print is rotated 90° so it feeds along the 203mm length continuously, preventing paper jams.'
                      : 'The cheque is fed with its 203mm long edge entering the top header portion of the paper tray.'}
                  </p>
                </div>
              </div>

              {/* View Switcher & Physical Specs */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>
                  Size: <strong>{layout.widthMm}&times;{layout.heightMm}mm</strong> &bull; Alignment: <strong>{trayAlignment.toUpperCase()}</strong>
                </span>

                <div className="flex bg-slate-200/80 rounded-lg p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('sheet')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      previewMode === 'sheet'
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tray Sheet View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('cheque')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      previewMode === 'cheque'
                        ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cheque Close-Up
                  </button>
                </div>
              </div>

              {/* Physical Sheet Canvas Preview */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-col items-center justify-center">
                {/* Feeder Direction Notice */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3 shadow-xs">
                  <ArrowUp className="w-3 h-3 text-emerald-600" />
                  <span>
                    {isVerticalFeed
                      ? `FEED SHORT EDGE (${slotWidthMm}mm) FIRST (${feedDirection === 'stub-first' ? 'Stub Edge' : 'Date Edge'})`
                      : `FEED LONG EDGE (${slotWidthMm}mm) FIRST`}
                  </span>
                </div>

                {previewMode === 'sheet' ? (
                  /* MODE A: A4 TRAY SHEET PREVIEW */
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '340px',
                      aspectRatio: '210 / 297',
                    }}
                    className="relative bg-white border border-slate-300 rounded shadow-md overflow-hidden select-none font-sans"
                  >
                    {/* Tray Guide Lines */}
                    {isVerticalFeed && (
                      <>
                        <div
                          style={{ left: `${slotLeftPercent}%` }}
                          className="absolute top-0 bottom-0 w-0 border-l border-dashed border-emerald-400/80 z-20 pointer-events-none"
                        />
                        <div
                          style={{ left: `${slotLeftPercent + slotWidthPercent}%` }}
                          className="absolute top-0 bottom-0 w-0 border-l border-dashed border-emerald-400/80 z-20 pointer-events-none"
                        />
                      </>
                    )}

                    {/* Leading Edge Bar */}
                    <div
                      style={{
                        left: `${slotLeftPercent}%`,
                        width: `${slotWidthPercent}%`,
                      }}
                      className="absolute top-0 h-1 bg-emerald-500 z-30"
                    />

                    {/* CHEQUE BOUNDARY ON TRAY SHEET */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: `${slotLeftPercent}%`,
                        width: `${slotWidthPercent}%`,
                        height: `${slotHeightPercent}%`,
                      }}
                      className="relative overflow-hidden border border-dashed border-emerald-500/80 bg-slate-50/20"
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: isVerticalFeed ? `${(slotHeightMm / slotWidthMm) * 100}%` : '100%',
                          height: isVerticalFeed ? `${(slotWidthMm / slotHeightMm) * 100}%` : '100%',
                          transformOrigin: '0 0',
                          transform: isVerticalFeed
                            ? (feedDirection === 'stub-first'
                                ? 'translate(100%, 0) rotate(90deg)'
                                : 'translate(0, 100%) rotate(270deg)')
                            : 'none',
                        }}
                        className="relative overflow-hidden font-sans text-slate-900"
                      >
                        {renderFields(0.6)}
                      </div>
                    </div>

                    {/* Bottom Remainder */}
                    <div
                      style={{
                        position: 'absolute',
                        top: `${slotHeightPercent}%`,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                      className="p-3 flex flex-col items-center justify-center text-center opacity-30 pointer-events-none"
                    >
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">
                        Plain A4 Feeder Sheet Area
                      </span>
                    </div>
                  </div>
                ) : (
                  /* MODE B: UNROTATED CHEQUE CLOSE-UP */
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      aspectRatio: `${layout.widthMm} / ${layout.heightMm}`,
                    }}
                    className="relative bg-white border border-slate-300 rounded shadow-md overflow-hidden select-none font-sans"
                  >
                    {renderFields(0.8)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS & CHECKLIST */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Payee Name:</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {formData.payeeName || '(Not specified)'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Amount in Figures:</span>
                  <span className="font-bold text-emerald-800 text-sm font-mono">
                    {formattedAmount || '₹ 0.00'}
                  </span>
                </div>

                <div className="pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium block mb-0.5">Amount in Words:</span>
                  <span className="font-medium text-slate-800 italic block">
                    "{formData.amountInWords || 'Rupees Zero Only'}"
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Cheque Date:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {formData.date}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Feed Mode:</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {isVerticalFeed ? 'Anti-Jam Rotated Feed (93mm Short Edge)' : 'Horizontal Feed (203mm)'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-slate-500 font-medium">Target Printer:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[240px]" title={printerDisplay}>
                    {printerDisplay}
                  </span>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-900 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Pre-Print Feed Checklist:
                </div>
                {isVerticalFeed ? (
                  <>
                    <p>&bull; <strong>Anti-Jam Feed:</strong> Insert cheque short-edge (~93mm) first into your printer tray.</p>
                    <p>&bull; <strong>Tray Guides:</strong> Squeeze the side guides snugly against the 93mm edges (centered).</p>
                    <p>&bull; <strong>Leading Edge:</strong> Feed with <strong>{feedDirection === 'stub-first' ? 'Stub / Left edge' : 'Date / Right edge'}</strong> entering the printer first.</p>
                  </>
                ) : (
                  <p>&bull; Insert cheque with long edge (~203mm) entering the printer tray first.</p>
                )}
                <p>&bull; <strong>Validity:</strong> Verify cheque date is within 3 months validity.</p>
                <p>&bull; <strong>Ink:</strong> Ensure the printer has plain black ink and is powered on.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[200px]" title={printerDisplay}>
              {printerDisplay}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPrinting || isGeneratingPdf}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPrinting || isGeneratingPdf}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white shadow-xs cursor-pointer transition-colors ${
                isTestPrint
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>
                {isPrinting
                  ? 'Sending to Printer...'
                  : isTestPrint
                  ? 'Print Calibration Sheet'
                  : 'Send to Printer'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
