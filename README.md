# ChequePrint — macOS Cheque Printing Desktop Application

A lightweight, secure, and private macOS desktop application designed to print directly onto pre-printed Indian bank cheque books (CTS-2010 standard).

---

## Features

- **Mac-Native UI/UX**: Clean warm-white theme, emerald green accents, SF Pro typography, and keyboard-friendly navigation.
- **Accurate Millimeter Layout**: Built specifically for CTS-2010 standard cheques (203 mm &times; 93 mm).
- **Indian Numbering to Words**: Instant automatic conversion into Indian English (Lakhs, Crores, Paise, and "Rupees ... Only") with intelligent line wrapping.
- **Bank Presets Included**:
  - Universal CTS-2010 Standard
  - HDFC Bank
  - State Bank of India (SBI)
  - ICICI Bank
  - Axis Bank
  - Custom user-created presets
- **Global & Field Calibration**:
  - Global X/Y millimeter offset sliders to match any printer feeder tray (envelope/center feed vs standard edge feed).
  - Individual field coordinate (X, Y in mm) and font size (pt) adjusters.
  - Date letter spacing / pitch adjustment for 8-box `DDMMYYYY` grids.
- **Plain Paper Calibration Test**:
  - Print an alignment outline and crosshairs on blank A4 paper. Overlay it against your real cheque in front of a light to verify coordinates before inserting actual cheques.
- **Optional A/C Payee Crossing**:
  - Top-left double parallel crossing lines with "A/C PAYEE ONLY".
- **Completely Private & Offline**:
  - No remote server, no analytics, no database, no internet requirement.
  - Automatically clears sensitive payee and monetary data after printing or via the "Clear" button.

---

## Quick Start (Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start in Development Mode**:
   ```bash
   npm run dev
   ```
   *Launches Vite on `http://localhost:5173` and boots Electron desktop window with instant hot reload.*

---

## Building & Packaging

### 🪟 Windows Installer (.exe)
Apne Windows PC par direct build karne ke liye terminal me run karein:
```bash
npm run dist:win
```
- Output file: `release/ChequePrint Setup 1.0.0.exe` (NSIS installer with desktop & start menu shortcuts)
- Standalone unpacked app: `release/win-unpacked/ChequePrint.exe`

### 🍎 macOS Installer (.dmg)
MacBook (Apple Silicon M1/M2/M3/M4 & Intel) ke liye DMG installer generate karne ke do tarike hain:

1. **Direct Mac machine par**:
   Mac terminal me run karein:
   ```bash
   npm run dist:mac
   ```
   Output file: `release/ChequePrint-1.0.0.dmg`

2. **GitHub Actions se (Bina Mac ke - Free & Automated)**:
   Project me `.github/workflows/build.yml` ready hai. Code ko GitHub par push karte hi GitHub Actions automatically Mac (`.dmg`) aur Windows (`.exe`) dono build generate karke download ke liye provide kar dega.

For code signing, notarization, and macOS distribution instructions, see [`docs/MACOS_DISTRIBUTION.md`](./docs/MACOS_DISTRIBUTION.md).

---

## Technical Stack

- **Desktop Framework**: Electron 44+
- **Frontend**: React 19, TypeScript 6, Vite 8
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Validation**: Zod 4
- **Packaging**: electron-builder 26
