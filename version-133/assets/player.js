(function () {
  window.setupVideoPlayer = function (videoId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var started = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function begin() {
      if (!started) {
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      video.controls = true;

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (!started) {
        begin();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };
})();
