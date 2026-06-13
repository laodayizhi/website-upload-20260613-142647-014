(function () {
  var currentScript = document.currentScript;
  var assetBase = currentScript && currentScript.src ? currentScript.src.replace(/\/[^\/]*$/, "/") : "./assets/";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function setHeaderState() {
      if (!header) {
        return;
      }
      header.classList.toggle("nav-scrolled", window.scrollY > 40);
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (toggle && mobileNav && header) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        header.classList.toggle("menu-open", open);
      });

      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileNav.classList.remove("open");
          header.classList.remove("menu-open");
        });
      });
    }

    initHeroCarousel();
    initSearchPanels();
    initPlayers();
  });

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === activeIndex);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === activeIndex);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });

    carousel.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });

    carousel.addEventListener("mouseleave", play);

    show(0);
    play();
  }

  function normalizeText(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initSearchPanels() {
    document.querySelectorAll(".search-panel").forEach(function (panel) {
      var input = panel.querySelector("[data-search-box]");
      var scope = panel.parentElement ? panel.parentElement.querySelector("[data-card-scope]") : null;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-card]")) : Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]"));
      var activeFilter = "all";

      function apply() {
        var query = normalizeText(input ? input.value : "");
        cards.forEach(function (card) {
          var haystack = normalizeText([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" "));
          var searchMatch = !query || haystack.indexOf(query) !== -1;
          var filterMatch = activeFilter === "all" || haystack.indexOf(normalizeText(activeFilter)) !== -1;
          card.classList.toggle("is-hidden-card", !(searchMatch && filterMatch));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var source = player.getAttribute("data-source");
      var initialized = false;

      if (!video || !button || !source) {
        return;
      }

      function playNative() {
        video.src = source;
        video.play().catch(function () {});
      }

      function start() {
        button.classList.add("is-hidden");
        if (initialized) {
          video.play().catch(function () {});
          return;
        }
        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          playNative();
          return;
        }

        try {
          import(assetBase + "hls-vendor.js")
            .then(function (module) {
              var Hls = module.H;
              if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                  video.play().catch(function () {});
                });
              } else {
                playNative();
              }
            })
            .catch(playNative);
        } catch (error) {
          playNative();
        }
      }

      button.addEventListener("click", start);
      player.addEventListener("click", function (event) {
        if (event.target === video || event.target === player) {
          start();
        }
      });
    });
  }
})();
