/* ==========================================================================
   Dodgeball School — Subpage JavaScript
   Non-scroll layout: menu + FAQ accordion + entrance animations
   ========================================================================== */

import '../css/style.css';

// ==========================================================================
// LOADER — fade out and reveal page once CSS + JS are ready
// ==========================================================================
(function () {
  var loader = document.getElementById('loader');
  if (loader) {
    var pw = document.querySelector('.page-wrapper');
    setTimeout(function () {
      if (pw) pw.style.opacity = '1';
      loader.style.opacity = '0';
      setTimeout(function () { loader.remove(); }, 400);
    }, 1000);
  } else {
    var pw = document.querySelector('.page-wrapper');
    if (pw) pw.style.opacity = '1';
  }
})();

(function () {
  'use strict';

  // ==========================================================================
  // MENU TOGGLE
  // ==========================================================================
  var menuButton = document.getElementById('menuButton');
  var menuOverlay = document.getElementById('menuOverlay');
  var menuLinks = menuOverlay ? menuOverlay.querySelectorAll('.menu-link') : [];
  var menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menuButton.classList.add('is-open');
    gsap.set(menuOverlay, { height: '100%', opacity: 1, pointerEvents: 'auto' });
    gsap.fromTo(menuLinks,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'power3.out', delay: 0.1 }
    );
  }

  function closeMenu() {
    gsap.to(menuLinks, {
      y: -30, opacity: 0, stagger: 0.03, duration: 0.4, ease: 'power2.in',
      onComplete: function () {
        gsap.set(menuOverlay, { height: '0%', opacity: 0, pointerEvents: 'none' });
        menuButton.classList.remove('is-open');
        gsap.set(menuLinks, { clearProps: 'all' });
        menuOpen = false;
      }
    });
  }

  if (menuButton && menuOverlay) {
    menuButton.addEventListener('click', function () {
      if (menuOpen) { closeMenu(); } else { openMenu(); }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // ==========================================================================
  // MENU LINK — Skew hover
  // ==========================================================================
  var allMenuLinks = document.querySelectorAll('.menu-link');
  allMenuLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      allMenuLinks.forEach(function (other) {
        if (other !== link) gsap.set(other, { skewX: 0 });
      });
      gsap.to(link, { skewX: -18, duration: 0.4, ease: 'power2.out' });
    });
    link.addEventListener('mouseleave', function () {
      gsap.to(link, { skewX: 0, duration: 0.3, ease: 'power2.in' });
    });
  });

  // ==========================================================================
  // FAQ ACCORDION — GSAP toggle
  // ==========================================================================
  document.querySelectorAll('.ds-faq').forEach(function (faq) {
    var head = faq.querySelector('.ds-faq-head');
    var body = faq.querySelector('.ds-faq-body');
    if (!head || !body) return;

    head.addEventListener('click', function () {
      var isOpen = faq.classList.contains('is-open');

      // Close all other open items in same list
      var parent = faq.parentElement;
      parent.querySelectorAll('.ds-faq.is-open').forEach(function (other) {
        if (other !== faq) {
          other.classList.remove('is-open');
          gsap.to(other.querySelector('.ds-faq-body'), {
            height: 0, duration: 0.35, ease: 'power2.inOut'
          });
        }
      });

      if (isOpen) {
        faq.classList.remove('is-open');
        gsap.to(body, { height: 0, duration: 0.35, ease: 'power2.inOut' });
      } else {
        faq.classList.add('is-open');
        gsap.set(body, { height: 'auto' });
        gsap.from(body, { height: 0, duration: 0.35, ease: 'power2.inOut' });
      }
    });
  });

  // ==========================================================================
  // ENTRANCE ANIMATIONS
  // ==========================================================================
  gsap.from('.aanbod-intro-inner', {
    y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2
  });

  gsap.from('.ds-faq', {
    y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, delay: 0.5
  });

})();
