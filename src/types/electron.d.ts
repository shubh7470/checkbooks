import type { PrinterDevice, AppSettings } from './cheque';

declare global {
  interface Window {
    chequeAPI?: {
      platform: string;
      getPrinters: () => Promise<PrinterDevice[]>;
      printCheque: (options: {
        html: string;
        printerName?: string;
        widthMm: number;
        heightMm: number;
      }) => Promise<{ success: boolean; error?: string }>;
      previewPdf: (options: {
        html: string;
        widthMm: number;
        heightMm: number;
      }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
      savePdf: (options: {
        html: string;
        widthMm: number;
        heightMm: number;
        defaultFileName?: string;
      }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
      getSettings: () => Promise<AppSettings | null>;
      saveSettings: (settings: AppSettings) => Promise<boolean>;
    };
  }
}

export {};
