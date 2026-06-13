(function () {
  function setupPlayer(root) {
    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var button = root.querySelector(".player-button");
    var source = root.getAttribute("data-src");
    var ready = false;
    var hls = null;

    function setMessage(text) {
      var note = root.querySelector(".player-note");
      if (note) {
        note.textContent = text;
      }
    }

    function init() {
      if (ready || !video || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setMessage("视频加载失败，请稍后再试");
          }
        });
      } else {
        video.src = source;
      }
    }

    function start() {
      init();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var played = video.play();
      if (played && typeof played.catch === "function") {
        played.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
          setMessage("点击播放");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
