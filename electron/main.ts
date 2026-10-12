import { app, BrowserWindow, ipcMain, shell, dialog, type WebContentsPrintOptions } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow | null = null;

function getPreloadPath(): string {
  const candidatePaths = [
    path.join(__dirname, 'preload.cjs'),
    path.join(__dirname, 'preload.js'),
    path.join(__dirname, '../dist-electron/preload.cjs'),
    path.join(__dirname, '../dist-electron/preload.js'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.join(__dirname, 'preload.cjs');
}

function getSettingsFilePath(): string {
  const userDataDir = app.getPath('userData');
  return path.join(userDataDir, 'cheque-settings.json');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 980,
    minHeight: 680,
    title: 'ChequePrint',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#F8FAFC',
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: Get available printers
ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  try {
    return await mainWindow.webContents.getPrintersAsync();
  } catch (err) {
    console.error('Failed to get printers:', err);
    return [];
  }
});

// IPC: Read local settings
ipcMain.handle('get-settings', async () => {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read settings file:', err);
  }
  return null;
});

// IPC: Save local settings
ipcMain.handle('save-settings', async (_event, settings) => {
  try {
    const filePath = getSettingsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save settings file:', err);
    return false;
  }
});

// IPC: Accurate cheque printing
ipcMain.handle('print-cheque', async (_event, { html, printerName }) => {
  return new Promise((resolve) => {
    let printWin: BrowserWindow | null = new BrowserWindow({
      show: false,
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    printWin.webContents.on('did-finish-load', () => {
      const printOptions: WebContentsPrintOptions = {
        silent: Boolean(printerName), // Silent print if a specific printer was designated
        printBackground: true,
        margins: {
          marginType: 'none',
        },
        pageSize: 'A4',
        landscape: false, // Portrait orientation with cheque in header
      };

      if (printerName) {
        printOptions.deviceName = printerName;
      }

      printWin?.webContents.print(printOptions, (success, failureReason) => {
        if (!success) {
          console.warn('Print operation failed or cancelled:', failureReason);
        }
        if (printWin) {
          printWin.close();
          printWin = null;
        }
        resolve({
          success,
          error: success ? undefined : (failureReason || 'Print cancelled or failed'),
        });
      });
    });

    printWin.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      if (printWin) {
        printWin.close();
        printWin = null;
      }
      resolve({
        success: false,
        error: `Failed to load print document: ${errorDescription} (${errorCode})`,
      });
    });

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    printWin.loadURL(dataUrl);
  });
});

// IPC: Generate exact PDF and open in OS default viewer (macOS Preview.app)
ipcMain.handle('preview-pdf', async (_event, { html }) => {
  return new Promise((resolve) => {
    let printWin: BrowserWindow | null = new BrowserWindow({
      show: false,
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    printWin.webContents.on('did-finish-load', async () => {
      try {
        const pdfBuffer = await printWin!.webContents.printToPDF({
          printBackground: true,
          margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          pageSize: 'A4',
          landscape: false, // Portrait orientation with cheque in header
        });

        const tempDir = app.getPath('temp');
        const tempFilePath = path.join(tempDir, `ChequePrint_Preview_${Date.now()}.pdf`);
        fs.writeFileSync(tempFilePath, pdfBuffer);

        // Open in native OS PDF viewer (macOS Preview.app or default viewer)
        await shell.openPath(tempFilePath);

        if (printWin) {
          printWin.close();
          printWin = null;
        }

        resolve({ success: true, filePath: tempFilePath });
      } catch (err: unknown) {
        if (printWin) {
          printWin.close();
          printWin = null;
        }
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate PDF';
        resolve({ success: false, error: errorMsg });
      }
    });

    printWin.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      if (printWin) {
        printWin.close();
        printWin = null;
      }
      resolve({
        success: false,
        error: `Failed to load document: ${errorDescription} (${errorCode})`,
      });
    });

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    printWin.loadURL(dataUrl);
  });
});

// IPC: Save cheque directly to a PDF file chosen by user
ipcMain.handle('save-pdf', async (_event, { html, defaultFileName }) => {
  if (!mainWindow) return { success: false, error: 'Main window not available' };
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Cheque as PDF',
      defaultPath: defaultFileName || 'Cheque.pdf',
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    let printWin: BrowserWindow | null = new BrowserWindow({
      show: false,
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    return new Promise((resolve) => {
      printWin!.webContents.on('did-finish-load', async () => {
        try {
          const pdfBuffer = await printWin!.webContents.printToPDF({
            printBackground: true,
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            pageSize: 'A4',
            landscape: false, // Portrait orientation with cheque in header
          });

          fs.writeFileSync(filePath, pdfBuffer);

          if (printWin) {
            printWin.close();
            printWin = null;
          }
          resolve({ success: true, filePath });
        } catch (err: unknown) {
          if (printWin) {
            printWin.close();
            printWin = null;
          }
          const errorMsg = err instanceof Error ? err.message : 'Failed to save PDF';
          resolve({ success: false, error: errorMsg });
        }
      });

      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
      printWin!.loadURL(dataUrl);
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Save dialog error';
    return { success: false, error: errorMsg };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
