(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupMenu() {
    var button = qs("[data-menu-button]");
    var panel = qs("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupSearchForms() {
    qsa(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var query = input ? input.value.trim() : "";
        var prefix = form.getAttribute("data-prefix") || "";
        var target = prefix + "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function setupFilters() {
    var filterRoot = qs("[data-filter-root]");
    if (!filterRoot) {
      return;
    }
    var input = qs("[data-filter-input]", filterRoot);
    var typeSelect = qs("[data-filter-type]", filterRoot);
    var yearSelect = qs("[data-filter-year]", filterRoot);
    var cards = qsa(".movie-card", filterRoot);
    var empty = qs(".filter-empty", filterRoot);

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var typeValue = typeSelect ? typeSelect.value : "";
      var yearValue = yearSelect ? yearSelect.value : "";
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var match = (!query || haystack.indexOf(query) !== -1) && (!typeValue || type === typeValue) && (!yearValue || year === yearValue);
        card.classList.toggle("hidden", !match);
        if (match) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag-pill">' + escapeText(tag) + '</span>';
    }).join("");
    return [
      '<article class="movie-card" data-search="' + escapeText(movie.search) + '" data-type="' + escapeText(movie.type) + '" data-year="' + escapeText(movie.year) + '">',
      '<a class="poster-link" href="' + escapeText(movie.url) + '">',
      '<span class="poster-badge">' + escapeText(movie.type || "剧集") + '</span>',
      '<img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
      '</a>',
      '<div class="card-body">',
      '<h3 class="movie-title"><a href="' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a></h3>',
      '<div class="movie-meta"><span class="meta-pill">' + escapeText(movie.region) + '</span><span class="meta-pill">' + escapeText(movie.year) + '</span></div>',
      '<p class="card-desc">' + escapeText(movie.description) + '</p>',
      '<div class="card-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var results = qs("[data-search-results]");
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var title = qs("[data-search-title]");
    var movies = window.SITE_MOVIES;
    var matched = query ? movies.filter(function (movie) {
      return (movie.search || "").toLowerCase().indexOf(query) !== -1;
    }) : movies.slice(0, 48);
    if (title) {
      title.textContent = query ? "搜索：“" + params.get("q") + "”" : "热门片库";
    }
    results.innerHTML = matched.map(movieCard).join("");
    var empty = qs("[data-search-empty]");
    if (empty) {
      empty.classList.toggle("is-visible", matched.length === 0);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
