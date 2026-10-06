// Progressive enhancement only — every section is readable and every link works
// with this file absent, blocked or broken. Deliberately dependency-free and
// tiny, because the page is aimed at visitors on slow mainland connections.
(function () {
  'use strict';

  // Tells the inline head snippet that this file loaded and initialised, so its
  // self-heal timeout does not strip the reveal styling out from under us.
  window.__revealReady = true;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Reveal sections as they scroll into view -----------------------------
  var targets = document.querySelectorAll('.reveal');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    // No animation wanted, or no observer available: show everything at once.
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // one-shot: never re-hide on scroll up
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  // --- Give the sticky header a shadow once the page has moved --------------
  var header = document.querySelector('[data-header]');
  if (header) {
    var sync = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }
})();
