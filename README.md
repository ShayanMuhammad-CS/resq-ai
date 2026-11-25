# ResQ-AI: The Offline Disaster Resilience & Emergency Medical Triage Agent

> **Built for Google #BuildHybridAI 2026 Hackathon**  
> **Live Web App**: [https://shayanmuhammad-cs.github.io/resq-ai/](https://shayanmuhammad-cs.github.io/resq-ai/)  
> **Architecture**: Hybrid On-Device (Chrome Gemini Nano / Clinical START Engine) × Cloud Firebase AI Logic  
> **Status**: Production-Ready PWA • Zero-Network Field Blackout Resilient  

---

## ⚡ The Urgent Problem

In catastrophic disasters—earthquakes, hurricanes, infrastructure grid collapses—**cellular towers and fiber links vanish within the first 12 minutes**. 

Traditional cloud-only AI solutions fail immediately under zero-network conditions. Paramedics, search-and-rescue teams, and volunteer civilian responders are thrown into high-pressure triage situations without clinical decision support, clear record-keeping, or synchronized regional logistics.

## 🛡️ The ResQ-AI Solution

**ResQ-AI** is a hybrid disaster resilience application engineered with a zero-compromise architectural split:

```
[ Field Zero-Network Blackout ]                 [ Cellular / Satellite Uplink Restored ]
┌───────────────────────────────────────┐       ┌─────────────────────────────────────────┐
│ • Chrome Gemini Nano (window.ai)      │       │ • Firebase AI Logic (Gemini 2.5 Flash)  │
│ • Deterministic START Protocol Engine │  ──►  │ • Cloud Regional Crisis Synthesis       │
│ • IndexedDB Zero-Data-Loss Ledger     │       │ • Evacuation Route & Triage Heatmap     │
│ • Audio-Tactile CPR Metronome (110BPM)│       │ • Hospital Bed & Trauma Unit Allocation │
└───────────────────────────────────────┘       └─────────────────────────────────────────┘
```

1. **Edge-First START Triage Engine**: Implements the international Simple Triage and Rapid Treatment (START) protocol. Executes in **sub-1ms**, completely offline, classifying casualties into Immediate (Red), Delayed (Yellow), Minor (Green), and Expectant (Black).
2. **On-Device Gemini Nano Tactical Guidance**: When Chrome's experimental Gemini Nano (`window.ai`) is available, generates conversational first-responder guidance directly on local hardware. Seamlessly falls back to an embedded clinical rule synthesizer when hardware acceleration is unavailable.
3. **Zero-Loss IndexedDB Incident Ledger**: Stores every casualty report, GPS coordinate, vital sign set, and responder timestamp locally with cryptographically deterministic offline audit hashes.
4. **Live Audio-Tactile CPR Metronome**: Uses the Web Audio API to deliver AHA/ERC compliant 110 BPM acoustic pacing and visual chest-compression/rescue-breath cycle alerts without requiring network connectivity.
5. **Firebase AI Logic Cloud Regional Synthesizer**: The moment an uplink (cellular, Wi-Fi, Starlink) is detected or simulated blackout is disabled, ResQ-AI transmits pending field reports to Firebase AI Logic to generate high-level crisis summaries, trauma surge predictions, and emergency supply deficit matrices.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript (Strict ESM / Verbatim Module Syntax), Vite 8 |
| **Styling & Design** | Tailwind CSS v4, Lucide React, Canvas Confetti |
| **On-Device AI** | Chrome Built-in AI (`window.ai` / Gemini Nano), Clinical START Rule Engine |
| **Cloud AI & Backend** | Firebase AI Logic, Google Gemini 2.5 Flash, Cloud Firestore |
| **Offline Storage** | IndexedDB via `idb-keyval` (Zero data loss) |
| **Audio Engine** | Web Audio API Oscillator (High-precision 110 BPM metronome) |
| **Testing** | Vitest (100% automated protocol validation) |

---

## 🚀 Quickstart & Verification

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/ShayanMuhammad-CS/resq-ai.git
cd resq-ai

# Install dependencies
npm install
```

### 2. Run Test Suite
```bash
# Run Vitest automated unit tests (Verifies START protocol invariants)
npx vitest run
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in Google Chrome.

### 4. Production Build
```bash
npm run build
```

---

## 🧪 Testing the Dual-Layer Blackout Mode (Judge Guide)

ResQ-AI includes a dedicated **Judge Demonstration Switch** in the top navigation bar:

1. **Uplink Online Mode**: Shows active network status. Ready for cloud synthesis and remote synchronization.
2. **Blackout Mode (One-Click Toggle)**: Click the **UPLINK ONLINE** button in the header. The app instantly cuts cloud connections, enters simulated blackout mode, and processes all victim triage assessments, CPR pacing, and incident queues entirely on-device.
3. **Hardware / Chrome Gemini Nano Verification**: In Chrome Dev/Canary with `#optimization-guide-on-device-model` enabled, ResQ-AI automatically hooks into `window.ai`. On standard browsers, the embedded clinical rule engine executes with zero degradation in triage accuracy.
4. **Reconnection & Cloud Synthesis**: Re-enable the uplink and navigate to the **Cloud Synthesis** tab. Click **"Run Regional AI Crisis Synthesis"** to see Firebase AI Logic digest the local incidents into an operational crisis command matrix.

---

## 🩺 Clinical Triage Protocol Invariants

ResQ-AI adheres strictly to the certified **START Protocol**:

- **Ambulatory?** -> `MINOR` (Green) • Care Window: ~240 min
- **Not Breathing -> Reposition Airway -> Breathing Resumes?** -> `IMMEDIATE` (Red) • Care Window: ~15 min
- **Not Breathing -> Reposition Airway -> Still Apneic?** -> `EXPECTANT` (Black)
- **Respiratory Rate > 30 bpm?** -> `IMMEDIATE` (Red)
- **No Radial Pulse / Capillary Refill > 2s?** -> `IMMEDIATE` (Red)
- **Cannot Follow Simple Commands?** -> `IMMEDIATE` (Red)
- **All Stable & Follows Commands?** -> `DELAYED` (Yellow) • Care Window: ~120 min

---

## 📄 License & Attribution

Developed for the **Google #BuildHybridAI 2026 Hackathon**.  
Lead Architect: **Shayan Muhammad** ([GitHub](https://github.com/ShayanMuhammad-CS) • [Devpost](https://devpost.com/submit-to/31808-buildhybridai-2026/manage/submissions))
