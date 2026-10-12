import React from 'react';
import { Calendar, User, IndianRupee, ShieldCheck, Printer, Check, Copy, AlertCircle } from 'lucide-react';
import type { ChequeFormData, ChequeLayout } from '../types/cheque';
import { formatINR } from '../utils/currencyFormat';
import { splitAmountInWords } from '../utils/amountToWords';

interface ChequeFormProps {
  formData: ChequeFormData;
  errors: Record<string, string>;
  layouts: ChequeLayout[];
  onChange: (fields: Partial<ChequeFormData>) => void;
  onSubmitPrint: () => void;
  onTestPrint: () => void;
  isPrinting: boolean;
}

export const ChequeForm: React.FC<ChequeFormProps> = ({
  formData,
  errors,
  layouts,
  onChange,
  onSubmitPrint,
  onTestPrint,
  isPrinting,
}) => {
  const [copiedWords, setCopiedWords] = React.useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange({ amount: '' });
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onChange({ amount: num });
    }
  };

  const setTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    onChange({ date: `${dd}/${mm}/${yyyy}` });
  };

  const copyWordsToClipboard = () => {
    if (formData.amountInWords) {
      navigator.clipboard.writeText(formData.amountInWords);
      setCopiedWords(true);
      setTimeout(() => setCopiedWords(false), 2000);
    }
  };

  const { line1, line2 } = splitAmountInWords(formData.amountInWords);

  // Date digits for 8-box preview
  const dateDigits = (formData.date || '').replace(/\D/g, '').padEnd(8, ' ').split('');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Cheque Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter variable details to be printed on your physical cheque
          </p>
        </div>

        {/* Layout Preset Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="layout-select" className="text-xs font-medium text-slate-600">
            Cheque Model:
          </label>
          <select
            id="layout-select"
            value={formData.selectedLayoutId}
            onChange={(e) => onChange({ selectedLayoutId: e.target.value })}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
          >
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name} {layout.isCustom ? '(Custom)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitPrint();
        }}
        className="space-y-5"
      >
        {/* Row 1: Payee Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="payee-name" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Payee Name (Pay To) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {formData.payeeName.length}/80 chars
            </span>
          </div>
          <div className="relative">
            <input
              id="payee-name"
              type="text"
              required
              maxLength={80}
              placeholder="e.g. Rahul Sharma"
              value={formData.payeeName}
              onChange={(e) => onChange({ payeeName: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.payeeName
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20 bg-slate-50/50 hover:bg-white focus:bg-white'
              }`}
            />
          </div>
          {errors.payeeName && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.payeeName}
            </p>
          )}
        </div>

        {/* Row 2: Amount in Numbers & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount in Numbers */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="amount-in-numbers" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                Amount in Figures (₹) <span className="text-rose-500">*</span>
              </label>
              {typeof formData.amount === 'number' && formData.amount > 0 && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  ₹ {formatINR(formData.amount)}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium text-sm">
                ₹
              </div>
              <input
                id="amount-in-numbers"
                type="number"
                step="0.01"
                min="0.01"
                max="999999999.99"
                required
                placeholder="12,500.00"
                value={formData.amount}
                onChange={handleAmountChange}
                className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                    : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20 bg-slate-50/50 hover:bg-white focus:bg-white'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Cheque Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="cheque-date" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Cheque Date (DD/MM/YYYY) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={setTodayDate}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                Set Today
              </button>
            </div>
            <input
              id="cheque-date"
              type="text"
              required
              maxLength={10}
              placeholder="DD/MM/YYYY"
              value={formData.date}
              onChange={(e) => {
                let v = e.target.value.replace(/[^\d/]/g, '');
                // Auto-slash formatting
                if (v.length === 2 && !v.includes('/')) v = v + '/';
                else if (v.length === 5 && v.split('/').length === 2) v = v + '/';
                onChange({ date: v });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.date
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                  : 'border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/20 bg-slate-50/50 hover:bg-white focus:bg-white'
              }`}
            />
            {errors.date && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.date}
              </p>
            )}

            {/* 8-box date preview */}
            <div className="mt-2 flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-mono mr-1">Boxes:</span>
              {dateDigits.map((digit, i) => (
                <div
                  key={i}
                  className={`w-5 h-6 rounded border flex items-center justify-center font-mono text-xs font-semibold ${
                    digit.trim()
                      ? 'bg-slate-50 border-slate-300 text-slate-800'
                      : 'border-dashed border-slate-200 text-slate-300'
                  }`}
                >
                  {digit.trim() || '-'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Amount in Words (Auto-Generated) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Amount in Words (Automatic Indian English)
            </label>
            {formData.amountInWords && (
              <button
                type="button"
                onClick={copyWordsToClipboard}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedWords ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 min-h-[48px] flex flex-col justify-center">
            {formData.amountInWords ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold w-10">
                    Line 1:
                  </span>
                  <span className="font-semibold text-slate-900">{line1}</span>
                </div>
                {line2 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold w-10">
                      Line 2:
                    </span>
                    <span className="font-semibold text-slate-900">{line2}</span>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-slate-400 italic">
                Enter an amount above to automatically generate words (e.g. Rupees Twelve Thousand Five Hundred Only)
              </span>
            )}
          </div>
        </div>

        {/* Row 4: A/C Payee Crossing Toggle */}
        <div className="pt-2">
          <label className="relative flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isAcPayee}
              onChange={(e) => onChange({ isAcPayee: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900">
                  Cross Cheque: "A/C PAYEE ONLY"
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                  Optional
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prints two parallel slanted crossing lines with "A/C PAYEE ONLY" at the top-left corner to ensure funds deposit solely into the payee's bank account.
              </p>
            </div>
            {formData.isAcPayee && (
              <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Active
              </div>
            )}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="submit"
            disabled={isPrinting}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm transition-all shadow-sm shadow-emerald-600/30 hover:shadow-md hover:shadow-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? 'Sending to Printer...' : 'Print Cheque'}</span>
          </button>

          <button
            type="button"
            onClick={onTestPrint}
            disabled={isPrinting}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            title="Print test calibration border on blank paper"
          >
            Calibration Test
          </button>
        </div>
      </form>
    </div>
  );
};
