chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isCalibrated', (res) => {
    if (!res.isCalibrated) {
      chrome.tabs.create({
        url: 'https://deenashek.github.io/studyshift-calibration/calibration.html'
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.startsWith('https://studyshift-extension-close')) {
    chrome.storage.local.set({ isCalibrated: true }, () => {
      chrome.tabs.remove(tabId);
      console.log('Calibration complete! Tab closed.');
    });
  }
});
