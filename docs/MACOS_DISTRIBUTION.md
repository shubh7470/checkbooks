# ChequePrint — macOS Packaging & Distribution Guide

## 1. Overview
**ChequePrint** is configured to build standalone macOS `.dmg` installers for private distribution without requiring the Mac App Store.

- **Application Name**: ChequePrint
- **Bundle ID**: `in.hindustaan.chequeprint`
- **Architectures**: Apple Silicon (`arm64`, M1/M2/M3/M4) & Intel (`x64`)
- **Minimum macOS Version**: macOS 11.0 Big Sur and later

---

## 2. Generating DMG Installers

### On macOS
To package the app into a DMG on a Mac, run:

```bash
# Build universal DMG (supports both Apple Silicon & Intel)
npm run dist:mac

# Or build specifically for Apple Silicon (M1/M2/M3/M4)
npx electron-builder --mac --arm64

# Or build specifically for Intel Macs
npx electron-builder --mac --x64
```

The output DMG file will be generated in the `release/` folder:
`release/ChequePrint-0.0.0-arm64.dmg` or `release/ChequePrint-0.0.0.dmg`.

---

## 3. Installation & Uninstallation

### Installing on macOS:
1. Double-click the downloaded `ChequePrint-x.x.x.dmg` file.
2. Drag the **ChequePrint** icon into your **Applications** folder.
3. Eject the DMG disk image.
4. Launch **ChequePrint** from Launchpad or Spotlight.

### If macOS displays Gatekeeper "Unidentified Developer":
For privately distributed, unsigned/self-signed builds:
1. Right-click (or Control-click) on **ChequePrint.app** in `/Applications`.
2. Select **Open**.
3. In the security prompt, click **Open**.
*(Alternatively: Open **System Settings > Privacy & Security**, scroll down to the Security section, and click **Open Anyway**).*

### Uninstalling:
1. Quit ChequePrint (`Cmd + Q`).
2. Move `/Applications/ChequePrint.app` to Trash.
3. (Optional) To clear saved layout calibrations:
   Delete `~/Library/Application Support/cheque-print/cheque-settings.json`.

---

## 4. Code Signing & Notarization (Apple Developer ID)

*(Note: The build is currently un-signed for local development and private internal testing. To eliminate Gatekeeper warnings when sending DMGs to external users, complete the steps below).*

### Requirements:
1. An active Apple Developer Account ($99/yr).
2. A **Developer ID Application** Certificate installed in your macOS Keychain.
3. An App-Specific Password or App Store Connect API Key.

### Setting Environment Variables:
```bash
# In your ~/.zshrc or deployment CI:
export CSC_NAME="Developer ID Application: Your Name/Company (TEAM_ID)"
export APPLE_ID="developer@hindustaan.in"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAM_ID"
```

### Running Signed & Notarized Build:
```bash
npm run dist:mac
```
`electron-builder` will automatically detect these credentials, sign the binary with Hardened Runtime, submit the DMG to Apple's Notarization Service, and staple the ticket directly to the DMG.
