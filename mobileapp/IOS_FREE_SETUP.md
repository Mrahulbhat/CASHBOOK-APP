# Free iOS Development Setup Guide

## Option 1: Free Apple Developer Account (Recommended for Testing)

You can use Xcode for **FREE** with a regular Apple ID (no $99 fee needed) for development and testing.

### Limitations of Free Account:
- ✅ Can build and install on your own iPhone
- ✅ Can test on up to 3 devices
- ⚠️ Certificates expire after 7 days (need to rebuild/reinstall)
- ❌ Cannot distribute via App Store
- ❌ Cannot use TestFlight

### Steps:

1. **Install Xcode** (if not already installed):
   - Download from Mac App Store (it's free, ~12GB)
   - Open Xcode and accept the license agreement

2. **Install CocoaPods dependencies:**
   ```bash
   cd mobileapp/ios
   pod install
   cd ..
   ```

3. **Open the project in Xcode:**
   ```bash
   cd mobileapp
   open ios/servicecare.xcworkspace
   ```
   (Note: Open `.xcworkspace`, NOT `.xcodeproj`)

4. **Configure Signing:**
   - In Xcode, select the project in the left sidebar
   - Go to "Signing & Capabilities" tab
   - Check "Automatically manage signing"
   - Select your Apple ID from the "Team" dropdown
   - Xcode will create a free development certificate

5. **Connect your iPhone:**
   - Connect iPhone via USB
   - Trust the computer on your iPhone if prompted
   - In Xcode, select your iPhone from the device dropdown (top bar)

6. **Build and Run:**
   - Click the Play button (▶️) or press `Cmd + R`
   - On your iPhone: Settings → General → VPN & Device Management → Trust your developer certificate

### Note:
- The app will expire after 7 days
- You'll need to rebuild and reinstall every 7 days
- This is fine for development/testing

---

## Option 2: Expo Go (Easiest - Completely Free)

**No Xcode needed!** This is the simplest way to test on your iPhone.

1. **Install Expo Go** on your iPhone from App Store (free)

2. **Start the dev server:**
   ```bash
   cd mobileapp
   npm start
   ```

3. **Scan QR code:**
   - Open Camera app on iPhone
   - Scan the QR code shown in terminal
   - Tap the notification to open in Expo Go

**Pros:**
- ✅ No Apple Developer account needed
- ✅ No 7-day expiration
- ✅ Instant updates when you change code
- ✅ Works on any iPhone

**Cons:**
- ⚠️ Requires Expo Go app to be installed
- ⚠️ Not a standalone app

---

## Option 3: EAS Build with Free Account

You can also use EAS Build with a free Apple ID:

```bash
cd mobileapp
eas build --platform ios --profile preview
```

This will:
- Build the app in the cloud (no Xcode needed on your Mac)
- Create a downloadable .ipa file
- Use your free Apple ID for signing
- Still has 7-day expiration limit

---

## Recommendation

**For Development/Testing:**
- Use **Expo Go** (Option 2) - easiest and fastest
- Or use **Xcode with free account** (Option 1) if you want a standalone app

**For Production/App Store:**
- Need paid Apple Developer account ($99/year)

---

## Quick Start (Expo Go - Recommended)

```bash
cd mobileapp
npm start
```

Then scan QR code with your iPhone Camera app. That's it! 🎉

