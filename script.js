const video = document.getElementById("heroVideo");

if (video) {
  let currentFadeRaf = null;
  let fadingOutRef = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const cancelCurrentFade = () => {
    if (currentFadeRaf !== null) {
      cancelAnimationFrame(currentFadeRaf);
      currentFadeRaf = null;
    }
  };

  const animateOpacity = (targetOpacity, durationMs) => {
    cancelCurrentFade();

    const startOpacity = clamp(parseFloat(getComputedStyle(video).opacity) || 0, 0, 1);
    const delta = targetOpacity - startOpacity;

    if (Math.abs(delta) < 0.001 || durationMs <= 0) {
      video.style.opacity = String(targetOpacity);
      return;
    }

    const startTime = performance.now();

    const tick = (now) => {
      const progress = clamp((now - startTime) / durationMs, 0, 1);
      video.style.opacity = String(startOpacity + delta * progress);

      if (progress < 1) {
        currentFadeRaf = requestAnimationFrame(tick);
      } else {
        currentFadeRaf = null;
      }
    };

    currentFadeRaf = requestAnimationFrame(tick);
  };

  const fadeIn = () => {
    fadingOutRef = false;
    animateOpacity(1, 250);
  };

  const fadeOut = () => {
    if (fadingOutRef) {
      return;
    }
    fadingOutRef = true;
    animateOpacity(0, 250);
  };

  video.addEventListener("loadeddata", () => {
    video.style.opacity = "0";
    fadeIn();
  });

  video.addEventListener("playing", () => {
    if (!fadingOutRef) {
      fadeIn();
    }
  });

  video.addEventListener("timeupdate", () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    const remaining = video.duration - video.currentTime;
    if (remaining <= 0.55) {
      fadeOut();
    }
  });

  video.addEventListener("ended", () => {
    cancelCurrentFade();
    video.style.opacity = "0";

    setTimeout(() => {
      video.currentTime = 0;
      video
        .play()
        .then(() => {
          fadeIn();
        })
        .catch(() => {
          fadeIn();
        });
    }, 100);
  });
}

const goToSection = (selector) => {
  const target = document.querySelector(selector);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const clickableItems = document.querySelectorAll("[data-scroll]");
clickableItems.forEach((item) => {
  item.addEventListener("click", () => {
    const selector = item.getAttribute("data-scroll");
    if (selector) {
      goToSection(selector);
    }
  });

  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const selector = item.getAttribute("data-scroll");
      if (selector) {
        goToSection(selector);
      }
    }
  });
});

const input = document.getElementById("questionInput");
const counter = document.getElementById("charCounter");
const askButton = document.getElementById("askButton");

if (input && counter) {
  const updateCount = () => {
    counter.textContent = `${input.value.length.toLocaleString()}/3,000`;
  };

  input.addEventListener("input", updateCount);
  updateCount();
}

if (askButton && input) {
  askButton.addEventListener("click", () => {
    const value = input.value.trim().toLowerCase();

    if (!value) {
      goToSection("#about");
      return;
    }

    if (value.includes("symptom") || value.includes("cause")) {
      goToSection("#symptoms");
    } else if (value.includes("myth") || value.includes("fact")) {
      goToSection("#myths");
    } else if (value.includes("help") || value.includes("support")) {
      goToSection("#help");
    } else {
      goToSection("#about");
    }
  });
}

const videoModal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const closeVideoModalButton = document.getElementById("closeVideoModal");
const tipButtons = document.querySelectorAll(".tip-link");
const modalCloseAreas = document.querySelectorAll("[data-modal-close]");

const extractYouTubeId = (urlString) => {
  try {
    const url = new URL(urlString);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").trim();
    }

    if (url.hostname.includes("youtube.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) {
        return fromQuery;
      }

      const pathParts = url.pathname.split("/").filter(Boolean);
      const embedIndex = pathParts.indexOf("embed");
      if (embedIndex !== -1 && pathParts[embedIndex + 1]) {
        return pathParts[embedIndex + 1];
      }
    }
  } catch (_error) {
    return "";
  }

  return "";
};

const closeVideoModal = () => {
  if (!videoModal || !videoFrame) {
    return;
  }

  videoModal.classList.remove("is-open");
  videoModal.setAttribute("aria-hidden", "true");
  videoFrame.src = "";
  document.body.style.overflow = "";
};

const openVideoModal = (videoId, title) => {
  if (!videoModal || !videoFrame || !videoId) {
    return;
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  videoFrame.src = embedUrl;
  videoFrame.title = title || "Postpartum tips video";
  videoModal.classList.add("is-open");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

tipButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();

    const inlineId = button.getAttribute("data-video-id") || "";
    const href = button.getAttribute("href") || "";
    const videoId = inlineId || extractYouTubeId(href);
    const title = button.getAttribute("data-video-title");

    if (!videoId) {
      return;
    }

    openVideoModal(videoId, title);
  });
});

if (closeVideoModalButton) {
  closeVideoModalButton.addEventListener("click", closeVideoModal);
}

modalCloseAreas.forEach((item) => {
  item.addEventListener("click", closeVideoModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeVideoModal();
  }
});

