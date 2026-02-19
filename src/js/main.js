/* ==========================================================================
   Canvasly Clone — Main JavaScript
   Lenis smooth scroll + GSAP animations replacing Webflow IX2
   ========================================================================== */

import '../css/style.css';

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
  if (typeof Draggable !== 'undefined') gsap.registerPlugin(Draggable);
  if (typeof InertiaPlugin !== 'undefined') gsap.registerPlugin(InertiaPlugin);
  if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Header stays fixed/visible — original Canvasly has no scroll hide/show

  // ==========================================================================
  // MENU TOGGLE — Smooth GSAP height animation
  // ==========================================================================
  var menuButton = document.getElementById('menuButton');
  var menuOverlay = document.getElementById('menuOverlay');
  var menuLinks = menuOverlay ? menuOverlay.querySelectorAll('.menu-link') : [];
  var menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menuButton.classList.add('is-open');
    lenis.stop();
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
        lenis.start();
      }
    });
  }

  if (menuButton && menuOverlay) {
    menuButton.addEventListener('click', function () {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // ==========================================================================
  // MENU LINK — Skew hover (IX2 a-288)
  // ==========================================================================
  document.querySelectorAll('.menu-link').forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      gsap.to(link, { skewX: -18, duration: 0.4, ease: 'power2.out' });
    });
    link.addEventListener('mouseleave', function () {
      gsap.to(link, { skewX: 0, duration: 0.3, ease: 'power2.in' });
    });
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
  // HERO — Card fan entrance with resting rotations (IX2 a-457 rest state)
  // ==========================================================================
  var heroCards = document.querySelectorAll('.home-hero-card-item');
  var heroRestRotations = [-9, 6.5, -5.5, 5, -4.5];

  if (heroCards.length === 5) {
    // Set initial hidden state
    gsap.set(heroCards, { y: 120, opacity: 0, scale: 0.85, rotation: 0 });

    // Animate in — each card ends at its individual resting rotation
    heroTl.to(heroCards, {
      y: 0, opacity: 1, scale: 1,
      rotation: function (i) { return heroRestRotations[i]; },
      stagger: { each: 0.1, from: 'center' },
      duration: 1.2, ease: 'power3.out'
    }, 0.5);
  } else if (heroCards.length > 0) {
    heroTl.from(heroCards, {
      y: 120, opacity: 0, scale: 0.85,
      stagger: { each: 0.1, from: 'center' },
      duration: 1.2, ease: 'power3.out'
    }, 0.5);
  }

  // ==========================================================================
  // HERO — Card hover spread (IX2 a-449 through a-454)
  // When one card is hovered, all cards spread apart. Nearest neighbor
  // is pushed furthest (66%), decreasing with distance.
  // ==========================================================================
  if (heroCards.length === 5) {
    var heroHoverSpreads = [
      [0, 66, 33, 22, 16.5],
      [-66, 0, 66, 33, 22],
      [-33, -66, 0, 66, 33],
      [-22, -33, -66, 0, 66],
      [-16.5, -22, -33, -66, 0]
    ];
    var heroCardRow = document.querySelector('.home-hero-card-row');

    heroCards.forEach(function (card, hoveredIdx) {
      card.addEventListener('mouseenter', function () {
        heroCards.forEach(function (otherCard, j) {
          gsap.to(otherCard, {
            xPercent: heroHoverSpreads[hoveredIdx][j],
            rotation: 0,
            scale: (j === hoveredIdx) ? 1.1 : 1,
            duration: 0.5, ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      });
    });

    if (heroCardRow) {
      heroCardRow.addEventListener('mouseleave', function () {
        heroCards.forEach(function (card, i) {
          gsap.to(card, {
            xPercent: 0, scale: 1,
            rotation: heroRestRotations[i],
            duration: 0.5, ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      });
    }
  }

  // ==========================================================================
  // HEADER — Fade in (matches original IX2 action a-364)
  // IX2 only fades opacity on the two container divs — no transforms.
  // ==========================================================================
  gsap.set(['.header-content-left', '.header-content-right'], { opacity: 0 });
  heroTl.to(['.header-content-left', '.header-content-right'], {
    opacity: 1,
    duration: 0.75, ease: 'power2.out',
    clearProps: 'opacity'
  }, 0.65);

  // ==========================================================================
  // SECTION HEADINGS — Skew reveal on scroll (IX2 a-401/402/412/413/477/478)
  // Heading text slides up from below with slight skewY.
  // Container overflow:hidden clips the reveal.
  // ==========================================================================
  gsap.utils.toArray('.section-header-heading-box').forEach(function (box) {
    var heading = box.querySelector('h2, h1');
    if (!heading) return;
    if (box.closest('.section-header-text-box.for-hero')) return;
    if (box.classList.contains('for-about')) return;

    gsap.set(heading, { yPercent: 100, skewY: 3 });
    gsap.to(heading, {
      yPercent: 0, skewY: 0,
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: box, start: 'top 85%', once: true }
    });
  });

  // ==========================================================================
  // ABOUT BIG TEXT — SplitText per-char fading on scroll
  // ==========================================================================
  var fadingCharsBlock = document.querySelector('[gsap="fading-chars"]');
  if (fadingCharsBlock) {
    fadingCharsBlock.classList.add('is-revealed');

    if (typeof SplitText !== 'undefined') {
      var textElements = fadingCharsBlock.querySelectorAll('.text-fill-animation-text');
      var allChars = [];
      textElements.forEach(function (el) {
        var split = new SplitText(el, { type: 'chars' });
        allChars = allChars.concat(split.chars);
      });

      gsap.set(allChars, { opacity: 0.15 });

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
  // HORIZONTAL LINE — Grow on scroll (IX2 a-380)
  // ==========================================================================
  gsap.utils.toArray('.home-hero-card-sp-line').forEach(function (line) {
    gsap.from(line, {
      width: 0,
      duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: line, start: 'top 90%', once: true }
    });
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
  // CIRCLE CAROUSEL — Scroll-linked rotation + Draggable
  // ==========================================================================
  var circleWrapper = document.querySelector('.circle-wrapper');
  if (circleWrapper) {
    gsap.from('.circle-item', {
      scale: 0.8, opacity: 0, stagger: 0.05,
      duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: circleWrapper, start: 'top 85%', once: true }
    });

    // Scroll-linked rotation
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

    // Draggable rotation with inertia + drag cursor (IX2 a-443/444)
    var circleCardWrapper = document.querySelector('.circle-card-wrapper');
    if (typeof Draggable !== 'undefined') {
      Draggable.create(circleWrapper, {
        type: 'rotation',
        inertia: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
        onDragStart: function () {
          if (circleCardWrapper) circleCardWrapper.classList.add('is-dragging');
        },
        onDragEnd: function () {
          if (circleCardWrapper) circleCardWrapper.classList.remove('is-dragging');
        }
      });
    }
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
  // SERVICES — Scroll-linked entrance with rotation (IX2 a-475)
  // Each service card has its own scroll trigger with rotation entrance.
  // Section heading handled by generic skew reveal above.
  // ==========================================================================
  document.querySelectorAll('.service-list-item').forEach(function (item, i) {
    gsap.from(item, {
      y: 60, opacity: 0,
      rotation: 3 * (i % 2 === 0 ? 1 : -1),
      scale: 0.96,
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 85%', once: true }
    });
  });

  // ==========================================================================
  // TESTIMONIALS — Cards with resting rotations + hover spread (IX2 a-423-428)
  // Section heading handled by generic skew reveal above.
  // ==========================================================================
  var testimonialItems = document.querySelectorAll('.testimonial-list-item');
  var testimonialRestRotations = [-9, -4.5, 5, -5.5, 6.5];
  var testimonialList = document.querySelector('.testimonial-list');

  if (testimonialItems.length === 5) {
    // Set initial hidden state with rotation:0, animate to resting rotations
    gsap.set(testimonialItems, { y: 40, opacity: 0, rotation: 0 });
    gsap.to(testimonialItems, {
      y: 0, opacity: 1,
      rotation: function (i) { return testimonialRestRotations[i]; },
      stagger: 0.1,
      duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.testimonial-list', start: 'top 85%', once: true }
    });

    // Hover spread — same pattern as hero cards
    var testimonialHoverSpreads = [
      [0, 66, 33, 22, 16.5],
      [-66, 0, 66, 33, 22],
      [-33, -66, 0, 66, 33],
      [-22, -33, -66, 0, 66],
      [-16.5, -22, -33, -66, 0]
    ];

    testimonialItems.forEach(function (item, hoveredIdx) {
      item.addEventListener('mouseenter', function () {
        testimonialItems.forEach(function (otherItem, j) {
          gsap.to(otherItem, {
            xPercent: testimonialHoverSpreads[hoveredIdx][j],
            rotation: 0,
            scale: (j === hoveredIdx) ? 1.05 : 1,
            duration: 0.5, ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      });
    });

    if (testimonialList) {
      testimonialList.addEventListener('mouseleave', function () {
        testimonialItems.forEach(function (item, i) {
          gsap.to(item, {
            xPercent: 0, scale: 1,
            rotation: testimonialRestRotations[i],
            duration: 0.5, ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      });
    }
  } else if (testimonialItems.length > 0) {
    gsap.from(testimonialItems, {
      y: 40, opacity: 0, stagger: 0.1,
      duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.testimonial-list', start: 'top 85%', once: true }
    });
  }

  // Make testimonial list draggable horizontally
  if (testimonialList && typeof Draggable !== 'undefined') {
    Draggable.create(testimonialList, {
      type: 'x',
      inertia: true,
      bounds: function () {
        var parent = testimonialList.parentElement;
        var parentWidth = parent.offsetWidth;
        var listWidth = testimonialList.scrollWidth;
        return { minX: -(listWidth - parentWidth), maxX: 0 };
      },
      edgeResistance: 0.65,
      cursor: 'grab',
      activeCursor: 'grabbing'
    });
  }

  // ==========================================================================
  // PAGE THEME — Scroll-triggered dark transition for footer
  // On the original, the page-wrapper bg/color smoothly transitions
  // when the footer enters the viewport.
  // ==========================================================================
  var pageWrapper = document.querySelector('.page-wrapper');
  var footer = document.querySelector('.footer');
  if (pageWrapper && footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 80%',
      end: 'top 20%',
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        // Interpolate background: cotton-field (#f2f0e9) → coco's-black (#1a1c18)
        var r = Math.round(242 - p * (242 - 26));
        var g = Math.round(240 - p * (240 - 28));
        var b = Math.round(233 - p * (233 - 24));
        pageWrapper.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        // Interpolate text color: coco's-black (#1a1c18) → cotton-field (#f2f0e9)
        var tr = Math.round(26 + p * (242 - 26));
        var tg = Math.round(28 + p * (240 - 28));
        var tb = Math.round(24 + p * (233 - 24));
        pageWrapper.style.color = 'rgb(' + tr + ',' + tg + ',' + tb + ')';
      }
    });
  }

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
  // ==========================================================================
  var lightsWrapper = document.querySelector('.lights-wrapper');
  var lightsMaskSecondary = document.querySelector('.lights-masking.is-secondary');
  var lightsCursor = document.querySelector('.lights-cursor');

  if (lightsWrapper && lightsMaskSecondary) {
    lightsWrapper.addEventListener('mousemove', function (e) {
      var rect = lightsWrapper.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;

      lightsMaskSecondary.style.setProperty('--layout--footer-cursor-x', x + '%');
      lightsMaskSecondary.style.setProperty('--layout--footer-cursor-y', y + '%');

      // Move the golden glow cursor to follow mouse
      if (lightsCursor) {
        var px = e.clientX - rect.left;
        var py = e.clientY - rect.top;
        gsap.to(lightsCursor, {
          x: px - rect.width / 2,
          y: py - rect.height / 2,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }

  // ==========================================================================
  // P-BUTTON — Arrow hover + center text shift (IX2 a-455/456)
  // ==========================================================================
  document.querySelectorAll('.p-button').forEach(function (btn) {
    var leftArrow = btn.querySelector('.p-button-arrow-box.is-left');
    var rightArrow = btn.querySelector('.p-button-arrow-box.is-right');
    var centerBox = btn.querySelector('.p-button-center-box');

    if (!leftArrow || !rightArrow) return;

    btn.addEventListener('mouseenter', function () {
      gsap.to(rightArrow, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(leftArrow, { opacity: 0, x: '-100%', duration: 0.35, ease: 'power2.out' });
      if (centerBox) gsap.to(centerBox, { x: 4, duration: 0.35, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', function () {
      gsap.to(rightArrow, { opacity: 0, x: '-100%', duration: 0.3, ease: 'power2.in' });
      gsap.to(leftArrow, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.in' });
      if (centerBox) gsap.to(centerBox, { x: 0, duration: 0.3, ease: 'power2.in' });
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
