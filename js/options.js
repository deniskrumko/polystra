const BANDS = "bands";

let band = null;
let song = null;

function resetOptions() {
  settings = {};
  localStorage.setItem(BANDS, JSON.stringify(settings));
}

function getOption(key) {
  if (band == null) {
    console.error("Band is not defined");
    return;
  }

  const settings = JSON.parse(localStorage.getItem(BANDS)) || {};
  return settings[band]?.[song]?.[key];
}

function setOption(key, value) {
  if (band == null) {
    console.error("Band is not defined");
    return;
  }

  const settings = JSON.parse(localStorage.getItem(BANDS)) || {};
  if (!settings[band]) {
    settings[band] = {};
  }
  if (!settings[band][song]) {
    settings[band][song] = {};
  }
  settings[band][song][key] = value;
  localStorage.setItem(BANDS, JSON.stringify(settings));
}
