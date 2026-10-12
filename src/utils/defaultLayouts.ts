import type { ChequeLayout } from '../types/cheque';

export const DEFAULT_CTS_2010_LAYOUT: ChequeLayout = {
  id: 'cts-2010',
  name: 'Standard CTS-2010',
  bankName: 'Universal CTS-2010 Cheque',
  isDefault: true,
  widthMm: 203,
  heightMm: 93,
  globalOffsetX: 0,
  globalOffsetY: 0,
  date: {
    x: 148,
    y: 11.5,
    fontSize: 11,
    letterSpacing: 4.0,
    fontWeight: 'bold',
  },
  payee: {
    x: 32,
    y: 23,
    fontSize: 11,
    fontWeight: 'bold',
    maxWidth: 125,
  },
  amountInWordsLine1: {
    x: 38,
    y: 31,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 105,
  },
  amountInWordsLine2: {
    x: 16,
    y: 39,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 130,
  },
  amountInNumbers: {
    x: 147,
    y: 38.5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  acPayee: {
    x: 18,
    y: 10,
    fontSize: 9,
    fontWeight: 'bold',
  },
  prefixSuffixMarkers: true,
};

export const HDFC_LAYOUT: ChequeLayout = {
  ...DEFAULT_CTS_2010_LAYOUT,
  id: 'hdfc-bank',
  name: 'HDFC Bank',
  bankName: 'HDFC Bank Ltd.',
  isDefault: false,
  date: {
    x: 149,
    y: 12,
    fontSize: 11,
    letterSpacing: 4.0,
    fontWeight: 'bold',
  },
  payee: {
    x: 34,
    y: 23.5,
    fontSize: 11,
    fontWeight: 'bold',
    maxWidth: 125,
  },
  amountInWordsLine1: {
    x: 40,
    y: 31.5,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 105,
  },
  amountInWordsLine2: {
    x: 18,
    y: 39.5,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 130,
  },
  amountInNumbers: {
    x: 148,
    y: 39,
    fontSize: 12,
    fontWeight: 'bold',
  },
};

export const SBI_LAYOUT: ChequeLayout = {
  ...DEFAULT_CTS_2010_LAYOUT,
  id: 'sbi-bank',
  name: 'State Bank of India',
  bankName: 'State Bank of India',
  isDefault: false,
  date: {
    x: 147.5,
    y: 11,
    fontSize: 11,
    letterSpacing: 4.0,
    fontWeight: 'bold',
  },
  payee: {
    x: 30,
    y: 22.5,
    fontSize: 11,
    fontWeight: 'bold',
    maxWidth: 125,
  },
  amountInWordsLine1: {
    x: 36,
    y: 30.5,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 105,
  },
  amountInWordsLine2: {
    x: 16,
    y: 38.5,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 130,
  },
  amountInNumbers: {
    x: 146,
    y: 38,
    fontSize: 12,
    fontWeight: 'bold',
  },
};

export const ICICI_LAYOUT: ChequeLayout = {
  ...DEFAULT_CTS_2010_LAYOUT,
  id: 'icici-bank',
  name: 'ICICI Bank',
  bankName: 'ICICI Bank Ltd.',
  isDefault: false,
  date: {
    x: 148.5,
    y: 11.5,
    fontSize: 11,
    letterSpacing: 4.0,
    fontWeight: 'bold',
  },
  payee: {
    x: 33,
    y: 23,
    fontSize: 11,
    fontWeight: 'bold',
    maxWidth: 125,
  },
  amountInWordsLine1: {
    x: 39,
    y: 31,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 105,
  },
  amountInWordsLine2: {
    x: 17,
    y: 39,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 130,
  },
  amountInNumbers: {
    x: 147.5,
    y: 38.5,
    fontSize: 12,
    fontWeight: 'bold',
  },
};

export const AXIS_LAYOUT: ChequeLayout = {
  ...DEFAULT_CTS_2010_LAYOUT,
  id: 'axis-bank',
  name: 'Axis Bank',
  bankName: 'Axis Bank Ltd.',
  isDefault: false,
  date: {
    x: 148,
    y: 12,
    fontSize: 11,
    letterSpacing: 4.0,
    fontWeight: 'bold',
  },
  payee: {
    x: 32,
    y: 23,
    fontSize: 11,
    fontWeight: 'bold',
    maxWidth: 125,
  },
  amountInWordsLine1: {
    x: 38,
    y: 31,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 105,
  },
  amountInWordsLine2: {
    x: 16,
    y: 39,
    fontSize: 10,
    fontWeight: 'normal',
    maxWidth: 130,
  },
  amountInNumbers: {
    x: 147,
    y: 38.5,
    fontSize: 12,
    fontWeight: 'bold',
  },
};

export const BUILT_IN_LAYOUTS: ChequeLayout[] = [
  DEFAULT_CTS_2010_LAYOUT,
  HDFC_LAYOUT,
  SBI_LAYOUT,
  ICICI_LAYOUT,
  AXIS_LAYOUT,
];
