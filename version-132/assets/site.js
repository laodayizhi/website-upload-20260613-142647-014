(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-missing");
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        function show(next) {
            index = next;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
    grids.forEach(function (grid) {
        var section = grid.closest("section") || document;
        var keywordInput = section.querySelector("[data-filter-input]");
        var yearSelect = section.querySelector("[data-year-filter]");
        var typeSelect = section.querySelector("[data-type-filter]");
        var empty = section.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (keywordInput && initial) {
            keywordInput.value = initial;
        }
        function matchesYear(card, value) {
            if (!value) {
                return true;
            }
            var year = parseInt(card.getAttribute("data-year") || "0", 10);
            if (value === "2019") {
                return year <= 2019;
            }
            return String(year) === value;
        }
        function update() {
            var query = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-search") || "";
                var cardType = card.getAttribute("data-type") || "";
                var ok = true;
                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (!matchesYear(card, year)) {
                    ok = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    ok = false;
                }
                card.classList.toggle("hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
        update();
    });
}());
