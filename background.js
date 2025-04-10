// 1. Check calibration on install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isCalibrated', (result) => {
    if (!result.isCalibrated) {
      chrome.tabs.create({ url: 'calibration.html' });
    }
  });
});

// 2. Keyboard shortcut fallback handler
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;

    chrome.tabs.sendMessage(tabs[0].id, { 
      mode: command.replace('_mode', ''), // e.g., "focus"
      source: 'keyboard' 
    });
  });
});

// 3. Webcam state handler (from content.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'webcamState') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;

      chrome.tabs.sendMessage(tabs[0].id, {
        mode: request.state, // e.g., "focused"
        source: 'webcam'
      });
    });
  }
});
