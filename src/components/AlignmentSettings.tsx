import React, { useState } from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Info,
  Check,
  Move,
  Type,
  Eye,
  Layers,
  ZoomIn,
  FileText,
  ArrowUp
} from 'lucide-react';
import type { ChequeLayout, PrinterDevice, FieldPosition, ChequeFormData } from '../types/cheque';
import { formatChequeAmount } from '../utils/currencyFormat';
import { splitAmountInWords } from '../utils/amountToWords';

interface AlignmentSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentLayout: ChequeLayout;
  layouts: ChequeLayout[];
  formData?: ChequeFormData;
  selectedPrinter?: string;
  printers: PrinterDevice[];
  onSaveLayout: (layout: ChequeLayout) => void;
  onDeleteLayout: (layoutId: string) => void;
  onSelectPrinter: (printerName: string) => void;
  onResetLayout: () => void;
}

export const AlignmentSettings: React.FC<AlignmentSettingsProps> = ({
  isOpen,
  onClose,
  currentLayout,
  formData,
  selectedPrinter,
  printers,
  onSaveLayout,
  onDeleteLayout,
  onSelectPrinter,
  onResetLayout,
}) => {
  const [activeTab, setActiveTab] = useState<'fields' | 'calibration' | 'presets'>('fields');
  const [prevLayout, setPrevLayout] = useState<ChequeLayout>(currentLayout);
  const [draftLayout, setDraftLayout] = useState<ChequeLayout>(currentLayout);
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Side-by-side Portrait Preview Controls
  const [viewMode, setViewMode] = useState<'portrait' | 'zoom'>('portrait');
  const [showGuides, setShowGuides] = useState(true);
  const [activeField, setActiveField] = useState<string | null>(null);

  // Sync draft during render when layout prop changes
  if (currentLayout !== prevLayout) {
    setPrevLayout(currentLayout);
    setDraftLayout(currentLayout);
  }

  if (!isOpen) return null;

  const updateField = (
    fieldKey: keyof ChequeLayout,
    prop: keyof FieldPosition,
    val: number
  ) => {
    const existingField = draftLayout[fieldKey] as FieldPosition;
    setDraftLayout({
      ...draftLayout,
      [fieldKey]: {
        ...existingField,
        [prop]: val,
      },
    });
  };

  const handleSave = () => {
    onSaveLayout(draftLayout);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  const handleCreateNewPreset = () => {
    if (!newPresetName.trim()) return;
    const newLayout: ChequeLayout = {
      ...draftLayout,
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      bankName: 'Custom Preset',
      isDefault: false,
      isCustom: true,
    };
    onSaveLayout(newLayout);
    setNewPresetName('');
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  // Preview Data Preparation (uses actual user input if available, otherwise sample values)
  const sampleData = {
    payeeName: formData?.payeeName?.trim() ? formData.payeeName : 'Rahul Sharma',
    amount: formData?.amount !== '' && formData?.amount !== undefined ? formData.amount : 125000,
    amountInWords: formData?.amountInWords?.trim()
      ? formData.amountInWords
      : 'Rupees One Lakh Twenty Five Thousand Only',
    date: formData?.date?.trim() ? formData.date : '12/10/2026',
    isAcPayee: formData ? formData.isAcPayee : true,
  };

  const formattedAmount = formatChequeAmount(
    sampleData.amount,
    draftLayout.prefixSuffixMarkers
  );
  const { line1: wordsLine1, line2: wordsLine2 } = splitAmountInWords(
    sampleData.amountInWords
  );

  const rawDate = (sampleData.date || '').replace(/\D/g, '').padEnd(8, ' ');
  const dateChars = rawDate.slice(0, 8).split('');
  const charPitch = draftLayout.date.letterSpacing || 4.0;

  const totalOffsetX = draftLayout.globalOffsetX || 0;
  const totalOffsetY = draftLayout.globalOffsetY || 0;

  const toPercentX = (mm: number) => ((mm + totalOffsetX) / draftLayout.widthMm) * 100;
  const toPercentY = (mm: number) => ((mm + totalOffsetY) / draftLayout.heightMm) * 100;

  const fontScale = viewMode === 'portrait' ? 0.72 : 0.88;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl xl:max-w-7xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                Alignment & Printer Settings
                <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Live Portrait Preview
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Calibrate millimeter positions for physical printer trays with instant side-by-side preview
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Split Body: Left Settings & Right Portrait Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* LEFT COLUMN: Controls & Tabs */}
          <div className="w-full lg:w-[50%] xl:w-[48%] flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
            {/* Tab Navigation */}
            <div className="px-6 border-b border-slate-200 flex gap-6 text-xs font-semibold bg-white shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('fields')}
                className={`py-3 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'fields'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Individual Field Coordinates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calibration')}
                className={`py-3 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'calibration'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Printer & Global Offset
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`py-3 border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'presets'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Manage Presets
              </button>
            </div>

            {/* Scrollable Left Tab Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* TAB 1: INDIVIDUAL FIELDS */}
              {activeTab === 'fields' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-[11px] text-emerald-900">
                    <span>
                      Hover or edit any field below to highlight its position in the live preview on the right &rarr;
                    </span>
                  </div>

                  {/* Field Editor Card Component */}
                  {[
                    { label: 'Date (DD MM YYYY)', key: 'date' as const, hasSpacing: true },
                    { label: 'Payee Name (Pay To)', key: 'payee' as const },
                    { label: 'Amount in Words (Line 1)', key: 'amountInWordsLine1' as const },
                    { label: 'Amount in Words (Line 2)', key: 'amountInWordsLine2' as const },
                    { label: 'Amount in Figures (₹ Box)', key: 'amountInNumbers' as const },
                    { label: 'A/C Payee Marking', key: 'acPayee' as const },
                  ].map(({ label, key, hasSpacing }) => {
                    const pos = draftLayout[key] as FieldPosition;
                    const isSelected = activeField === key;
                    return (
                      <div
                        key={key}
                        onMouseEnter={() => setActiveField(key)}
                        onMouseLeave={() => setActiveField(null)}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-emerald-50/40 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                            : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-semibold text-slate-800 text-xs">
                            {label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            X: {pos.x}mm &bull; Y: {pos.y}mm
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* X (mm) */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500 font-mono font-medium">X:</span>
                            <input
                              type="number"
                              step="0.5"
                              value={pos.x}
                              onFocus={() => setActiveField(key)}
                              onChange={(e) => updateField(key, 'x', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                            <span className="text-[10px] text-slate-400">mm</span>
                          </div>

                          {/* Y (mm) */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500 font-mono font-medium">Y:</span>
                            <input
                              type="number"
                              step="0.5"
                              value={pos.y}
                              onFocus={() => setActiveField(key)}
                              onChange={(e) => updateField(key, 'y', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                            <span className="text-[10px] text-slate-400">mm</span>
                          </div>

                          {/* Font Size */}
                          <div className="flex items-center gap-1">
                            <Type className="w-3 h-3 text-slate-400" />
                            <input
                              type="number"
                              step="0.5"
                              min="8"
                              max="20"
                              value={pos.fontSize}
                              onFocus={() => setActiveField(key)}
                              onChange={(e) => updateField(key, 'fontSize', parseFloat(e.target.value) || 10)}
                              className="w-14 px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                            <span className="text-[10px] text-slate-400">pt</span>
                          </div>

                          {/* Date Letter Spacing */}
                          {hasSpacing && (
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-500 font-mono font-medium">Pitch:</span>
                              <input
                                type="number"
                                step="0.1"
                                min="2"
                                max="8"
                                value={pos.letterSpacing || 4.0}
                                onFocus={() => setActiveField(key)}
                                onChange={(e) => updateField(key, 'letterSpacing', parseFloat(e.target.value) || 4.0)}
                                className="w-14 px-2 py-1 bg-white border border-slate-200 rounded text-center font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">mm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: PRINTER & GLOBAL OFFSET */}
              {activeTab === 'calibration' && (
                <div className="space-y-5">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800 leading-relaxed">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Printer Tray Feed Notice:</strong> Use <strong>Global X/Y Offsets</strong> below to shift the entire cheque layout together to match physical printer trays.
                    </div>
                  </div>

                  {/* Printer Device Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Printer Device
                    </label>
                    <select
                      value={selectedPrinter || ''}
                      onChange={(e) => onSelectPrinter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer text-xs"
                    >
                      <option value="">System Default Printer (Prompt Dialog)</option>
                      {printers.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.displayName || p.name} {p.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Global Offsets */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-emerald-600" />
                      Global Alignment Offsets (Millimetres)
                    </h4>

                    <div className="space-y-3.5">
                      {/* X Offset */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-700">
                            Horizontal Shift (X Offset):
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {draftLayout.globalOffsetX > 0 ? `+${draftLayout.globalOffsetX}` : draftLayout.globalOffsetX} mm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="0.5"
                          value={draftLayout.globalOffsetX}
                          onChange={(e) =>
                            setDraftLayout({
                              ...draftLayout,
                              globalOffsetX: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Left (-30mm)</span>
                          <span>Center (0)</span>
                          <span>Right (+30mm)</span>
                        </div>
                      </div>

                      {/* Y Offset */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-700">
                            Vertical Shift (Y Offset):
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {draftLayout.globalOffsetY > 0 ? `+${draftLayout.globalOffsetY}` : draftLayout.globalOffsetY} mm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="0.5"
                          value={draftLayout.globalOffsetY}
                          onChange={(e) =>
                            setDraftLayout({
                              ...draftLayout,
                              globalOffsetY: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Up (-30mm)</span>
                          <span>Center (0)</span>
                          <span>Down (+30mm)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cheque Dimensions */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-900">
                      Cheque Dimensions (Standard CTS-2010 is 203 &times; 93 mm)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-600 mb-1">Width (mm):</label>
                        <input
                          type="number"
                          step="1"
                          min="150"
                          max="250"
                          value={draftLayout.widthMm}
                          onChange={(e) =>
                            setDraftLayout({
                              ...draftLayout,
                              widthMm: parseFloat(e.target.value) || 203,
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Height (mm):</label>
                        <input
                          type="number"
                          step="1"
                          min="70"
                          max="120"
                          value={draftLayout.heightMm}
                          onChange={(e) =>
                            setDraftLayout({
                              ...draftLayout,
                              heightMm: parseFloat(e.target.value) || 93,
                            })
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRESETS */}
              {activeTab === 'presets' && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      Save Current Configuration As New Preset
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Canon TS5300 + HDFC Book"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewPreset}
                        disabled={!newPresetName.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-medium text-xs cursor-pointer"
                      >
                        Save Preset
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <div>
                      <h5 className="font-semibold text-slate-800">Reset Alignment</h5>
                      <p className="text-[11px] text-slate-500">
                        Restores factory default coordinates for this bank
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onResetLayout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Default
                    </button>
                  </div>

                  {draftLayout.isCustom && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                      <div>
                        <h5 className="font-semibold text-rose-700">Delete Custom Preset</h5>
                        <p className="text-[11px] text-slate-500">
                          Permanently remove "{draftLayout.name}"
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete preset "${draftLayout.name}"?`)) {
                            onDeleteLayout(draftLayout.id);
                            onClose();
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Preset
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN ("Baju me"): LIVE PORTRAIT VIEW PREVIEW */}
          <div className="w-full lg:w-[50%] xl:w-[52%] flex flex-col min-h-0 bg-slate-100/90 border-t lg:border-t-0">
            {/* Preview Toolbar */}
            <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-slate-900 text-xs">
                  Live Portrait Sheet Preview
                </h4>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  A4: 210 &times; 297 mm
                </span>
              </div>

              {/* View Mode & Guide Toggles */}
              <div className="flex items-center gap-1.5">
                {/* Mode Selector */}
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('portrait')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      viewMode === 'portrait'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="View entire Portrait A4 sheet with cheque aligned in top header"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Portrait A4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('zoom')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      viewMode === 'zoom'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Zoom in on the 203x93mm Cheque Header area"
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>Zoom Cheque</span>
                  </button>
                </div>

                {/* Guides Toggle */}
                <button
                  type="button"
                  onClick={() => setShowGuides(!showGuides)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                    showGuides
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle faint CTS-2010 cheque background guidelines"
                >
                  <Layers className="w-3 h-3" />
                  <span>Guides</span>
                </button>
              </div>
            </div>

            {/* Scrollable Preview Canvas Area */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col items-center justify-start">
              {/* Feeder Direction Notice */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-3 py-1 rounded-full mb-3 shadow-xs">
                <ArrowUp className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>INSERT THIS EDGE INTO PRINTER TRAY FIRST (Header Cheque Alignment)</span>
              </div>

              {/* MODE 1: FULL PORTRAIT A4 SHEET (Aspect Ratio 210 / 297) */}
              {viewMode === 'portrait' && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    aspectRatio: '210 / 297',
                  }}
                  className="relative bg-white border border-slate-300 rounded shadow-xl overflow-hidden select-none font-sans"
                >
                  {/* Subtle Top Feeder Alignment Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/80 z-20" />

                  {/* CHEQUE BOUNDARY AREA (Header portion of the Portrait A4 sheet) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${(draftLayout.widthMm / 210) * 100}%`,
                      height: `${(draftLayout.heightMm / 297) * 100}%`,
                    }}
                    className="relative overflow-hidden border-b border-dashed border-slate-400/80 bg-slate-50/20"
                  >
                    {/* Cheque Area Header Tag */}
                    <div className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-400 bg-white/80 px-1 rounded z-20 pointer-events-none">
                      Cheque: {draftLayout.widthMm} &times; {draftLayout.heightMm}mm
                    </div>

                    {/* Pre-printed Indian Cheque Background Guides */}
                    {showGuides && (
                      <div className="absolute inset-0 pointer-events-none opacity-35">
                        {/* Outer border guide */}
                        <div className="absolute inset-1.5 border border-dashed border-slate-300" />

                        {/* Date Boxes Guide (Top Right around 148mm, 8.5mm) */}
                        <div
                          style={{
                            left: `${(148 / draftLayout.widthMm) * 100}%`,
                            top: `${(8.5 / draftLayout.heightMm) * 100}%`,
                            width: `${((8 * 4.0) / draftLayout.widthMm) * 100}%`,
                          }}
                          className="absolute flex items-center"
                        >
                          {['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'].map((lbl, idx) => (
                            <div
                              key={idx}
                              className="flex-1 h-3.5 border border-slate-300 flex items-center justify-center text-[6px] font-mono text-slate-400 -ml-[0.5px]"
                            >
                              {lbl}
                            </div>
                          ))}
                        </div>

                        {/* PAY Guide */}
                        <div
                          style={{
                            left: `${(14 / draftLayout.widthMm) * 100}%`,
                            top: `${(21.5 / draftLayout.heightMm) * 100}%`,
                          }}
                          className="absolute text-[8px] font-bold text-slate-400 uppercase"
                        >
                          PAY
                        </div>
                        <div
                          style={{
                            left: `${(24 / draftLayout.widthMm) * 100}%`,
                            top: `${(24.5 / draftLayout.heightMm) * 100}%`,
                            right: '18%',
                          }}
                          className="absolute border-b border-dotted border-slate-300"
                        />

                        {/* RUPEES Guide */}
                        <div
                          style={{
                            left: `${(14 / draftLayout.widthMm) * 100}%`,
                            top: `${(29.5 / draftLayout.heightMm) * 100}%`,
                          }}
                          className="absolute text-[8px] font-bold text-slate-400 uppercase"
                        >
                          RUPEES
                        </div>
                        <div
                          style={{
                            left: `${(32 / draftLayout.widthMm) * 100}%`,
                            top: `${(32.5 / draftLayout.heightMm) * 100}%`,
                            right: '30%',
                          }}
                          className="absolute border-b border-dotted border-slate-300"
                        />
                        <div
                          style={{
                            left: `${(14 / draftLayout.widthMm) * 100}%`,
                            top: `${(40.5 / draftLayout.heightMm) * 100}%`,
                            right: '30%',
                          }}
                          className="absolute border-b border-dotted border-slate-300"
                        />

                        {/* ₹ Box Guide */}
                        <div
                          style={{
                            left: `${(144 / draftLayout.widthMm) * 100}%`,
                            top: `${(34 / draftLayout.heightMm) * 100}%`,
                            width: '24%',
                            height: '11%',
                          }}
                          className="absolute border border-slate-300 rounded-xs flex items-center px-1"
                        >
                          <span className="text-[8px] font-bold text-slate-300">₹</span>
                        </div>

                        {/* MICR Band Guide at bottom of cheque */}
                        <div className="absolute bottom-1 left-4 right-4 h-4 border-t border-slate-200 flex items-center justify-between text-[7px] font-mono text-slate-300">
                          <span>|&bull; 123456 |&bull;</span>
                          <span>110002001 &bull;:</span>
                          <span>000123 &bull; 10</span>
                        </div>
                      </div>
                    )}

                    {/* LIVE FIELD 1: DATE (8 equal boxes with charPitch) */}
                    <div
                      style={{
                        left: `${toPercentX(draftLayout.date.x)}%`,
                        top: `${toPercentY(draftLayout.date.y)}%`,
                        width: `${((8 * charPitch) / draftLayout.widthMm) * 100}%`,
                      }}
                      className={`absolute flex items-center z-10 transition-all ${
                        activeField === 'date'
                          ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-0.5'
                          : ''
                      }`}
                    >
                      {dateChars.map((char, index) => (
                        <div
                          key={index}
                          style={{
                            fontSize: `${draftLayout.date.fontSize * fontScale}pt`,
                            fontWeight: draftLayout.date.fontWeight === 'normal' ? 400 : 700,
                          }}
                          className="flex-1 text-center font-mono text-slate-900 leading-none select-none"
                        >
                          {char}
                        </div>
                      ))}
                      {activeField === 'date' && (
                        <span className="absolute -top-5 left-0 text-[8px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                          Date: X={draftLayout.date.x} Y={draftLayout.date.y}
                        </span>
                      )}
                    </div>

                    {/* LIVE FIELD 2: PAYEE NAME */}
                    <div
                      style={{
                        left: `${toPercentX(draftLayout.payee.x)}%`,
                        top: `${toPercentY(draftLayout.payee.y)}%`,
                        fontSize: `${draftLayout.payee.fontSize * fontScale}pt`,
                        fontWeight: draftLayout.payee.fontWeight === 'normal' ? 400 : 700,
                        maxWidth: `${((draftLayout.payee.maxWidth || 125) / draftLayout.widthMm) * 100}%`,
                      }}
                      className={`absolute z-10 truncate text-slate-900 leading-none transition-all ${
                        activeField === 'payee'
                          ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                          : ''
                      }`}
                    >
                      <span>
                        {draftLayout.prefixSuffixMarkers ? '** ' : ''}
                        {sampleData.payeeName}
                        {draftLayout.prefixSuffixMarkers ? ' **' : ''}
                      </span>
                      {activeField === 'payee' && (
                        <span className="absolute -top-5 left-0 text-[8px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                          Payee: X={draftLayout.payee.x} Y={draftLayout.payee.y}
                        </span>
                      )}
                    </div>

                    {/* LIVE FIELD 3: AMOUNT IN WORDS LINE 1 */}
                    <div
                      style={{
                        left: `${toPercentX(draftLayout.amountInWordsLine1.x)}%`,
                        top: `${toPercentY(draftLayout.amountInWordsLine1.y)}%`,
                        fontSize: `${draftLayout.amountInWordsLine1.fontSize * fontScale}pt`,
                        fontWeight: draftLayout.amountInWordsLine1.fontWeight === 'bold' ? 700 : 400,
                        maxWidth: `${((draftLayout.amountInWordsLine1.maxWidth || 105) / draftLayout.widthMm) * 100}%`,
                      }}
                      className={`absolute z-10 truncate text-slate-900 leading-none transition-all ${
                        activeField === 'amountInWordsLine1'
                          ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                          : ''
                      }`}
                    >
                      <span>{wordsLine1}</span>
                      {activeField === 'amountInWordsLine1' && (
                        <span className="absolute -top-5 left-0 text-[8px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                          Words 1: X={draftLayout.amountInWordsLine1.x} Y={draftLayout.amountInWordsLine1.y}
                        </span>
                      )}
                    </div>

                    {/* LIVE FIELD 4: AMOUNT IN WORDS LINE 2 */}
                    {wordsLine2 && (
                      <div
                        style={{
                          left: `${toPercentX(draftLayout.amountInWordsLine2.x)}%`,
                          top: `${toPercentY(draftLayout.amountInWordsLine2.y)}%`,
                          fontSize: `${draftLayout.amountInWordsLine2.fontSize * fontScale}pt`,
                          fontWeight: draftLayout.amountInWordsLine2.fontWeight === 'bold' ? 700 : 400,
                          maxWidth: `${((draftLayout.amountInWordsLine2.maxWidth || 130) / draftLayout.widthMm) * 100}%`,
                        }}
                        className={`absolute z-10 truncate text-slate-900 leading-none transition-all ${
                          activeField === 'amountInWordsLine2'
                            ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                            : ''
                        }`}
                      >
                        <span>{wordsLine2}</span>
                        {activeField === 'amountInWordsLine2' && (
                          <span className="absolute -top-5 left-0 text-[8px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                            Words 2: X={draftLayout.amountInWordsLine2.x} Y={draftLayout.amountInWordsLine2.y}
                          </span>
                        )}
                      </div>
                    )}

                    {/* LIVE FIELD 5: AMOUNT IN NUMBERS (₹ Box) */}
                    <div
                      style={{
                        left: `${toPercentX(draftLayout.amountInNumbers.x)}%`,
                        top: `${toPercentY(draftLayout.amountInNumbers.y)}%`,
                        fontSize: `${draftLayout.amountInNumbers.fontSize * fontScale}pt`,
                        fontWeight: draftLayout.amountInNumbers.fontWeight === 'normal' ? 400 : 700,
                      }}
                      className={`absolute z-10 font-mono text-slate-900 leading-none transition-all ${
                        activeField === 'amountInNumbers'
                          ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                          : ''
                      }`}
                    >
                      <span>{formattedAmount}</span>
                      {activeField === 'amountInNumbers' && (
                        <span className="absolute -top-5 left-0 text-[8px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                          ₹ Box: X={draftLayout.amountInNumbers.x} Y={draftLayout.amountInNumbers.y}
                        </span>
                      )}
                    </div>

                    {/* LIVE FIELD 6: A/C PAYEE */}
                    {sampleData.isAcPayee && (
                      <div
                        style={{
                          left: `${toPercentX(draftLayout.acPayee.x)}%`,
                          top: `${toPercentY(draftLayout.acPayee.y)}%`,
                        }}
                        className={`absolute z-10 transition-all ${
                          activeField === 'acPayee' ? 'ring-2 ring-emerald-500 rounded' : ''
                        }`}
                      >
                        <div
                          style={{
                            fontSize: `${draftLayout.acPayee.fontSize * (fontScale * 0.9)}pt`,
                          }}
                          className="flex flex-col items-center justify-center border-t border-b border-slate-900 px-1 py-0.5 text-slate-900 font-bold tracking-wider -rotate-30 origin-center bg-white/80"
                        >
                          A/C PAYEE ONLY
                        </div>
                        {activeField === 'acPayee' && (
                          <span className="absolute -top-5 left-0 text-[8px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                            A/C Payee: X={draftLayout.acPayee.x} Y={draftLayout.acPayee.y}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BOTTOM PORTION: Plain A4 Paper Area */}
                  <div
                    style={{
                      position: 'absolute',
                      top: `${(draftLayout.heightMm / 297) * 100}%`,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                    className="p-4 flex flex-col items-center justify-center text-center opacity-40 pointer-events-none"
                  >
                    <div className="w-full border-t border-dashed border-slate-300 pt-1 text-[8px] font-mono text-slate-400 mb-6">
                      &uarr; Cheque edge ({draftLayout.heightMm}mm) &bull; Remainder of A4 sheet
                    </div>
                    <span className="text-[10px] text-slate-300 uppercase tracking-widest font-mono font-medium">
                      Plain A4 Paper Feeder Area
                    </span>
                    <span className="text-[8px] text-slate-300 font-mono mt-1">
                      (210 &times; 297 mm Portrait Page)
                    </span>
                  </div>
                </div>
              )}

              {/* MODE 2: ZOOMED CHEQUE VIEW (Aspect Ratio 203 / 93) */}
              {viewMode === 'zoom' && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '560px',
                    aspectRatio: `${draftLayout.widthMm} / ${draftLayout.heightMm}`,
                  }}
                  className="relative bg-white border border-slate-300 rounded shadow-xl overflow-hidden select-none font-sans"
                >
                  {/* Outer Dashed Cheque Boundary */}
                  <div className="absolute inset-0 border border-dashed border-slate-400 pointer-events-none" />

                  {/* Background Cheque Pre-printed Guides */}
                  {showGuides && (
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                      {/* Date Guide */}
                      <div
                        style={{
                          left: `${(148 / draftLayout.widthMm) * 100}%`,
                          top: `${(8.5 / draftLayout.heightMm) * 100}%`,
                          width: `${((8 * 4.0) / draftLayout.widthMm) * 100}%`,
                        }}
                        className="absolute flex items-center"
                      >
                        {['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'].map((lbl, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-4 border border-slate-300 flex items-center justify-center text-[7px] font-mono text-slate-400 -ml-[0.5px]"
                          >
                            {lbl}
                          </div>
                        ))}
                      </div>

                      {/* PAY Guide */}
                      <div
                        style={{
                          left: `${(14 / draftLayout.widthMm) * 100}%`,
                          top: `${(21.5 / draftLayout.heightMm) * 100}%`,
                        }}
                        className="absolute text-[9px] font-bold text-slate-400 uppercase"
                      >
                        PAY
                      </div>
                      <div
                        style={{
                          left: `${(24 / draftLayout.widthMm) * 100}%`,
                          top: `${(24.5 / draftLayout.heightMm) * 100}%`,
                          right: '18%',
                        }}
                        className="absolute border-b border-dotted border-slate-300"
                      />

                      {/* RUPEES Guide */}
                      <div
                        style={{
                          left: `${(14 / draftLayout.widthMm) * 100}%`,
                          top: `${(29.5 / draftLayout.heightMm) * 100}%`,
                        }}
                        className="absolute text-[9px] font-bold text-slate-400 uppercase"
                      >
                        RUPEES
                      </div>
                      <div
                        style={{
                          left: `${(32 / draftLayout.widthMm) * 100}%`,
                          top: `${(32.5 / draftLayout.heightMm) * 100}%`,
                          right: '30%',
                        }}
                        className="absolute border-b border-dotted border-slate-300"
                      />
                      <div
                        style={{
                          left: `${(14 / draftLayout.widthMm) * 100}%`,
                          top: `${(40.5 / draftLayout.heightMm) * 100}%`,
                          right: '30%',
                        }}
                        className="absolute border-b border-dotted border-slate-300"
                      />

                      {/* ₹ Box Guide */}
                      <div
                        style={{
                          left: `${(144 / draftLayout.widthMm) * 100}%`,
                          top: `${(34 / draftLayout.heightMm) * 100}%`,
                          width: '24%',
                          height: '13%',
                        }}
                        className="absolute border border-slate-300 rounded-xs flex items-center px-1.5"
                      >
                        <span className="text-[10px] font-bold text-slate-300">₹</span>
                      </div>

                      {/* Bottom MICR strip */}
                      <div className="absolute bottom-1.5 left-6 right-6 h-4 border-t border-slate-200 flex items-center justify-between text-[8px] font-mono text-slate-300">
                        <span>|&bull; 123456 |&bull;</span>
                        <span>110002001 &bull;:</span>
                        <span>000123 &bull; 10</span>
                      </div>
                    </div>
                  )}

                  {/* LIVE FIELD 1: DATE */}
                  <div
                    style={{
                      left: `${toPercentX(draftLayout.date.x)}%`,
                      top: `${toPercentY(draftLayout.date.y)}%`,
                      width: `${((8 * charPitch) / draftLayout.widthMm) * 100}%`,
                    }}
                    className={`absolute flex items-center z-10 transition-all ${
                      activeField === 'date'
                        ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-0.5'
                        : ''
                    }`}
                  >
                    {dateChars.map((char, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: `${draftLayout.date.fontSize * fontScale}pt`,
                          fontWeight: draftLayout.date.fontWeight === 'normal' ? 400 : 700,
                        }}
                        className="flex-1 text-center font-mono text-slate-900 leading-none select-none"
                      >
                        {char}
                      </div>
                    ))}
                    {activeField === 'date' && (
                      <span className="absolute -top-5 left-0 text-[9px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                        Date: X={draftLayout.date.x} Y={draftLayout.date.y} Pitch={charPitch}mm
                      </span>
                    )}
                  </div>

                  {/* LIVE FIELD 2: PAYEE NAME */}
                  <div
                    style={{
                      left: `${toPercentX(draftLayout.payee.x)}%`,
                      top: `${toPercentY(draftLayout.payee.y)}%`,
                      fontSize: `${draftLayout.payee.fontSize * fontScale}pt`,
                      fontWeight: draftLayout.payee.fontWeight === 'normal' ? 400 : 700,
                      maxWidth: `${((draftLayout.payee.maxWidth || 125) / draftLayout.widthMm) * 100}%`,
                    }}
                    className={`absolute z-10 truncate text-slate-900 leading-none transition-all ${
                      activeField === 'payee'
                        ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                        : ''
                    }`}
                  >
                    <span>
                      {draftLayout.prefixSuffixMarkers ? '** ' : ''}
                      {sampleData.payeeName}
                      {draftLayout.prefixSuffixMarkers ? ' **' : ''}
                    </span>
                    {activeField === 'payee' && (
                      <span className="absolute -top-5 left-0 text-[9px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                        Payee: X={draftLayout.payee.x} Y={draftLayout.payee.y}
                      </span>
                    )}
                  </div>

                  {/* LIVE FIELD 3: AMOUNT IN WORDS LINE 1 */}
                  <div
                    style={{
                      left: `${toPercentX(draftLayout.amountInWordsLine1.x)}%`,
                      top: `${toPercentY(draftLayout.amountInWordsLine1.y)}%`,
                      fontSize: `${draftLayout.amountInWordsLine1.fontSize * fontScale}pt`,
                      fontWeight: draftLayout.amountInWordsLine1.fontWeight === 'bold' ? 700 : 400,
                      maxWidth: `${((draftLayout.amountInWordsLine1.maxWidth || 105) / draftLayout.widthMm) * 100}%`,
                    }}
                    className={`absolute z-10 truncate text-slate-900 leading-none transition-all ${
                      activeField === 'amountInWordsLine1'
                        ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                        : ''
                    }`}
                  >
                    <span>{wordsLine1}</span>
                    {activeField === 'amountInWordsLine1' && (
                      <span className="absolute -top-5 left-0 text-[9px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                        Words 1: X={draftLayout.amountInWordsLine1.x} Y={draftLayout.amountInWordsLine1.y}
                      </span>
                    )}
                  </div>

                  {/* LIVE FIELD 4: AMOUNT IN WORDS LINE 2 */}
                  {wordsLine2 && (
                    <div
                      style={{
                        left: `${toPercentX(draftLayout.amountInWordsLine2.x)}%`,
                        top: `${toPercentY(draftLayout.amountInWordsLine2.y)}%`,
                        fontSize: `${draftLayout.amountInWordsLine2.fontSize * fontScale}pt`,
                        fontWeight: draftLayout.amountInWordsLine2.fontWeight === 'bold' ? 700 : 400,
                        maxWidth: `${((draftLayout.amountInWordsLine2.maxWidth || 130) / draftLayout.widthMm) * 100}%`,
                      }}
                      className={`absolute z-10 truncate text-slate-900 leading-none transition-all ${
                        activeField === 'amountInWordsLine2'
                          ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                          : ''
                      }`}
                    >
                      <span>{wordsLine2}</span>
                      {activeField === 'amountInWordsLine2' && (
                        <span className="absolute -top-5 left-0 text-[9px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                          Words 2: X={draftLayout.amountInWordsLine2.x} Y={draftLayout.amountInWordsLine2.y}
                        </span>
                      )}
                    </div>
                  )}

                  {/* LIVE FIELD 5: AMOUNT IN NUMBERS */}
                  <div
                    style={{
                      left: `${toPercentX(draftLayout.amountInNumbers.x)}%`,
                      top: `${toPercentY(draftLayout.amountInNumbers.y)}%`,
                      fontSize: `${draftLayout.amountInNumbers.fontSize * fontScale}pt`,
                      fontWeight: draftLayout.amountInNumbers.fontWeight === 'normal' ? 400 : 700,
                    }}
                    className={`absolute z-10 font-mono text-slate-900 leading-none transition-all ${
                      activeField === 'amountInNumbers'
                        ? 'ring-2 ring-emerald-500 bg-emerald-500/10 rounded px-1'
                        : ''
                    }`}
                  >
                    <span>{formattedAmount}</span>
                    {activeField === 'amountInNumbers' && (
                      <span className="absolute -top-5 left-0 text-[9px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                        ₹ Box: X={draftLayout.amountInNumbers.x} Y={draftLayout.amountInNumbers.y}
                      </span>
                    )}
                  </div>

                  {/* LIVE FIELD 6: A/C PAYEE */}
                  {sampleData.isAcPayee && (
                    <div
                      style={{
                        left: `${toPercentX(draftLayout.acPayee.x)}%`,
                        top: `${toPercentY(draftLayout.acPayee.y)}%`,
                      }}
                      className={`absolute z-10 transition-all ${
                        activeField === 'acPayee' ? 'ring-2 ring-emerald-500 rounded' : ''
                      }`}
                    >
                      <div
                        style={{
                          fontSize: `${draftLayout.acPayee.fontSize * (fontScale * 0.9)}pt`,
                        }}
                        className="flex flex-col items-center justify-center border-t border-b border-slate-900 px-1 py-0.5 text-slate-900 font-bold tracking-wider -rotate-30 origin-center bg-white/80"
                      >
                        A/C PAYEE ONLY
                      </div>
                      {activeField === 'acPayee' && (
                        <span className="absolute -top-5 left-0 text-[9px] bg-emerald-700 text-white font-mono px-1 rounded shadow-xs whitespace-nowrap z-30">
                          A/C Payee: X={draftLayout.acPayee.x} Y={draftLayout.acPayee.y}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Canvas Info Summary */}
              <div className="w-full max-w-[460px] mt-3.5 flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>
                  Offset: <strong className="text-slate-700">X:{draftLayout.globalOffsetX}mm, Y:{draftLayout.globalOffsetY}mm</strong>
                </span>
                <span>
                  Cheque: <strong className="text-slate-700">{draftLayout.widthMm}&times;{draftLayout.heightMm}mm</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isSavedAlert && (
              <span className="flex items-center gap-1 text-emerald-700 font-medium text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Settings saved successfully!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
