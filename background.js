chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isCalibrated', (res) => {
    if (!res.isCalibrated) {
      chrome.tabs.create({
        url: 'https://deenashek.github.io/studyshift-calibration/calibration.html'
      });
    }
  });
});

// Watch for the magic URL that signals "I'm done!"
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.startsWith('https://studyshift-extension-close')) {
    chrome.storage.local.set({ isCalibrated: true }, () => {
      chrome.tabs.remove(tabId); // Close the tab after calibration
    });
  }
});
