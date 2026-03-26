(() => {
  let removeAdsEnabled = true;
  let blinkingTimerEnabled = false;
  let zoomResultsImageEnabled = false;
  let autoSubmitAtOneEnabled = false;

  let blinkInterval = null;
  let autoSubmitTimeout = null;
  let autoSubmitArmedForRound = false;

  function getTimerText() {
    const injectTimer = document.getElementById("injectTimer");
    if (!injectTimer) return null;
    return (injectTimer.textContent || "").trim();
  }

  function isUnderTenSeconds(text) {
    if (!text) return false;
    return /^0:0[0-9]$/.test(text);
  }

  function stopBlinkingTimer() {
    const timerDiv = document.getElementById("timerDiv");

    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }

    if (timerDiv) {
      timerDiv.style.removeProperty("background-color");
    }
  }

  function startBlinkingTimer() {
    const timerDiv = document.getElementById("timerDiv");
    if (!timerDiv || blinkInterval) return;

    let isRed = true;

    blinkInterval = setInterval(() => {
      const currentTimerDiv = document.getElementById("timerDiv");
      const currentTimerText = getTimerText();

      if (!currentTimerDiv || !blinkingTimerEnabled || !isUnderTenSeconds(currentTimerText)) {
        stopBlinkingTimer();
        return;
      }

      currentTimerDiv.style.setProperty(
        "background-color",
        isRed ? "red" : "black",
        "important"
      );
      isRed = !isRed;
    }, 400);
  }

  function applyGeneralTimerTweaks() {
    const timerDiv = document.getElementById("timerDiv");
    if (timerDiv) {
      timerDiv.style.setProperty("padding-top", "0", "important");
      timerDiv.style.setProperty("padding-bottom", "0", "important");
    }

    const injectTimer = document.getElementById("injectTimer");
    if (injectTimer) {
      injectTimer.style.setProperty("font-size", "40px", "important");
    }
  }

  function applyRemoveAdsTweaks() {
    if (!removeAdsEnabled) return;

    const removeAdverts = document.getElementById("removeAdverts");
    if (removeAdverts) {
      const parentLink = removeAdverts.closest('a[href="/subscriptions"]');
      if (parentLink) {
        parentLink.remove();
      } else {
        removeAdverts.remove();
      }
    }

    const bottomPadding = document.getElementById("bottomPadding");
    if (bottomPadding) {
      bottomPadding.remove();
    }

    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.style.setProperty("position", "static", "important");
    }

    const timerWrap = document.getElementById("timerWrap");
    if (timerWrap) {
      timerWrap.style.setProperty("margin-right", "300px", "important");
    }
  }

  function restoreRemoveAdsTweaks() {
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.style.removeProperty("position");
    }

    const timerWrap = document.getElementById("timerWrap");
    if (timerWrap) {
      timerWrap.style.removeProperty("margin-right");
    }
  }

  function applyBlinkingTimerState() {
    const timerText = getTimerText();

    if (blinkingTimerEnabled && isUnderTenSeconds(timerText)) {
      startBlinkingTimer();
    } else {
      stopBlinkingTimer();
    }
  }

  function enableZoomOnImage(img) {
    if (!zoomResultsImageEnabled) return;
    if (!img) return;
    if (img.dataset.tgZoomReady === "true") return;

    const wrapper = document.createElement("div");
    wrapper.style.overflow = "hidden";
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.maxWidth = "100%";

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    let scale = 1;

    function handleWheel(e) {
      if (!zoomResultsImageEnabled) return;

      e.preventDefault();

      const rect = wrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      img.style.transformOrigin = `${x}% ${y}%`;

      scale += e.deltaY < 0 ? 0.15 : -0.15;
      scale = Math.max(1, Math.min(6, scale));

      img.style.transform = `scale(${scale})`;
    }

    wrapper.addEventListener("wheel", handleWheel, { passive: false });

    img.style.transition = "transform 0.05s linear";
    img.style.transform = "scale(1)";
    img.dataset.tgZoomReady = "true";
    wrapper.dataset.tgZoomWrapper = "true";
  }

  function disableZoomOnImage(img) {
    if (!img) return;

    const wrapper = img.parentElement;
    if (!wrapper || wrapper.dataset.tgZoomWrapper !== "true") {
      img.style.removeProperty("transform");
      img.style.removeProperty("transform-origin");
      img.style.removeProperty("transition");
      delete img.dataset.tgZoomReady;
      return;
    }

    img.style.transform = "scale(1)";
    img.style.removeProperty("transform-origin");
    img.style.removeProperty("transition");
    delete img.dataset.tgZoomReady;

    wrapper.parentNode.insertBefore(img, wrapper);
    wrapper.remove();
  }

  function applyZoomResultsImageState() {
    const img = document.querySelector(".results-img.results-img-top");
    if (!img) return;

    if (zoomResultsImageEnabled) {
      enableZoomOnImage(img);
    } else {
      disableZoomOnImage(img);
    }
  }

  function clearAutoSubmitSchedule() {
    if (autoSubmitTimeout) {
      clearTimeout(autoSubmitTimeout);
      autoSubmitTimeout = null;
    }
  }

  function resetAutoSubmitRoundStateIfNeeded(timerText) {
    if (timerText && timerText !== "0:01") {
      autoSubmitArmedForRound = false;
    }
  }

  function triggerGuessButton() {
    const guessButton = document.getElementById("guessButton");
    if (!guessButton) return;

    guessButton.click();
  }

  function applyAutoSubmitAtOneState() {
    const timerText = getTimerText();

    if (!autoSubmitAtOneEnabled) {
      clearAutoSubmitSchedule();
      return;
    }

    if (!timerText) {
      clearAutoSubmitSchedule();
      autoSubmitArmedForRound = false;
      return;
    }

    resetAutoSubmitRoundStateIfNeeded(timerText);

    if (timerText === "0:01" && !autoSubmitArmedForRound) {
      autoSubmitArmedForRound = true;
      clearAutoSubmitSchedule();

      autoSubmitTimeout = setTimeout(() => {
        const latestTimerText = getTimerText();
        if (autoSubmitAtOneEnabled && latestTimerText === "0:01") {
          triggerGuessButton();
        }
        autoSubmitTimeout = null;
      }, 900);
    }
  }

  function applyAllTweaks() {
    applyGeneralTimerTweaks();

    if (removeAdsEnabled) {
      applyRemoveAdsTweaks();
    } else {
      restoreRemoveAdsTweaks();
    }

    applyBlinkingTimerState();
    applyZoomResultsImageState();
    applyAutoSubmitAtOneState();
  }

  function loadSettings(callback) {
    chrome.storage.local.get(
      {
        removeAds: true,
        blinkingTimer: false,
        zoomResultsImage: false,
        autoSubmitAtOne: false,
      },
      (items) => {
        removeAdsEnabled = items.removeAds;
        blinkingTimerEnabled = items.blinkingTimer;
        zoomResultsImageEnabled = items.zoomResultsImage;
        autoSubmitAtOneEnabled = items.autoSubmitAtOne;
        if (callback) callback();
      }
    );
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "TG_UPDATE_SETTINGS") {
      loadSettings(() => {
        applyAllTweaks();
      });
    }
  });

  loadSettings(() => {
    applyAllTweaks();

    const observer = new MutationObserver(() => {
      applyAllTweaks();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
      characterData: true,
    });
  });
})();