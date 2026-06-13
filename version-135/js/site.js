(function() {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            var isOpen = mobilePanel.hasAttribute('hidden') === false;
            if (isOpen) {
                mobilePanel.setAttribute('hidden', '');
                menuButton.setAttribute('aria-expanded', 'false');
            } else {
                mobilePanel.removeAttribute('hidden');
                menuButton.setAttribute('aria-expanded', 'true');
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(heroTimer);
        heroTimer = window.setInterval(function() {
            showHero(heroIndex + 1);
        }, 5200);
    }

    if (prev) {
        prev.addEventListener('click', function() {
            showHero(heroIndex - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            showHero(heroIndex + 1);
            startHero();
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    startHero();

    var localForms = Array.prototype.slice.call(document.querySelectorAll('.js-search-form[data-local-search="true"]'));
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.js-search-input'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var emptyState = document.querySelector('.empty-state');
    var currentFilter = 'all';

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters(query) {
        var needle = normalize(query);
        var visibleCount = 0;
        cards.forEach(function(card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var cardFilter = card.getAttribute('data-filter') || 'all';
            var matchesText = !needle || haystack.indexOf(needle) !== -1;
            var matchesFilter = currentFilter === 'all' || cardFilter === currentFilter;
            var visible = matchesText && matchesFilter;
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });
        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    localForms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            var input = form.querySelector('.js-search-input');
            var query = input ? input.value : '';
            inputs.forEach(function(other) {
                other.value = query;
            });
            applyFilters(query);
            var library = document.getElementById('movie-library') || document.getElementById('category-list');
            if (library) {
                library.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            if (document.body.getAttribute('data-page') === 'list') {
                inputs.forEach(function(other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                applyFilters(input.value);
            }
        });
    });

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            currentFilter = button.getAttribute('data-filter-button') || 'all';
            filterButtons.forEach(function(other) {
                other.classList.toggle('is-active', other === button);
            });
            var input = document.querySelector('.js-search-input');
            applyFilters(input ? input.value : '');
        });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && document.body.getAttribute('data-page') === 'list') {
        inputs.forEach(function(input) {
            input.value = query;
        });
        applyFilters(query);
        var libraryTarget = document.getElementById('movie-library') || document.getElementById('category-list');
        if (libraryTarget) {
            window.setTimeout(function() {
                libraryTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
        }
    }
})();
