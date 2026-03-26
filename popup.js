document.addEventListener("DOMContentLoaded", () => {
  const removeAdsToggle = document.getElementById("removeAdsToggle");
  const blinkingTimerToggle = document.getElementById("blinkingTimerToggle");
  const zoomResultsImageToggle = document.getElementById("zoomResultsImageToggle");
  const autoSubmitAtOneToggle = document.getElementById("autoSubmitAtOneToggle");
  const yearMarkersToggle = document.getElementById("yearMarkersToggle");

  function loadSettings() {
    chrome.storage.local.get(
      {
        removeAds: true,
        blinkingTimer: false,
        zoomResultsImage: false,
        autoSubmitAtOne: false,
        yearMarkers: false,
      },
      (items) => {
        removeAdsToggle.checked = items.removeAds;
        blinkingTimerToggle.checked = items.blinkingTimer;
        zoomResultsImageToggle.checked = items.zoomResultsImage;
        autoSubmitAtOneToggle.checked = items.autoSubmitAtOne;
        yearMarkersToggle.checked = items.yearMarkers;
      }
    );
  }

  function saveSettings() {
    chrome.storage.local.set(
      {
        removeAds: removeAdsToggle.checked,
        blinkingTimer: blinkingTimerToggle.checked,
        zoomResultsImage: zoomResultsImageToggle.checked,
        autoSubmitAtOne: autoSubmitAtOneToggle.checked,
        yearMarkers: yearMarkersToggle.checked,
      },
      async () => {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: "TG_UPDATE_SETTINGS",
          });
        }
      }
    );
  }

  removeAdsToggle.addEventListener("change", saveSettings);
  blinkingTimerToggle.addEventListener("change", saveSettings);
  zoomResultsImageToggle.addEventListener("change", saveSettings);
  autoSubmitAtOneToggle.addEventListener("change", saveSettings);
  yearMarkersToggle.addEventListener("change", saveSettings);

  loadSettings();
});