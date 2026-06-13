(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 12) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuToggle && header) {
        menuToggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var search = scope.querySelector('[data-filter-search]');
        var list = document.querySelector('[data-filter-list]');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
        var empty = scope.querySelector('[data-empty-state]');
        var filters = {};
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (search && initialQuery) {
            search.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.category,
                card.dataset.tags,
                card.textContent
            ].join(' '));
        }

        function apply() {
            var query = normalize(search ? search.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var matched = true;
                if (query && cardText(card).indexOf(query) === -1) {
                    matched = false;
                }
                Object.keys(filters).forEach(function (key) {
                    var value = filters[key];
                    var dataValue = normalize(card.dataset[key]);
                    if (value && dataValue.indexOf(normalize(value)) === -1) {
                        matched = false;
                    }
                });
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (search) {
            search.addEventListener('input', apply);
        }

        scope.querySelectorAll('[data-filter-key]').forEach(function (button) {
            button.addEventListener('click', function () {
                var key = button.dataset.filterKey;
                var value = button.dataset.filterValue || '';
                filters[key] = value;
                scope.querySelectorAll('[data-filter-key="' + key + '"]').forEach(function (other) {
                    other.classList.toggle('is-active', other === button);
                });
                apply();
            });
        });

        apply();
    });

    function attachVideo(video) {
        var stream = video.getAttribute('data-stream');
        if (!stream || video.dataset.ready === '1') {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            player.loadSource(stream);
            player.attachMedia(video);
            video.dataset.ready = '1';
            video._streamPlayer = player;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.dataset.ready = '1';
        }
    }

    document.querySelectorAll('.movie-player').forEach(function (video) {
        video.addEventListener('play', function () {
            attachVideo(video);
        });
    });

    document.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-play]');
        if (!trigger) {
            return;
        }
        var card = trigger.closest('.player-card');
        var video = card ? card.querySelector('.movie-player') : null;
        if (!video) {
            return;
        }
        card.classList.add('is-playing');
        attachVideo(video);
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                card.classList.remove('is-playing');
            });
        }
    });
})();
