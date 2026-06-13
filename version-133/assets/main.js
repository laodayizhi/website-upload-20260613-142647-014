(function () {
  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");

  if (menuToggle && header) {
    menuToggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dots] button"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get("q") || "";
  var filterInput = document.querySelector("[data-filter-input]");

  if (filterInput && queryValue) {
    filterInput.value = queryValue;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCatalog() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    if (!cards.length) {
      return;
    }

    var keyword = normalize(document.querySelector("[data-filter-input]") && document.querySelector("[data-filter-input]").value);
    var region = normalize(document.querySelector("[data-region-filter]") && document.querySelector("[data-region-filter]").value);
    var type = normalize(document.querySelector("[data-type-filter]") && document.querySelector("[data-type-filter]").value);
    var year = normalize(document.querySelector("[data-year-filter]") && document.querySelector("[data-year-filter]").value);
    var visible = 0;

    cards.forEach(function (card) {
      var search = normalize(card.getAttribute("data-search"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var matched = true;

      if (keyword && search.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    var noResult = document.querySelector("[data-no-result]");

    if (noResult) {
      noResult.classList.toggle("is-visible", visible === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-input], [data-region-filter], [data-type-filter], [data-year-filter]")).forEach(function (control) {
    control.addEventListener("input", filterCatalog);
    control.addEventListener("change", filterCatalog);
  });

  filterCatalog();
})();
