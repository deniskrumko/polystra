const BANDS = "bands";

let band = null;
let song = null;

function resetOptions() {
  settings = {};
  sessionStorage.setItem(BANDS, JSON.stringify(settings));
}

function getOption(key) {
  if (band == null) {
    console.error("Band is not defined");
    return;
  }

  const settings = JSON.parse(sessionStorage.getItem(BANDS)) || {};
  return settings[band]?.[song]?.[key];
}

function setOption(key, value) {
  if (band == null) {
    console.error("Band is not defined");
    return;
  }

  const settings = JSON.parse(sessionStorage.getItem(BANDS)) || {};
  if (!settings[band]) {
    settings[band] = {};
  }
  if (!settings[band][song]) {
    settings[band][song] = {};
  }
  settings[band][song][key] = value;
  sessionStorage.setItem(BANDS, JSON.stringify(settings));
}
