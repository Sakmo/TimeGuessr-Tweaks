document.addEventListener("DOMContentLoaded", () => {
  const removeAdsToggle = document.getElementById("removeAdsToggle");
  const blinkingTimerToggle = document.getElementById("blinkingTimerToggle");
  const zoomResultsImageToggle = document.getElementById("zoomResultsImageToggle");

  function loadSettings() {
    chrome.storage.local.get(
      {
        removeAds: true,
        blinkingTimer: false,
        zoomResultsImage: false,
      },
      (items) => {
        removeAdsToggle.checked = items.removeAds;
        blinkingTimerToggle.checked = items.blinkingTimer;
        zoomResultsImageToggle.checked = items.zoomResultsImage;
      }
    );
  }

  function saveSettings() {
    chrome.storage.local.set(
      {
        removeAds: removeAdsToggle.checked,
        blinkingTimer: blinkingTimerToggle.checked,
        zoomResultsImage: zoomResultsImageToggle.checked,
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

  loadSettings();
});