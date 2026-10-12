import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChequeForm } from './components/ChequeForm';
import { ChequePreview } from './components/ChequePreview';
import { AlignmentSettings } from './components/AlignmentSettings';
import { PrintConfirmModal } from './components/PrintConfirmModal';
import type { ChequeFormData, ChequeLayout, PrinterDevice, AppSettings } from './types/cheque';
import { BUILT_IN_LAYOUTS, DEFAULT_CTS_2010_LAYOUT } from './utils/defaultLayouts';
import { numberToWordsIndian } from './utils/amountToWords';
import { chequeFormSchema } from './utils/validation';
import { generateChequePrintHtml } from './utils/printDocument';
import { CheckCircle2 } from 'lucide-react';

const getInitialDate = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const App: React.FC = () => {
  // Layouts State
  const [layouts, setLayouts] = useState<ChequeLayout[]>(() => {
    try {
      const saved = localStorage.getItem('chequeprint_custom_layouts');
      if (saved) {
        const custom: ChequeLayout[] = JSON.parse(saved);
        return [...BUILT_IN_LAYOUTS, ...custom];
      }
    } catch (e) {
      console.warn('Failed to parse saved custom layouts:', e);
    }
    return BUILT_IN_LAYOUTS;
  });

  // Active Layout
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('cts-2010');

  // Printers List
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string | undefined>(undefined);

  // Form State
  const [formData, setFormData] = useState<ChequeFormData>({
    payeeName: '',
    amount: '',
    amountInWords: '',
    date: getInitialDate(),
    isAcPayee: false,
    selectedLayoutId: 'cts-2010',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // UI Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isTestPrintMode, setIsTestPrintMode] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Layout Object
  const activeLayout =
    layouts.find((l) => l.id === selectedLayoutId) || DEFAULT_CTS_2010_LAYOUT;

  // Load Initial Settings & Printers from Electron IPC
  useEffect(() => {
    if (window.chequeAPI) {
      // Fetch available printers
      window.chequeAPI.getPrinters().then((devices) => {
        setPrinters(devices || []);
        const defaultDev = devices?.find((d) => d.isDefault);
        if (defaultDev) {
          setSelectedPrinter((prev) => prev || defaultDev.name);
        }
      });

      // Fetch saved settings
      window.chequeAPI.getSettings().then((settings: AppSettings | null) => {
        if (settings) {
          if (settings.selectedPrinter) {
            setSelectedPrinter(settings.selectedPrinter);
          }
          if (settings.activeLayoutId) {
            setSelectedLayoutId(settings.activeLayoutId);
            setFormData((prev) => ({ ...prev, selectedLayoutId: settings.activeLayoutId }));
          }
          if (settings.customLayouts && settings.customLayouts.length > 0) {
            setLayouts([...BUILT_IN_LAYOUTS, ...settings.customLayouts]);
          }
        }
      });
    }
  }, []);

  // Update Amount in Words automatically when Amount changes
  const handleFormChange = (fields: Partial<ChequeFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };

      // If amount changed, regenerate Indian English words
      if ('amount' in fields) {
        if (typeof updated.amount === 'number' && updated.amount > 0) {
          updated.amountInWords = numberToWordsIndian(updated.amount);
        } else {
          updated.amountInWords = '';
        }
      }

      // If layout changed
      if (fields.selectedLayoutId) {
        setSelectedLayoutId(fields.selectedLayoutId);
      }

      return updated;
    });

    // Clear error for edited field
    if (Object.keys(fields).length > 0) {
      setFormErrors((prev) => {
        const nextErrors = { ...prev };
        for (const k of Object.keys(fields)) {
          delete nextErrors[k];
        }
        return nextErrors;
      });
    }
  };

  // Clear Form Data (Privacy Feature)
  const handleClearForm = () => {
    setFormData((prev) => ({
      ...prev,
      payeeName: '',
      amount: '',
      amountInWords: '',
      isAcPayee: false,
    }));
    setFormErrors({});
    showToast('Form cleared');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Settings to Local Storage & Electron
  const saveAllSettings = (customLayouts: ChequeLayout[], printerName?: string, activeId?: string) => {
    const customOnly = customLayouts.filter((l) => l.isCustom);
    localStorage.setItem('chequeprint_custom_layouts', JSON.stringify(customOnly));

    const settingsObj: AppSettings = {
      selectedPrinter: printerName ?? selectedPrinter,
      activeLayoutId: activeId ?? selectedLayoutId,
      customLayouts: customOnly,
      lastUsedLayoutId: activeId ?? selectedLayoutId,
    };

    if (window.chequeAPI?.saveSettings) {
      window.chequeAPI.saveSettings(settingsObj);
    }
  };

  // Save / Update Layout
  const handleSaveLayout = (updatedLayout: ChequeLayout) => {
    setLayouts((prev) => {
      const index = prev.findIndex((l) => l.id === updatedLayout.id);
      let nextLayouts: ChequeLayout[];
      if (index >= 0) {
        nextLayouts = [...prev];
        nextLayouts[index] = updatedLayout;
      } else {
        nextLayouts = [...prev, updatedLayout];
      }
      saveAllSettings(nextLayouts, selectedPrinter, updatedLayout.id);
      return nextLayouts;
    });
    setSelectedLayoutId(updatedLayout.id);
    showToast(`Saved layout "${updatedLayout.name}"`);
  };

  // Delete Custom Layout
  const handleDeleteLayout = (layoutId: string) => {
    setLayouts((prev) => {
      const next = prev.filter((l) => l.id !== layoutId);
      saveAllSettings(next, selectedPrinter, 'cts-2010');
      return next;
    });
    setSelectedLayoutId('cts-2010');
    showToast('Preset deleted');
  };

  // Reset Active Layout to Factory Defaults
  const handleResetLayout = () => {
    const factory = BUILT_IN_LAYOUTS.find((l) => l.id === selectedLayoutId) || DEFAULT_CTS_2010_LAYOUT;
    handleSaveLayout(factory);
    showToast('Reset to factory default alignment');
  };

  // Printer Select
  const handleSelectPrinter = (printerName: string) => {
    setSelectedPrinter(printerName || undefined);
    saveAllSettings(layouts, printerName || undefined, selectedLayoutId);
  };

  // Validate and Trigger Print Flow
  const handleInitiatePrint = () => {
    const result = chequeFormSchema.safeParse({
      ...formData,
      amount: formData.amount === '' ? 0 : formData.amount,
      selectedLayoutId,
    });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0].toString()] = err.message;
        }
      });
      setFormErrors(formattedErrors);
      return;
    }

    setFormErrors({});
    setPrintError(undefined);
    setIsTestPrintMode(false);
    setIsConfirmModalOpen(true);
  };

  // Test Print Flow
  const handleInitiateTestPrint = () => {
    setPrintError(undefined);
    setIsTestPrintMode(true);
    setIsConfirmModalOpen(true);
  };

  // Execute Physical Print via Electron
  const handleExecutePrint = async () => {
    setIsPrinting(true);
    setPrintError(undefined);

    const html = generateChequePrintHtml({
      chequeData: formData,
      layout: activeLayout,
      isTestPrint: isTestPrintMode,
      printerName: selectedPrinter,
    });

    try {
      if (window.chequeAPI?.printCheque) {
        const response = await window.chequeAPI.printCheque({
          html,
          printerName: selectedPrinter,
          widthMm: activeLayout.widthMm,
          heightMm: activeLayout.heightMm,
        });

        if (response.success) {
          setIsConfirmModalOpen(false);
          if (!isTestPrintMode) {
            // Local Privacy: Clear sensitive values after successful print
            handleClearForm();
            showToast('Cheque printed successfully! Sensitive data cleared.');
          } else {
            showToast('Calibration sheet printed. Verify alignment against cheque.');
          }
        } else {
          setPrintError(response.error || 'Print job could not be completed.');
        }
      } else {
        // Browser fallback / demo mode
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          setIsConfirmModalOpen(false);
          showToast('Print dialog opened.');
        } else {
          setPrintError('Popup blocked by browser. Please allow popups.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected printing error occurred.';
      setPrintError(msg);
    } finally {
      setIsPrinting(false);
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Generate vector PDF and open in native OS PDF reader (macOS Preview.app)
  const handleOpenPdfPreview = async () => {
    setIsGeneratingPdf(true);
    setPrintError(undefined);

    const html = generateChequePrintHtml({
      chequeData: formData,
      layout: activeLayout,
      isTestPrint: isTestPrintMode,
      printerName: selectedPrinter,
    });

    try {
      if (window.chequeAPI?.previewPdf) {
        const res = await window.chequeAPI.previewPdf({
          html,
          widthMm: activeLayout.widthMm,
          heightMm: activeLayout.heightMm,
        });
        if (res.success) {
          showToast('Opened vector PDF preview in system viewer');
        } else {
          setPrintError(res.error || 'Failed to open PDF preview');
        }
      } else {
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(html);
          w.document.close();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating PDF preview';
      setPrintError(msg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Save cheque directly as PDF file
  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    setPrintError(undefined);

    const html = generateChequePrintHtml({
      chequeData: formData,
      layout: activeLayout,
      isTestPrint: isTestPrintMode,
      printerName: selectedPrinter,
    });

    const cleanPayee = formData.payeeName.replace(/[^a-zA-Z0-9]/g, '_') || 'Cheque';
    const defaultFileName = `Cheque_${cleanPayee}_${Date.now()}.pdf`;

    try {
      if (window.chequeAPI?.savePdf) {
        const res = await window.chequeAPI.savePdf({
          html,
          widthMm: activeLayout.widthMm,
          heightMm: activeLayout.heightMm,
          defaultFileName,
        });
        if (res.success) {
          showToast(`PDF saved to ${res.filePath}`);
        } else if (!res.canceled) {
          setPrintError(res.error || 'Failed to save PDF');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving PDF';
      setPrintError(msg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const hasFormData = Boolean(formData.payeeName || formData.amount);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeLayout={activeLayout}
        selectedPrinter={selectedPrinter}
        printers={printers}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onTestPrint={handleInitiateTestPrint}
        onClearForm={handleClearForm}
        hasFormData={hasFormData}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form (5 Cols) */}
          <section className="lg:col-span-5 space-y-6">
            <ChequeForm
              formData={formData}
              errors={formErrors}
              layouts={layouts}
              onChange={handleFormChange}
              onSubmitPrint={handleInitiatePrint}
              onTestPrint={handleInitiateTestPrint}
              isPrinting={isPrinting}
            />
          </section>

          {/* Right Column: Live Cheque Preview (7 Cols) */}
          <section className="lg:col-span-7 space-y-6">
            <ChequePreview
              formData={formData}
              layout={activeLayout}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Quick Calibration Helper Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Need to calibrate printer margins?
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Print on plain A4 paper and overlay against your physical cheque before printing real cheques.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInitiateTestPrint}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0"
              >
                Run Test Print
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Alignment Settings Modal */}
      <AlignmentSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLayout={activeLayout}
        layouts={layouts}
        formData={formData}
        selectedPrinter={selectedPrinter}
        printers={printers}
        onSaveLayout={handleSaveLayout}
        onDeleteLayout={handleDeleteLayout}
        onSelectPrinter={handleSelectPrinter}
        onResetLayout={handleResetLayout}
      />

      {/* Print Confirmation Modal */}
      <PrintConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleExecutePrint}
        onOpenPdfPreview={handleOpenPdfPreview}
        onSavePdf={handleSavePdf}
        formData={formData}
        layout={activeLayout}
        isTestPrint={isTestPrintMode}
        isPrinting={isPrinting}
        isGeneratingPdf={isGeneratingPdf}
        printError={printError}
        selectedPrinter={selectedPrinter}
        printers={printers}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
