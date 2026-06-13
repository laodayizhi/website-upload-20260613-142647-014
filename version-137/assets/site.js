const state = {
    hlsModulePromise: null,
    searchDataPromise: null
};

document.addEventListener('DOMContentLoaded', () => {
    setupMobileNavigation();
    setupHeroSlider();
    setupCardFilters();
    setupFullSearch();
    setupPlayers();
});

function setupMobileNavigation() {
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    const root = document.querySelector('[data-hero-slider]');

    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    const previous = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const activate = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => activate(index + 1), 6000);
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            activate(dotIndex);
            restart();
        });
    });

    if (previous) {
        previous.addEventListener('click', () => {
            activate(index - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            activate(index + 1);
            restart();
        });
    }

    restart();
}

function setupCardFilters() {
    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach((panel) => {
        const section = panel.closest('.content-section') || document;
        const cards = Array.from(section.querySelectorAll('[data-movie-card]'));
        const empty = section.querySelector('[data-empty-state]');
        const query = panel.querySelector('[data-card-search]');
        const region = panel.querySelector('[data-card-region]');
        const type = panel.querySelector('[data-card-type]');
        const year = panel.querySelector('[data-card-year]');

        const apply = () => {
            const q = normalize(query ? query.value : '');
            const r = region ? region.value : '';
            const t = type ? type.value : '';
            const y = year ? year.value : '';
            let visible = 0;

            cards.forEach((card) => {
                const search = normalize(card.dataset.search || '');
                const ok = (!q || search.includes(q)) &&
                    (!r || card.dataset.region === r) &&
                    (!t || card.dataset.type === t) &&
                    (!y || card.dataset.year === y);
                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        [query, region, type, year].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    });
}

function setupFullSearch() {
    const root = document.querySelector('[data-full-search]');

    if (!root) {
        return;
    }

    const query = root.querySelector('[data-search-query]');
    const region = root.querySelector('[data-search-region]');
    const type = root.querySelector('[data-search-type]');
    const year = root.querySelector('[data-search-year]');
    const results = root.querySelector('[data-search-results]');
    const summary = root.querySelector('[data-search-summary]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (query) {
        query.value = initialQuery;
    }

    getSearchData().then((movies) => {
        fillOptions(region, uniqueValues(movies, 'region'), '全部地区');
        fillOptions(type, uniqueValues(movies, 'type'), '全部类型');
        fillOptions(year, uniqueValues(movies, 'year').sort().reverse(), '全部年份');

        const render = () => {
            const q = normalize(query ? query.value : '');
            const r = region ? region.value : '';
            const t = type ? type.value : '';
            const y = year ? year.value : '';
            const filtered = movies.filter((movie) => {
                const search = normalize(movie.searchText || '');
                return (!q || search.includes(q)) &&
                    (!r || movie.region === r) &&
                    (!t || movie.type === t) &&
                    (!y || movie.year === y);
            }).slice(0, 120);

            if (summary) {
                summary.textContent = filtered.length ? '已显示匹配结果，点击影片进入播放页' : '没有找到匹配影片';
            }

            if (results) {
                results.innerHTML = filtered.map(renderSearchCard).join('');
            }
        };

        [query, region, type, year].forEach((control) => {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });

        render();
    });
}

function renderSearchCard(movie) {
    return `
        <article class="movie-card is-compact" data-movie-card>
            <a class="movie-cover-link" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
                <div class="movie-cover-wrap">
                    <img class="movie-cover" src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                    <span class="movie-type">${escapeHtml(movie.type)}</span>
                    <span class="play-hover">▶</span>
                </div>
                <h3>${escapeHtml(movie.title)}</h3>
            </a>
            <div class="movie-meta">
                <span>${escapeHtml(movie.region)}</span>
                <span>${escapeHtml(movie.year)}</span>
            </div>
            <p class="movie-desc">${escapeHtml(movie.oneLine)}</p>
        </article>
    `;
}

function getSearchData() {
    if (!state.searchDataPromise) {
        state.searchDataPromise = fetch('./assets/search-data.json').then((response) => response.json());
    }

    return state.searchDataPromise;
}

function fillOptions(select, values, firstLabel) {
    if (!select) {
        return;
    }

    const current = select.value;
    select.innerHTML = `<option value="">${firstLabel}</option>` + values.map((value) => {
        return `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
    }).join('');
    select.value = current;
}

function uniqueValues(items, key) {
    return Array.from(new Set(items.map((item) => item[key]).filter(Boolean))).sort();
}

function setupPlayers() {
    const shells = Array.from(document.querySelectorAll('[data-player-shell]'));

    shells.forEach((shell) => {
        const video = shell.querySelector('[data-video-src]');
        const trigger = shell.querySelector('[data-play-trigger]');

        if (!video) {
            return;
        }

        const play = async () => {
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            await prepareVideo(video);
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    video.controls = true;
                });
            }
        };

        if (trigger) {
            trigger.addEventListener('click', play);
        }

        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            }
        });
    });
}

async function prepareVideo(video) {
    if (video.dataset.ready === '1') {
        return;
    }

    const source = video.dataset.videoSrc;

    if (!source) {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.ready = '1';
        return;
    }

    const Hls = await loadHls();

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.ready = '1';
        video._hls = hls;
        return;
    }

    video.src = source;
    video.dataset.ready = '1';
}

async function loadHls() {
    if (!state.hlsModulePromise) {
        state.hlsModulePromise = import('./hls-vendor-dru42stk.js').then((module) => module.H);
    }

    return state.hlsModulePromise;
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
