/* ==========================================================================
   Canvasly Clone — Main JavaScript
   Lenis smooth scroll + GSAP animations replacing Webflow IX2
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // LENIS SMOOTH SCROLL
  // ==========================================================================
  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true
  });

  gsap.registerPlugin(ScrollTrigger);
  if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  // ==========================================================================
  // HEADER — Hide on scroll down, show on scroll up
  // ==========================================================================
  var header = document.querySelector('.header');
  var headerContent = header ? header.querySelector('.header-content') : null;
  var lastScrollY = 0;
  var scrollThreshold = 200;

  lenis.on('scroll', function (data) {
    if (!headerContent) return;
    var currentY = data.scroll;
    if (currentY > scrollThreshold) {
      if (currentY > lastScrollY) {
        // Scrolling down — hide
        headerContent.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up — show
        headerContent.style.transform = 'translateY(0)';
      }
    } else {
      headerContent.style.transform = 'translateY(0)';
    }
    lastScrollY = currentY;
  });

  // ==========================================================================
  // MENU TOGGLE
  // ==========================================================================
  var menuButton = document.getElementById('menuButton');
  var menuOverlay = document.getElementById('menuOverlay');
  var menuLinks = menuOverlay ? menuOverlay.querySelectorAll('.menu-link') : [];

  function openMenu() {
    menuOverlay.classList.add('is-open');
    menuButton.classList.add('is-open');
    gsap.fromTo(menuLinks,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'power3.out', delay: 0.15 }
    );
  }

  function closeMenu() {
    gsap.to(menuLinks, {
      y: -30, opacity: 0, stagger: 0.03, duration: 0.4, ease: 'power2.in',
      onComplete: function () {
        menuOverlay.classList.remove('is-open');
        menuButton.classList.remove('is-open');
        gsap.set(menuLinks, { clearProps: 'all' });
      }
    });
  }

  if (menuButton && menuOverlay) {
    menuButton.addEventListener('click', function () {
      if (menuOverlay.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOverlay && menuOverlay.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // ==========================================================================
  // HERO — Title + subtitle entrance
  // ==========================================================================
  var heroTl = gsap.timeline({ delay: 0.3 });

  heroTl.from('.heading-style-h1.hero', {
    y: 80, opacity: 0, filter: 'blur(6px)',
    duration: 1.4, ease: 'power3.out'
  });

  heroTl.from('.section-header-desc-box .text-size-large', {
    y: 30, opacity: 0,
    duration: 1, ease: 'power3.out'
  }, 0.6);

  // ==========================================================================
  // HERO — Card fan entrance
  // ==========================================================================
  var heroCards = document.querySelectorAll('.home-hero-card-item');
  if (heroCards.length > 0) {
    heroTl.from(heroCards, {
      y: 120, opacity: 0, scale: 0.85,
      stagger: { each: 0.1, from: 'center' },
      duration: 1.2, ease: 'power3.out'
    }, 0.5);
  }

  // ==========================================================================
  // HEADER — Sidebar nav + CTA entrance
  // ==========================================================================
  heroTl.from('.header-nav-link', {
    x: -30, opacity: 0, stagger: 0.08,
    duration: 0.7, ease: 'power3.out'
  }, 0.8);

  heroTl.from('.header-cta-circle', {
    scale: 0, opacity: 0,
    duration: 0.8, ease: 'back.out(1.7)'
  }, 1.2);

  heroTl.from('.nav-brand', {
    opacity: 0, y: -20,
    duration: 0.6, ease: 'power3.out'
  }, 0.4);

  heroTl.from('.menu-button', {
    opacity: 0, y: -20,
    duration: 0.6, ease: 'power3.out'
  }, 0.5);

  heroTl.from('.nav-company-box', {
    opacity: 0, y: 20,
    duration: 0.6, ease: 'power3.out'
  }, 0.9);

  // ==========================================================================
  // ABOUT BIG TEXT — SplitText per-char fading on scroll
  // ==========================================================================
  var fadingCharsBlock = document.querySelector('[gsap="fading-chars"]');
  if (fadingCharsBlock) {
    // Reveal the block (hidden by CSS until animation ready)
    fadingCharsBlock.classList.add('is-revealed');

    if (typeof SplitText !== 'undefined') {
      // Split all text elements into characters
      var textElements = fadingCharsBlock.querySelectorAll('.text-fill-animation-text');
      var allChars = [];
      textElements.forEach(function (el) {
        var split = new SplitText(el, { type: 'chars' });
        allChars = allChars.concat(split.chars);
      });

      // Set initial state — all chars start dim
      gsap.set(allChars, { opacity: 0.15 });

      // Animate chars to full opacity on scroll
      gsap.to(allChars, {
        opacity: 1,
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: fadingCharsBlock,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 1
        }
      });
    }

    // Inline avatar images entrance
    var avatarImages = fadingCharsBlock.querySelectorAll('.text-image-item');
    gsap.from(avatarImages, {
      scale: 0, opacity: 0,
      stagger: 0.1, duration: 0.6, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: fadingCharsBlock, start: 'top 75%', once: true }
    });
  }

  // ==========================================================================
  // ABOUT — Images parallax reveal
  // ==========================================================================
  var aboutImageBox = document.querySelector('.about-image-box');
  if (aboutImageBox) {
    var aboutImages = aboutImageBox.querySelectorAll('.about-image-item-box');
    aboutImages.forEach(function (img, i) {
      gsap.from(img, {
        y: 60 + i * 20, opacity: 0, scale: 0.95,
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: aboutImageBox, start: 'top 80%', once: true },
        delay: i * 0.15
      });
    });
  }

  gsap.from('.about-text-box', {
    y: 40, opacity: 0,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-text-box', start: 'top 85%', once: true }
  });

  // ==========================================================================
  // FEATURED WORK — Card stagger entrance
  // ==========================================================================
  gsap.from('.work-list-item', {
    y: 50, opacity: 0, stagger: 0.15,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.work-list-wrapper', start: 'top 82%', once: true }
  });

  // ==========================================================================
  // CIRCLE CAROUSEL — Scroll-linked rotation
  // ==========================================================================
  var circleWrapper = document.querySelector('.circle-wrapper');
  if (circleWrapper) {
    // Entrance animation
    gsap.from('.circle-item', {
      scale: 0.8, opacity: 0, stagger: 0.05,
      duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: circleWrapper, start: 'top 85%', once: true }
    });

    // Continuous slow rotation linked to scroll
    gsap.to(circleWrapper, {
      rotation: 120,
      ease: 'none',
      scrollTrigger: {
        trigger: '.work-cta-main-box',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  // "Explore our thinking" — scale entrance
  var ctaLoader = document.querySelector('.work-cta-heading-loader');
  if (ctaLoader) {
    gsap.from(ctaLoader, {
      scale: 0, opacity: 0,
      duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: ctaLoader, start: 'top 85%', once: true }
    });
  }

  // ==========================================================================
  // SERVICES — Section heading + card stagger
  // ==========================================================================
  gsap.from('.section.for-service .section-header-heading-box', {
    y: 40, opacity: 0,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.section.for-service', start: 'top 80%', once: true }
  });

  gsap.from('.service-list-item', {
    y: 60, opacity: 0, stagger: 0.2,
    duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '.service-list', start: 'top 80%', once: true }
  });

  // ==========================================================================
  // TESTIMONIALS — Heading + cards stagger
  // ==========================================================================
  gsap.from('.testimonial-main .section-header-heading-box', {
    y: 40, opacity: 0,
    duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.testimonial-main', start: 'top 85%', once: true }
  });

  gsap.from('.testimonial-list-item', {
    y: 40, opacity: 0, stagger: 0.1,
    duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.testimonial-list', start: 'top 85%', once: true }
  });

  // ==========================================================================
  // FOOTER CTA — Text + button entrance
  // ==========================================================================
  gsap.from('.lights-title', {
    y: 60, opacity: 0, filter: 'blur(4px)',
    duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.lights-masking', start: 'top 80%', once: true }
  });

  gsap.from('.lights-text-box .p-button', {
    y: 30, opacity: 0,
    duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.lights-masking', start: 'top 75%', once: true }
  });

  // ==========================================================================
  // FOOTER — Torch/flashlight cursor effect
  // Webflow CSS uses --layout--footer-cursor-x / --layout--footer-cursor-y
  // for the radial-gradient mask on .lights-masking.is-secondary
  // ==========================================================================
  var lightsWrapper = document.querySelector('.lights-wrapper');
  var lightsMaskSecondary = document.querySelector('.lights-masking.is-secondary');

  if (lightsWrapper && lightsMaskSecondary) {
    lightsWrapper.addEventListener('mousemove', function (e) {
      var rect = lightsWrapper.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;

      lightsMaskSecondary.style.setProperty('--layout--footer-cursor-x', x + '%');
      lightsMaskSecondary.style.setProperty('--layout--footer-cursor-y', y + '%');
    });
  }

  // ==========================================================================
  // P-BUTTON — Arrow hover animation (GSAP for smooth feel)
  // ==========================================================================
  document.querySelectorAll('.p-button').forEach(function (btn) {
    var leftArrow = btn.querySelector('.p-button-arrow-box.is-left');
    var rightArrow = btn.querySelector('.p-button-arrow-box.is-right');

    if (!leftArrow || !rightArrow) return;

    btn.addEventListener('mouseenter', function () {
      gsap.to(rightArrow, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(leftArrow, { opacity: 0, x: '-100%', duration: 0.35, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', function () {
      gsap.to(rightArrow, { opacity: 0, x: '-100%', duration: 0.3, ease: 'power2.in' });
      gsap.to(leftArrow, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.in' });
    });
  });

  // ==========================================================================
  // WORK CARDS — Hover image zoom + overlay (GSAP for smoothness)
  // ==========================================================================
  document.querySelectorAll('.work-card').forEach(function (card) {
    var img = card.querySelector('.cover-image');
    var layer = card.querySelector('.image-layer');
    var textFrame = card.querySelector('.work-card-text-frame');

    card.addEventListener('mouseenter', function () {
      if (img) gsap.to(img, { scale: 1.05, duration: 0.6, ease: 'power2.out' });
      if (layer) gsap.to(layer, { opacity: 0.6, duration: 0.4, ease: 'power2.out' });
      if (textFrame) gsap.to(textFrame, { y: 0, duration: 0.4, ease: 'power2.out' });
    });

    card.addEventListener('mouseleave', function () {
      if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
      if (layer) gsap.to(layer, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      if (textFrame) gsap.to(textFrame, { y: 8, duration: 0.3, ease: 'power2.out' });
    });
  });

  // ==========================================================================
  // HERO — Parallax on scroll
  // ==========================================================================
  gsap.to('.section-header-text-box.for-hero', {
    y: -80, opacity: 0,
    scrollTrigger: {
      trigger: '.home-hero-main',
      start: '30% top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.home-hero-card-row', {
    y: 60,
    scrollTrigger: {
      trigger: '.home-hero-main',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

})();
