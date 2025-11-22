# Installation Guide - Cashbook App

This guide will help you install the Cashbook app on your iPhone and Android devices.

## Method 1: Quick Testing with Expo Go (Recommended for Development)

This is the fastest way to test the app on your devices.

### Prerequisites
- Both your computer and phone must be on the same Wi-Fi network
- Install Expo Go app on your phone:
  - **iPhone**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - **Android**: Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Steps

1. **Start the development server:**
   ```bash
   cd mobileapp
   npm start
   ```

2. **On your phone:**
   - Open the Expo Go app
   - **For iPhone**: Scan the QR code shown in the terminal with your Camera app
   - **For Android**: Scan the QR code with the Expo Go app or use the "Scan QR code" option

3. **Alternative - Using Tunnel (if same network doesn't work):**
   ```bash
   npm start -- --tunnel
   ```
   This creates a tunnel that works even if devices aren't on the same network.

---

## Method 2: Build Standalone App (For Production/Testing)

This creates a standalone app that doesn't require Expo Go.

### Prerequisites
- Install EAS CLI globally:
  ```bash
   npm install -g eas-cli
  ```

- Login to Expo account:
  ```bash
   eas login
  ```

### For Android

1. **Build the Android APK:**
   ```bash
   cd mobileapp
   eas build --platform android --profile preview
   ```

2. **Wait for build to complete** (this may take 10-20 minutes)

3. **Download and install:**
   - You'll get a download link in the terminal
   - Download the APK file on your Android phone
   - Enable "Install from unknown sources" in your phone settings
   - Open the downloaded APK file to install

### For iPhone

1. **Build the iOS app:**
   ```bash
   cd mobileapp
   eas build --platform ios --profile preview
   ```

2. **Wait for build to complete** (this may take 15-30 minutes)

3. **Install on iPhone:**
   - You'll receive an email with a link when the build is ready
   - Open the link on your iPhone
   - Install the app (you may need to trust the developer certificate in Settings > General > VPN & Device Management)

**Note**: For iOS, you'll need an Apple Developer account ($99/year) for production builds. For testing, you can use a free Apple ID with some limitations.

---

## Method 3: Local Development Build (Advanced)

### For Android

1. **Make sure Android Studio is installed**

2. **Run on connected device or emulator:**
   ```bash
   cd mobileapp
   npm run android
   ```

### For iPhone (Mac only)

1. **Make sure Xcode is installed**

2. **Install CocoaPods dependencies:**
   ```bash
   cd mobileapp/ios
   pod install
   cd ..
   ```

3. **Run on connected device or simulator:**
   ```bash
   npm run ios
   ```

---

## Troubleshooting

### Common Issues

1. **"Unable to connect to Metro bundler"**
   - Make sure your phone and computer are on the same Wi-Fi network
   - Try using `--tunnel` mode: `npm start -- --tunnel`

2. **"Network request failed"**
   - Check if your backend API URL is accessible from your phone
   - Update the baseURL in `mobileapp/lib/axios.ts` if needed
   - For physical devices, use your computer's IP address instead of `localhost`

3. **Build fails**
   - Make sure you're logged into EAS: `eas login`
   - Check that your Expo account is set up correctly
   - Review the build logs for specific errors

4. **iOS build requires Apple Developer account**
   - For testing, you can use a free Apple ID (limited to 3 apps, 7-day certificates)
   - For production, you need a paid Apple Developer account

---

## Quick Start (Recommended)

For the fastest setup, use **Method 1 (Expo Go)**:

```bash
cd mobileapp
npm start
```

Then scan the QR code with Expo Go app on your phone!

---

## Production Deployment

For production builds that can be distributed via App Store/Play Store:

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

Then submit to stores:
```bash
# Android
eas submit --platform android

# iOS
eas submit --platform ios
```

