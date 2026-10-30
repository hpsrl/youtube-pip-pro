(() => {
  if (window.__youtubePipProLoaded) return;
  window.__youtubePipProLoaded = true;

  let locked = false;

  function getVideo() {
    const videos = [...document.querySelectorAll("video")];
    return videos
      .filter(v => v.isConnected && v.videoWidth > 0 && v.videoHeight > 0)
      .sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return rb.width * rb.height - ra.width * ra.height;
      })[0] || null;
  }

  function clickPlayerButton(selector) {
    const button = document.querySelector(selector);
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") {
      throw new Error("Kontrol ini tidak tersedia pada video saat ini.");
    }
    button.click();
  }


  async function run(action, value) {
    const video = getVideo();

    switch (action) {
      case "status":
        return {
          ok: true,
          locked,
          pip: !!video && document.pictureInPictureElement === video,
          playing: !!video && !video.paused,
          currentTime: video?.currentTime ?? 0,
          duration: video?.duration ?? 0,
          speed: video?.playbackRate ?? 1,
          hasVideo: !!video
        };

      case "pip":
        if (!video) throw new Error("Video YouTube belum siap.");
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          if (!document.pictureInPictureEnabled || video.disablePictureInPicture) {
            throw new Error("Native PiP tidak tersedia untuk video ini.");
          }
          await video.requestPictureInPicture();
        }
        return { ok: true };

      case "lock":
        locked = !!value;
        return { ok: true, locked };

      case "playPause":
        if (locked) throw new Error("Kontrol ekstensi sedang dikunci.");
        if (!video) throw new Error("Video tidak ditemukan.");
        if (video.paused) await video.play();
        else video.pause();
        return { ok: true };

      case "seek":
        if (locked) throw new Error("Kontrol ekstensi sedang dikunci.");
        if (!video) throw new Error("Video tidak ditemukan.");
        video.currentTime = Math.max(
          0,
          Math.min(video.duration || Infinity, video.currentTime + Number(value))
        );
        return { ok: true };

      case "next":
        if (locked) throw new Error("Kontrol ekstensi sedang dikunci.");
        clickPlayerButton(".ytp-next-button");
        return { ok: true };

      case "previous":
        if (locked) throw new Error("Kontrol ekstensi sedang dikunci.");
        clickPlayerButton(".ytp-prev-button");
        return { ok: true };

      case "speed":
        if (locked) throw new Error("Kontrol ekstensi sedang dikunci.");
        if (!video) throw new Error("Video tidak ditemukan.");
        video.playbackRate = Number(value);
        return { ok: true, speed: video.playbackRate };


      default:
        throw new Error("Perintah tidak dikenal.");
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.target !== "youtube-pip-pro") return;
    run(message.action, message.value)
      .then(sendResponse)
      .catch(error => sendResponse({
        ok: false,
        error: error.message || String(error)
      }));
    return true;
  });
})();
