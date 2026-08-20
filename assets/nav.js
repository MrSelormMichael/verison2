(function () {
  "use strict";

  /* header shadow */
  var header = document.querySelector("[data-header]");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  document.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* mobile nav */
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* spread slider */
  var spread = document.querySelector("[data-spread]");
  if (!spread) return;

  var slides = Array.prototype.slice.call(spread.querySelectorAll("[data-spread-slide]"));
  var prevBtn = spread.querySelector("[data-spread-prev]");
  var nextBtn = spread.querySelector("[data-spread-next]");
  var currentLabel = spread.querySelector("[data-spread-current]");
  var totalLabel = spread.querySelector("[data-spread-total]");
  var railFill = spread.querySelector("[data-spread-fill]");

  var index = 0;
  var total = slides.length;
  var AUTOPLAY_MS = 6500;
  var autoplayTimer = null;

  if (totalLabel) totalLabel.textContent = String(total).padStart(2, "0");

  function pad(n) { return String(n + 1).padStart(2, "0"); }

  function goTo(newIndex, opts) {
    opts = opts || {};
    index = ((newIndex % total) + total) % total;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });

    if (currentLabel) currentLabel.textContent = pad(index);
    if (railFill) {
      var step = 100 / total;
      railFill.style.width = step + "%";
      railFill.style.transform = "translateX(" + index * 100 + "%)";
    }
    if (!opts.silent) restartAutoplay();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, AUTOPLAY_MS);
  }

  spread.addEventListener("mouseenter", function () {
    if (autoplayTimer) clearInterval(autoplayTimer);
  });
  spread.addEventListener("mouseleave", restartAutoplay);

  /* swipe */
  var startX = null;
  var dragging = false;

  function dragStart(x) { dragging = true; startX = x; }
  function dragEnd(x) {
    if (!dragging || startX === null) return;
    var delta = x - startX;
    if (Math.abs(delta) > 44) {
      delta < 0 ? next() : prev();
    }
    dragging = false;
    startX = null;
  }

  spread.addEventListener("touchstart", function (e) { dragStart(e.touches[0].clientX); }, { passive: true });
  spread.addEventListener("touchend", function (e) { dragEnd(e.changedTouches[0].clientX); });

  var mouseIsDown = false;
  spread.addEventListener("mousedown", function (e) { mouseIsDown = true; dragStart(e.clientX); });
  window.addEventListener("mouseup", function (e) {
    if (mouseIsDown) dragEnd(e.clientX);
    mouseIsDown = false;
  });

  /* keyboard */
  spread.setAttribute("tabindex", "0");
  spread.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  goTo(0, { silent: true });
  restartAutoplay();
})();