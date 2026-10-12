import { contextBridge, ipcRenderer } from 'electron';

export interface PrinterDevice {
  name: string;
  displayName: string;
  description: string;
  isDefault: boolean;
  status: number;
}

export interface ElectronChequeAPI {
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
  getSettings: () => Promise<any>;
  saveSettings: (settings: any) => Promise<boolean>;
}

const chequeAPI: ElectronChequeAPI = {
  platform: process.platform,
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printCheque: (options) => ipcRenderer.invoke('print-cheque', options),
  previewPdf: (options) => ipcRenderer.invoke('preview-pdf', options),
  savePdf: (options) => ipcRenderer.invoke('save-pdf', options),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
};

contextBridge.exposeInMainWorld('chequeAPI', chequeAPI);
