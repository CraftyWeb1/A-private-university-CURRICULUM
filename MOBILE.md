# Native apps (Android Studio + Xcode)

This is still the same Dar al-Ilm website. Capacitor wraps it so you can open it as a real app.

You do **not** rewrite the university in Kotlin or Swift.

## On this Windows PC (Android)

1. Install [Android Studio](https://developer.android.com/studio).
2. In Android Studio: **More Actions → SDK Manager** — install an Android SDK (API 24 or newer) and a tablet/phone emulator if you want.
3. In this project folder:

```bash
npm install
npm run mobile:android
```

That builds the site, copies it into `android/`, and opens **Android Studio**. Press **Run** (green triangle). Pick a tablet emulator or a USB Android tablet (USB debugging on).

After you change the React app:

```bash
npm run mobile:sync
```

Then Run again in Android Studio.

## On a Mac (iPhone / iPad)

Xcode only works on macOS. Copy this folder to the Mac (or git pull), then:

```bash
npm install
npx cap add ios
npm run mobile:ios
```

Xcode opens. Pick an iPhone/iPad simulator or your device, then Run.

You need a free Apple ID to run on a physical iPhone. The paid **$99/year** Apple Developer account is only when you put it on the App Store.

## What you ship

| Where | Tool | File |
|---|---|---|
| Android tablet / phone | Android Studio | `.apk` (Build → Build Bundle(s) / APK) |
| iPhone / iPad | Xcode | install on your device, later App Store |
| Browser | `npm run dev` | same code |

Logins and notebooks stay **on that device** (same as the website).
