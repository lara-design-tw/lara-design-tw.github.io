/* ───────────────────────────────────────────────
   Shared vanilla behaviour for every page:
   boot reveal · nav shrink · scroll-reveal · mobile menu
   (No window scroll listeners — IntersectionObserver only.)
   ─────────────────────────────────────────────── */
(function () {
  'use strict';

  /* nav shrink — sentinel at top of page, observed (no scroll handler) */
  function navShrink() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:48px;pointer-events:none;';
    document.body.appendChild(sentinel);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('shrink', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* scroll reveal — elements already in view reveal immediately (no dependency
     on an observer firing), the rest reveal as they scroll into view */
  function reveal() {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    els.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) {
        el.classList.add('in');   // already visible: show now, don't wait for a paint
      } else {
        io.observe(el);
      }
    });
  }

  /* mobile menu */
  function mobileMenu() {
    var burger = document.querySelector('.burger');
    var mnav = document.querySelector('.mnav');
    if (!burger || !mnav) return;
    var toggle = function (open) {
      burger.classList.toggle('open', open);
      mnav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { toggle(!mnav.classList.contains('open')); });
    mnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
  }

  function init() { navShrink(); reveal(); mobileMenu(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  /* expose reveal() so Vue-rendered nodes can re-register after mount */
  window.__laraReveal = reveal;
})();
