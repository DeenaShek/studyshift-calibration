// Initialize WebGazer
webgazer.setRegression('ridge')
  .setTracker('clmtrackr')
  .begin()
  .showPredictionPoints(true);

// Save calibration data
function saveCalibration() {
  localStorage.setItem('webgazerData', JSON.stringify(webgazer.getData()));
}