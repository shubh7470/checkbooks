export interface FieldPosition {
  x: number; // in mm from left
  y: number; // in mm from top
  fontSize: number; // in pt
  fontWeight?: 'normal' | 'bold';
  maxWidth?: number; // in mm (for text wrap/overflow prevention)
  letterSpacing?: number; // in mm (especially for date DD MM YYYY)
  lineHeight?: number; // in mm (for multi-line amount in words)
}

export type FeedOrientation = 'vertical' | 'horizontal';
export type FeedDirection = 'stub-first' | 'date-first';
export type TrayAlignment = 'center' | 'left' | 'right';

export interface ChequeLayout {
  id: string;
  name: string;
  bankName: string;
  isDefault?: boolean;
  isCustom?: boolean;
  // Dimensions in millimeters
  widthMm: number; // standard 203mm
  heightMm: number; // standard 93mm
  // Global offset calibration (mm)
  globalOffsetX: number;
  globalOffsetY: number;
  // Feed orientation & printer tray positioning
  feedOrientation?: FeedOrientation; // 'vertical' (93mm short edge first - anti-jam) or 'horizontal' (203mm long edge first)
  feedDirection?: FeedDirection;     // 'stub-first' (payee near top) or 'date-first'
  trayAlignment?: TrayAlignment;     // 'center', 'left', 'right'
  // Field positions (mm)
  date: FieldPosition;
  payee: FieldPosition;
  amountInWordsLine1: FieldPosition;
  amountInWordsLine2: FieldPosition;
  amountInNumbers: FieldPosition;
  acPayee: FieldPosition;
  // Optional security markers
  prefixSuffixMarkers: boolean; // e.g. ** and /-
}

export interface ChequeFormData {
  payeeName: string;
  amount: number | '';
  amountInWords: string;
  date: string; // DD/MM/YYYY
  isAcPayee: boolean;
  selectedLayoutId: string;
  selectedPrinter?: string;
}

export interface PrinterDevice {
  name: string;
  displayName: string;
  description: string;
  isDefault: boolean;
  status: number;
}

export interface AppSettings {
  selectedPrinter?: string;
  activeLayoutId: string;
  customLayouts: ChequeLayout[];
  lastUsedLayoutId: string;
  feedOrientation?: FeedOrientation;
  feedDirection?: FeedDirection;
  trayAlignment?: TrayAlignment;
}

export interface PrintOptions {
  chequeData: ChequeFormData;
  layout: ChequeLayout;
  isTestPrint: boolean; // prints border and alignment marks
  printerName?: string;
  feedOrientation?: FeedOrientation;
  feedDirection?: FeedDirection;
  trayAlignment?: TrayAlignment;
}
