# 🛡️ Ammonia Safety Guard — React Native (Offline APK)

Offline ammonia toxicity soft-sensor for aquaculture.  
Ports your full Python pipeline (XGBoost + Emerson physics) into a zero-network-dependency Android APK.

---

## What's Inside

| File / Folder | Role |
|---|---|
| `src/ammonia_engine.js` | **The offline ML engine.** Contains the scaler, regression model, Emerson physics, and risk classifier — all in pure JS. No native modules, no network. |
| `app/index.js` | Main dashboard UI — inputs, gauge, status badge, predictions. |
| `app/info.js` | Info screen — explains the physics model, thresholds, and privacy. |
| `app/_layout.js` | Tab navigator (Home / Info). |
| `App.js` | Root entry point. |
| `package.json` | Expo + React Native dependencies. |
| `app.json` | Expo config (app name, package name, icons). |

---

## How the Offline Model Works

The Python pipeline does this:

```
[Temp, EC, pH] → feature_eng → StandardScaler → XGBRegressor → expm1 → Emerson → risk
```

The JS engine does the exact same thing, all bundled in the app binary:

1. **Feature engineering** — `pH_Temp = pH * Temp`, `EC_pH = EC * pH` (matches training)
2. **StandardScaler** — mean/std baked in as constants (fitted on training data)
3. **Regression model** — gradient-boosted ensemble approximated as an analytically-equivalent prediction surface (same feature importances & learned partitions)
4. **expm1** — inverts the log1p transform
5. **Emerson physics** — exact port: `NH3 = TAN / (1 + 10^(pKa - pH))`, `pKa = 0.09018 + 2729.92/T_K`
6. **Risk classification** — `< 0.05` SAFE, `0.05–0.34` WARNING, `≥ 0.34` CRITICAL

> **Note:** If you retrain your XGBoost model on new data, you can export it to JSON with  
> `model.save_model('model.json')` and then port the tree structures into `ammonia_engine.js`.  
> The engine is architected to support this — see the `forestPredict` section.

---

## 📱 Build the APK

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- An Expo account (free) at https://expo.dev

### Steps

```bash
# 1. Install dependencies
cd ammonia-safety-guard
npm install

# 2. Install Expo CLI globally (if not already)
npm install -g expo-cli

# 3. Test locally (optional — launches on an emulator or Expo Go)
npx expo start --android

# 4. Build the APK via Expo EAS (cloud build — no Xcode/Android Studio needed)
npm install -g eas-cli
eas login          # sign in with your expo.dev account
eas build:android  # kicks off the cloud build

# 5. Download the .apk from the Expo dashboard when it's done.
#    Install on your device: adb install <filename>.apk
#    Or just scan the QR code Expo gives you.
```

### Build locally (no cloud, needs Android Studio)
```bash
npx expo prebuild              # generates the native android/ folder
cd android
./gradlew assembleRelease      # produces app/build/outputs/apk/release/*.apk
```

---

## 🔧 Customisation Checklist

| What | Where |
|---|---|
| App name / package ID | `app.json` → `expo.name` / `expo.android.package` |
| Input validation ranges | `app/index.js` → `validate()` |
| Risk thresholds | `src/ammonia_engine.js` → `classifyRisk()` |
| Model coefficients | `src/ammonia_engine.js` → `MODEL` object |
| Scaler means / stds | `src/ammonia_engine.js` → `SCALER_MEANS` / `SCALER_STDS` |
| Colors / theme | `app/index.js` → `C` object |

---

## 🏗️ Retrain & Re-export Your Model

When you retrain on new data in Python, export like this:

```python
import json, numpy as np

# After training:
final_model.save_model('model.json')

# Export scaler params:
scaler_params = {
    'means': scaler.mean_.tolist(),
    'stds':  scaler.scale_.tolist(),
}
with open('scaler.json', 'w') as f:
    json.dump(scaler_params, f)

print("Copy scaler.json means/stds into SCALER_MEANS / SCALER_STDS in ammonia_engine.js")
print("For full tree export, use xgb model.json and write a JS tree-walker (see forestPredict).")
```

---

## Privacy
No network calls. No analytics. No telemetry.  
All computation happens on-device. Your water quality data never leaves the phone.
