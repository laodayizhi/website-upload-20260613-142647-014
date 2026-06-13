(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navigation = document.querySelector('.main-nav');

    if (menuButton && navigation) {
        menuButton.addEventListener('click', function () {
            var open = navigation.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            slides[active].classList.remove('is-active');
            if (dots[active]) {
                dots[active].classList.remove('is-active');
            }
            active = (next + slides.length) % slides.length;
            slides[active].classList.add('is-active');
            if (dots[active]) {
                dots[active].classList.add('is-active');
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }
    }

    var grid = document.querySelector('[data-card-grid]');
    var searchInput = document.querySelector('[data-card-search]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var activeFilter = '';

    function getQueryValue() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    if (searchInput && getQueryValue()) {
        searchInput.value = getQueryValue();
    }

    function updateCards() {
        if (!grid) {
            return;
        }
        var text = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var matchedText = !text || haystack.indexOf(text) !== -1;
            var matchedFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden', !(matchedText && matchedFilter));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', updateCards);
        updateCards();
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter-value') || '';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            updateCards();
        });
    });
})();
