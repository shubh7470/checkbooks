import React from 'react';
import { Printer, Sliders, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import type { ChequeLayout, PrinterDevice } from '../types/cheque';

interface HeaderProps {
  activeLayout: ChequeLayout;
  selectedPrinter?: string;
  printers: PrinterDevice[];
  onOpenSettings: () => void;
  onTestPrint: () => void;
  onClearForm: () => void;
  hasFormData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeLayout,
  selectedPrinter,
  printers,
  onOpenSettings,
  onTestPrint,
  onClearForm,
  hasFormData,
}) => {
  const currentPrinterObj = printers.find((p) => p.name === selectedPrinter);
  const printerDisplay = currentPrinterObj
    ? currentPrinterObj.displayName || currentPrinterObj.name
    : 'System Default Printer';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand and Active Preset Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                ChequePrint
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                macOS
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Indian CTS-2010 Cheque Printing
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="hidden md:flex items-center gap-2">
          {/* Layout Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Layout:</span>
            <span className="text-emerald-700 font-semibold">{activeLayout.name}</span>
          </div>

          {/* Printer Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 max-w-[220px] truncate" title={printerDisplay}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{printerDisplay}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Test Print Button */}
          <button
            type="button"
            onClick={onTestPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            title="Print test border and crosshairs on blank A4 paper to check alignment"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Plain Paper Test</span>
          </button>

          {/* Clear Form */}
          {hasFormData && (
            <button
              type="button"
              onClick={onClearForm}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
              title="Clear sensitive payee and amount inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* Settings / Alignment Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Configure Printer & Field Alignment"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Alignment & Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
