function setActiveButton(buttons, activeButton) {
    buttons.forEach(function (button) {
        button.classList.toggle("active", button === activeButton);
    });
}

function normalizeSearchText(value) {
    return String(value || "").toLowerCase().trim();
}

function applyCardFilter(container, query, filter) {
    var cards = container.querySelectorAll("[data-card]");
    var normalizedQuery = normalizeSearchText(query);
    var normalizedFilter = normalizeSearchText(filter === "全部" ? "" : filter);

    cards.forEach(function (card) {
        var haystack = normalizeSearchText([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.textContent
        ].join(" "));
        var matchesQuery = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
        var matchesFilter = !normalizedFilter || haystack.indexOf(normalizedFilter) !== -1;
        card.hidden = !(matchesQuery && matchesFilter);
    });
}

function initFilters() {
    var panels = document.querySelectorAll(".filter-panel");

    panels.forEach(function (panel) {
        var section = panel.parentElement || document;
        var input = panel.querySelector("[data-page-search]");
        var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
        var currentFilter = "全部";

        if (input) {
            input.addEventListener("input", function () {
                applyCardFilter(section, input.value, currentFilter);
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                currentFilter = button.getAttribute("data-filter") || "全部";
                setActiveButton(buttons, button);
                applyCardFilter(section, input ? input.value : "", currentFilter);
            });
        });
    });
}

function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function initHeroCarousel() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
        return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var next = root.querySelector("[data-hero-next]");
    var prev = root.querySelector("[data-hero-prev]");
    var index = 0;
    var timer;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle("active", position === index);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle("active", position === index);
        });
    }

    function move(step) {
        show(index + step);
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
            move(1);
        }, 5200);
    }

    dots.forEach(function (dot, position) {
        dot.addEventListener("click", function () {
            show(position);
            startTimer();
        });
    });

    if (next) {
        next.addEventListener("click", function () {
            move(1);
            startTimer();
        });
    }

    if (prev) {
        prev.addEventListener("click", function () {
            move(-1);
            startTimer();
        });
    }

    show(0);
    startTimer();
}

function initHomeSearchValue() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var input = document.querySelector("[data-page-search]");

    if (query && input) {
        input.value = query;
        var panel = input.closest(".filter-panel");
        var section = panel ? panel.parentElement : document;
        applyCardFilter(section, query, "全部");
    }
}

function initMoviePlayer(source) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function attachSource() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 40,
                backBufferLength: 30
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function beginPlayback() {
        attachSource();

        if (cover) {
            cover.classList.add("is-hidden");
        }

        var playAction = video.play();

        if (playAction && typeof playAction.catch === "function") {
            playAction.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", beginPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            beginPlayback();
        }
    });

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initHomeSearchValue();
});
