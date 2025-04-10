// content.js - Final StudyShift Gaze-Based Adaptive UI

const styleTag = document.createElement('style');
document.head.appendChild(styleTag);

// UI Modes
const modes = {
  focus: `
    [href*="facebook.com"], [href*="twitter.com"], [href*="instagram.com"],
    [href*="tiktok.com"], [href*="youtube.com"],
    .sidebar, .recommended-videos {
      opacity: 0.1 !important;
      pointer-events: none !important;
    }
    body::before {
      content: "FOCUS MODE (Auto)";
      position: fixed; top: 10px; right: 10px;
      background: #4CAF50; color: white;
      padding: 5px 10px; border-radius: 4px;
      z-index: 9999; font-family: sans-serif;
    }
  `,
  help: `
    p, li, h1, h2, h3 {
      background-color: rgba(255,255,0,0.2) !important;
    }
    body::before {
      content: "HELP MODE (Auto)";
      position: fixed; top: 10px; right: 10px;
      background: #FFC107; color: black;
      padding: 5px 10px; border-radius: 4px;
      z-index: 9999; font-family: sans-serif;
    }
  `,
  night: `
    body {
      background-color: #121212 !important;
      color: #e0e0e0 !important;
      filter: brightness(0.8);
    }
    p, li {
      font-size: 1.1rem !important;
      line-height: 1.6 !important;
    }
    body::before {
      content: "NIGHT MODE (Auto)";
      position: fixed; top: 10px; right: 10px;
      background: #673AB7; color: white;
      padding: 5px 10px; border-radius: 4px;
      z-index: 9999; font-family: sans-serif;
    }
  `
};

// Gaze detection setup
let isTracking = false;
let currentMode = null;
let lastChange = Date.now();
const cooldown = 2000;

// ✅ Fix: Use correct key from calibration
if (typeof webgazer !== 'undefined') {
  if (!localStorage.getItem('studyshift_calibrated')) {
    console.warn('🧠 StudyShift: Calibration not detected. Please calibrate.');
  } else {
    console.log('👁️ Starting WebGazer for StudyShift...');
    startEyeTracking();
  }
}

function startEyeTracking() {
  webgazer.setRegression('ridge')
    .setTracker('clmtrackr')
    .saveDataAcrossSessions(true)
    .showPredictionPoints(true)
    .begin()
    .then(() => {
      console.log("✅ WebGazer initialized successfully");
    })
    .catch((err) => {
      console.error("❌ WebGazer failed to start:", err);
    });

  isTracking = true;

  setInterval(() => {
    if (!isTracking) return;

    const prediction = webgazer.getCurrentPrediction();
    if (!prediction || !prediction.x || !prediction.y) return;
    if (Date.now() - lastChange < cooldown) return;

    const { x, y } = prediction;
    const w = window.innerWidth;
    const h = window.innerHeight;

    console.log(`🎯 Gaze Prediction: x=${Math.round(x)}, y=${Math.round(y)}`);

    if (x < w * 0.2) {
      applyMode('focus');
    } else if (x > w * 0.8) {
      applyMode('help');
    } else if (y > h * 0.9) {
      applyMode('night');
    }
  }, 1000);
}

// Apply dynamic UI styling
function applyMode(mode) {
  if (mode !== currentMode && modes[mode]) {
    console.log(`⚡ Switching to ${mode.toUpperCase()} mode`);
    styleTag.textContent = modes[mode];
    currentMode = mode;
    lastChange = Date.now();

    chrome.runtime.sendMessage({
      type: 'modeChange',
      mode: mode,
      source: 'auto'
    });
  }
}

// Handle manual mode switching via popup or hotkeys
chrome.runtime.onMessage.addListener((request) => {
  if (request.mode && modes[request.mode]) {
    console.log(`🔧 Manual mode: ${request.mode}`);
    const manualStyle = modes[request.mode].replace('(Auto)', '(Manual)');
    styleTag.textContent = manualStyle;
    currentMode = request.mode;
    lastChange = Date.now();
  }
});
