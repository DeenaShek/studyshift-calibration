// content.js - Final Version for StudyShift

// 1. Inject dynamic styling for adaptive UI
const styleTag = document.createElement('style');
document.head.appendChild(styleTag);

// 2. Mode styles
const modes = {
  focus: `
    [href*="facebook.com"], 
    [href*="twitter.com"],
    [href*="instagram.com"],
    [href*="tiktok.com"],
    [href*="youtube.com"],
    .sidebar, .recommended-videos {
      opacity: 0.1 !important;
      pointer-events: none !important;
    }
    body::before {
      content: "FOCUS MODE (Auto)";
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4CAF50;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      z-index: 9999;
      font-family: sans-serif;
    }
  `,
  help: `
    p, li, h1, h2, h3 {
      background-color: rgba(255,255,0,0.2) !important;
    }
    body::before {
      content: "HELP MODE (Auto)";
      position: fixed;
      top: 10px;
      right: 10px;
      background: #FFC107;
      color: black;
      padding: 5px 10px;
      border-radius: 4px;
      z-index: 9999;
      font-family: sans-serif;
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
      position: fixed;
      top: 10px;
      right: 10px;
      background: #673AB7;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      z-index: 9999;
      font-family: sans-serif;
    }
  `
};

// 3. Gaze detection setup
let isTracking = false;
let currentMode = null;
let lastChange = Date.now();
const cooldown = 2000; // 2 seconds between switches

if (typeof webgazer !== 'undefined') {
  if (!localStorage.getItem('webgazerData')) {
    console.log('Calibration data not found. Please calibrate first.');
  } else {
    startEyeTracking();
  }
}

function startEyeTracking() {
  webgazer.setRegression('ridge')
    .setTracker('clmtrackr')
    .begin()
    .showPredictionPoints(true);

  isTracking = true;

  setInterval(() => {
    if (!isTracking) return;

    const prediction = webgazer.getCurrentPrediction();
    if (!prediction) return;

    if (Date.now() - lastChange < cooldown) return;

    const x = prediction.x;
    const y = prediction.y;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (x < w * 0.2) {
      applyMode('focus'); // Left gaze
    } else if (x > w * 0.8) {
      applyMode('help'); // Right gaze
    } else if (y > h * 0.9) {
      applyMode('night'); // Down gaze
    }
  }, 1000);
}

// 4. Apply adaptive UI mode
function applyMode(mode) {
  if (mode !== currentMode && modes[mode]) {
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

// 5. Listen for manual commands from keyboard shortcuts
chrome.runtime.onMessage.addListener((request) => {
  if (request.mode && modes[request.mode]) {
    const manualStyle = modes[request.mode].replace('(Auto)', '(Manual)');
    styleTag.textContent = manualStyle;
    currentMode = request.mode;
    lastChange = Date.now();
  }
});
