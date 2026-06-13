(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        if (dotIndex === current) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearchPage() {
    var root = qs('[data-search-page]');
    if (!root) {
      return;
    }
    var input = qs('#movieSearchInput', root);
    var year = qs('#movieYearFilter', root);
    var type = qs('#movieTypeFilter', root);
    var region = qs('#movieRegionFilter', root);
    var reset = qs('#movieFilterReset', root);
    var empty = qs('#movieSearchEmpty', root);
    var cards = qsa('.movie-card', root);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var q = normalize(input && input.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var r = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-tags'));
        var matchQuery = !q || text.indexOf(q) !== -1;
        var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
        var matchType = !t || normalize(card.getAttribute('data-type')) === t;
        var matchRegion = !r || normalize(card.getAttribute('data-region')) === r;
        var ok = matchQuery && matchYear && matchType && matchRegion;
        card.classList.toggle('filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        if (visible === 0) {
          empty.removeAttribute('hidden');
        } else {
          empty.setAttribute('hidden', '');
        }
      }
    }

    [input, year, type, region].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (year) {
          year.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (region) {
          region.value = '';
        }
        apply();
      });
    }

    apply();
  }

  function setupAnchorPlay() {
    qsa('a[href="#watch"]').forEach(function (link) {
      link.addEventListener('click', function () {
        window.setTimeout(function () {
          var button = qs('.play-layer');
          if (button) {
            button.focus({ preventScroll: true });
          }
        }, 500);
      });
    });
  }

  window.createMoviePlayer = function (containerId, url) {
    var container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    var video = qs('video', container);
    var button = qs('.play-layer', container);
    var hls = null;

    if (!video || !url) {
      return;
    }

    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function play() {
      attachOnce();
      container.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          container.classList.remove('is-playing');
        });
      }
    }

    var attached = false;
    function attachOnce() {
      if (!attached) {
        attached = true;
        attach();
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      container.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        container.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      container.classList.remove('is-playing');
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchPage();
    setupAnchorPlay();
  });
})();
