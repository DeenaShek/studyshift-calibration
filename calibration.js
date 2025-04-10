const calibrationTime = 10000; // 10 seconds
let startTime;
let progressInterval;
let countdownInterval;

async function initCalibration() {
  try {
    document.getElementById('status').textContent = 'Please allow camera access...';

    await webgazer.setRegression('ridge')
                  .setTracker('clmtrackr')
                  .begin();

    webgazer.showVideo(false)
            .showPredictionPoints(false)
            .setGazeListener((data, elapsedTime) => {
              if (data) {
                document.getElementById('status').textContent = 'Calibration in progress...';
              }
            })
            .saveDataAcrossSessions(true);

    document.getElementById('status').textContent = 'Follow the dot with your eyes';
    startCalibration();

  } catch (error) {
    document.getElementById('status').textContent = 'Error: ' + error.message;
    console.error('Calibration error:', error);
  }
}

function startCalibration() {
  startTime = Date.now();
  updateProgress();
  updateCountdown();

  progressInterval = setInterval(updateProgress, 100);
  countdownInterval = setInterval(updateCountdown, 1000);

  setTimeout(finishCalibration, calibrationTime);
}

function updateProgress() {
  const elapsed = Date.now() - startTime;
  const progress = Math.min(100, (elapsed / calibrationTime) * 100);
  document.getElementById('progressBar').style.width = progress + '%';
}

function updateCountdown() {
  const remaining = Math.ceil((calibrationTime - (Date.now() - startTime)) / 1000);
  document.getElementById('countdown').textContent = 
    `${remaining} second${remaining !== 1 ? 's' : ''} remaining`;
}

function finishCalibration() {
  clearInterval(progressInterval);
  clearInterval(countdownInterval);

  try {
    webgazer.end();
  } catch (err) {
    console.warn('WebGazer end() failed:', err);
  }

  const timestamp = new Date().toISOString();

  // Save calibration flag
  if (chrome?.storage?.local) {
    chrome.storage.local.set({
      isCalibrated: true,
      studyshift_last_calibration: timestamp
    }, () => {
      console.log('Chrome storage updated.');
      redirectToClose();
    });
  } else {
    console.warn('chrome.storage not available – running outside extension?');
    redirectToClose(); // fallback for testing
  }
}

function redirectToClose() {
  document.getElementById('status').textContent = 'Calibration complete!';
  document.getElementById('countdown').textContent = 'Success!';
  document.getElementById('progressBar').style.width = '100%';

  setTimeout(() => {
    window.location.href = 'https://studyshift-extension-close';
  }, 3000);
}


window.addEventListener('load', initCalibration);
