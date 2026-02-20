/* ==========================================================================
   Canvasly Clone — Main JavaScript
   Lenis smooth scroll + GSAP animations replacing Webflow IX2
   ========================================================================== */

import '../css/style.css';

// ==========================================================================
// LOADER — fade out and reveal page once CSS + JS are ready
// ==========================================================================
(function () {
  var loader = document.getElementById('loader');
  if (loader) {
    var pw = document.querySelector('.page-wrapper');
    // Ensure loader bar animation finishes (1s) before fading out
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
  // SCROLL TO TOP ON LOAD — prevent browser restoring #hash position
  // ==========================================================================
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }
  window.scrollTo(0, 0);

  // ==========================================================================
  // LENIS SMOOTH SCROLL
  // ==========================================================================
  var isDesktop = window.matchMedia('(min-width: 1200px)').matches;
  var lenis = null;

  if (isDesktop) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof Draggable !== 'undefined') gsap.registerPlugin(Draggable);
  if (typeof InertiaPlugin !== 'undefined') gsap.registerPlugin(InertiaPlugin);
  if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
  gsap.ticker.lagSmoothing(0);

  // Handle URL hash on page load (e.g. from subpage menu links like /#ervaringen)
  if (window.location.hash) {
    var hashTarget = document.querySelector(window.location.hash);
    if (hashTarget) {
      // Delay to let page render + Lenis initialise
      setTimeout(function () {
        if (lenis) {
          lenis.scrollTo(hashTarget, { duration: 1.2, offset: 0 });
        } else {
          hashTarget.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1200);
    }
  }

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
    if (lenis) lenis.stop();
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
        if (lenis) lenis.start();
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
  var allMenuLinks = document.querySelectorAll('.menu-link');
  allMenuLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      // Reset all other links immediately so only hovered one is skewed
      allMenuLinks.forEach(function (other) {
        if (other !== link) gsap.set(other, { skewX: 0 });
      });
      gsap.to(link, { skewX: -18, duration: 0.4, ease: 'power2.out' });
    });
    link.addEventListener('mouseleave', function () {
      gsap.to(link, { skewX: 0, duration: 0.3, ease: 'power2.in' });
    });
  });

  // All anchor links: close menu if open, then smooth scroll
  document.querySelectorAll('.menu-link[href^="#"], .header-nav-link[href^="#"], .header-cta-circle[href^="#"], .sf-link[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      function doScroll() {
        if (lenis) {
          lenis.start();
          lenis.scrollTo(target, { duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }

      if (menuOpen) {
        closeMenu();
        // Wait for close animation to finish, then scroll
        setTimeout(doScroll, 500);
      } else {
        doScroll();
      }
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
  // Desktop only — on mobile, Webflow CSS hides cards and stacks remaining.
  // ==========================================================================
  var heroCards = document.querySelectorAll('.home-hero-card-item');
  var heroRestRotations = [-9, 6.5, -5.5, 5, -4.5];
  var isTabletUp = window.matchMedia('(min-width: 768px)').matches;

  if (isTabletUp && heroCards.length === 5) {
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
    // Mobile/tablet: simple fade-in, no fan rotation
    var visibleCards = Array.from(heroCards).filter(function (c) {
      return getComputedStyle(c).display !== 'none';
    });
    if (visibleCards.length > 0) {
      heroTl.from(visibleCards, {
        y: 60, opacity: 0,
        stagger: { each: 0.1, from: 'center' },
        duration: 1, ease: 'power3.out'
      }, 0.5);
    }
  }

  // ==========================================================================
  // HERO — Card hover spread (IX2 a-449 through a-454)
  // Desktop only — no hover spread on touch devices.
  // ==========================================================================
  if (isTabletUp && heroCards.length === 5) {
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
            rotation: (j === hoveredIdx) ? 0 : heroRestRotations[j],
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
  // SECTION HEADINGS — Fade-slide reveal on scroll (IX2 a-401/402/412/413/477/478)
  // Uses opacity + translateY instead of overflow:hidden to avoid clipping
  // descenders (g, j, y) on Dutch text.
  // ==========================================================================
  gsap.utils.toArray('.section-header-heading-box').forEach(function (box) {
    var heading = box.querySelector('h2, h1');
    if (!heading) return;
    if (box.closest('.section-header-text-box.for-hero')) return;
    if (box.classList.contains('for-about')) return;

    gsap.set(heading, { opacity: 0, yPercent: 40, skewY: 2 });
    gsap.to(heading, {
      opacity: 1, yPercent: 0, skewY: 0,
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
        var split = new SplitText(el, { type: 'words,chars' });
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

  var aboutTextBox = document.querySelector('.about-text-box');
  if (aboutTextBox) {
    var aboutTextParts = aboutTextBox.querySelectorAll('.section-header-heading-box, .section-header-desc-box, .section-header-button-box');
    if (aboutTextParts.length) {
      gsap.from(aboutTextParts, {
        y: 40, opacity: 0,
        stagger: 0.2,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: aboutTextBox, start: 'top 85%', once: true }
      });
    }
  }

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
  // SERVICES — Desktop: stacking cards with scale + rotate + blur (IX2 a-475)
  // Mobile: horizontal carousel (CSS handles layout, no stacking needed)
  // ==========================================================================
  var serviceItems = gsap.utils.toArray('.service-list-item');
  serviceItems.forEach(function (item, i) {
    // Ascending z-index so later cards stack on top of earlier ones
    if (isDesktop) item.style.zIndex = i + 1;

    // Entrance animation (both desktop and mobile)
    gsap.from(item, {
      y: isDesktop ? 60 : 30, opacity: 0,
      rotation: isDesktop ? 3 * (i % 2 === 0 ? 1 : -1) : 0,
      scale: 0.96,
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 85%', once: true }
    });

    // Scroll-linked exit: desktop only (mobile uses horizontal carousel)
    if (isDesktop && i < serviceItems.length - 1) {
      (function (el) {
        function clearStyles() {
          el.style.transform = '';
          el.style.transformOrigin = '';
          el.style.filter = '';
        }
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: function () { return '+=' + Math.round(el.offsetHeight * 1.5); },
          onUpdate: function (self) {
            var p = self.progress;
            if (p <= 0) {
              clearStyles();
            } else {
              el.style.transformOrigin = 'center top';
              el.style.transform = 'scale(' + (1 - 0.05 * p) + ')';
              el.style.filter = 'blur(' + (3 * p) + 'px)';
            }
          },
          onLeaveBack: clearStyles
        });
      })(item);
    }
  });

  // ==========================================================================
  // SERVICES — Make entire card clickable (link to aanbod page)
  // ==========================================================================
  document.querySelectorAll('.service-card-content').forEach(function (card) {
    var link = card.querySelector('.ds-btn');
    if (!link) return;
    card.style.cursor = 'pointer';
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      window.location.href = link.href;
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
    if (isDesktop) {
      // Desktop: fanned layout with resting rotations
      gsap.set(testimonialItems, { y: 40, opacity: 0, rotation: 0 });
      gsap.to(testimonialItems, {
        y: 0, opacity: 1,
        rotation: function (i) { return testimonialRestRotations[i]; },
        stagger: 0.1,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonial-list', start: 'top 85%', once: true }
      });
    } else {
      // Mobile: clean horizontal carousel, no rotations
      gsap.set(testimonialItems, { rotation: 0, x: 0, xPercent: 0 });
      gsap.from(testimonialItems, {
        y: 20, opacity: 0, stagger: 0.08,
        duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonial-list', start: 'top 85%', once: true }
      });
    }

    // Hover spread — desktop only
    if (isDesktop) {
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
              rotation: (j === hoveredIdx) ? 0 : testimonialRestRotations[j],
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
    }
  } else if (testimonialItems.length > 0) {
    gsap.from(testimonialItems, {
      y: 40, opacity: 0, stagger: 0.1,
      duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.testimonial-list', start: 'top 85%', once: true }
    });
  }

  // Make testimonial list draggable — desktop only.
  // On mobile, native overflow:auto scroll handles horizontal swiping.
  if (isDesktop && testimonialList && typeof Draggable !== 'undefined') {
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
  // SWIPE HINTS — Show "Swipe ›" below carousels on mobile/tablet
  // ==========================================================================
  if (!isDesktop) {
    function createSwipeHint(scrollContainer) {
      if (!scrollContainer) return;
      var hint = document.createElement('div');
      hint.className = 'swipe-hint';
      hint.innerHTML = '<div class="swipe-hint-inner">Swipe <span class="swipe-hint-chevron">\u203A</span></div>';
      scrollContainer.parentElement.insertBefore(hint, scrollContainer.nextSibling);

      function hideHint() { hint.classList.add('is-hidden'); }
      scrollContainer.addEventListener('scroll', hideHint, { once: true });
      scrollContainer.addEventListener('touchstart', hideHint, { once: true });
    }

    createSwipeHint(document.querySelector('.service-list'));
    createSwipeHint(document.querySelector('.testimonial-main'));
  }

  // ==========================================================================
  // PAGE THEME — Scroll-triggered dark transition for footer
  // On the original, the page-wrapper bg/color smoothly transitions
  // when the footer enters the viewport.
  // ==========================================================================
  var pageWrapper = document.querySelector('.page-wrapper');
  var footer = document.querySelector('.footer');
  var headerEl = document.querySelector('.header');
  var menuBtn = document.querySelector('.menu-button');
  var navLogo = document.querySelector('.nav-brand-logo');
  var navCompany = document.querySelector('.nav-company-box');
  var navLinks = document.querySelectorAll('.header-nav-link');
  var navIconBoxes = document.querySelectorAll('.header-nav-icon-box');
  var navTextBoxes = document.querySelectorAll('.header-nav-text-box');
  if (pageWrapper && footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 95%',
      end: 'top 60%',
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        // Interpolate background: #F0EEE7 → #141414
        var r = Math.round(240 - p * (240 - 20));
        var g = Math.round(238 - p * (238 - 20));
        var b = Math.round(231 - p * (231 - 20));
        var bgColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        pageWrapper.style.backgroundColor = bgColor;
        // Interpolate text color: #141414 → #F0EEE7
        var tr = Math.round(20 + p * (240 - 20));
        var tg = Math.round(20 + p * (238 - 20));
        var tb = Math.round(20 + p * (231 - 20));
        var textColor = 'rgb(' + tr + ',' + tg + ',' + tb + ')';
        pageWrapper.style.color = textColor;
        // Header color (inherited by some children)
        if (headerEl) {
          headerEl.style.color = textColor;
        }
        // Menu button: invert bg/text
        if (menuBtn) {
          menuBtn.style.backgroundColor = textColor;
          menuBtn.style.color = bgColor;
        }
        // Logo: img tag → invert on dark bg (brightness doesn't work on pure black)
        if (navLogo) {
          navLogo.style.filter = 'invert(' + p + ')';
        }
        // "Canvasly creative" company text
        if (navCompany) {
          navCompany.style.color = textColor;
        }
        // Sidebar nav: links have own color via CSS var, override directly
        navLinks.forEach(function (link) {
          link.style.color = textColor;
        });
        // Sidebar nav icon + text boxes: bg → subtle light on dark
        var boxBg = 'rgba(' + tr + ',' + tg + ',' + tb + ',' + (0.08 + p * 0.04) + ')';
        navIconBoxes.forEach(function (box) { box.style.backgroundColor = boxBg; });
        navTextBoxes.forEach(function (box) { box.style.backgroundColor = boxBg; });
      }
    });
  }

  // ==========================================================================
  // FOOTER — Multi-step contact form
  // ==========================================================================
  var stepForm = document.getElementById('contactForm');
  if (stepForm) {
    var slides = stepForm.querySelectorAll('.step-slide');
    var progressBar = stepForm.querySelector('.step-progress-bar');
    var backBtn = document.getElementById('stepBack');
    var nextBtn = document.getElementById('stepNext');
    var submitBtn = document.getElementById('stepSubmit');
    var successEl = document.getElementById('stepSuccess');
    var counterEl = document.getElementById('stepCounter');
    var headerEl = stepForm.querySelector('.step-header');
    var currentStep = 1;
    var totalSteps = slides.length;

    function goToStep(n) {
      currentStep = n;
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      var target = stepForm.querySelector('[data-step="' + n + '"]');
      if (target) {
        target.classList.add('is-active');
        var firstInput = target.querySelector('.step-input');
        if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
      }
      progressBar.style.width = Math.round((n / totalSteps) * 100) + '%';
      counterEl.textContent = String(n).padStart(2, '0') + ' / ' + String(totalSteps).padStart(2, '0');
      backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
      if (n === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = '';
      } else {
        nextBtn.style.display = '';
        submitBtn.style.display = 'none';
      }
    }

    nextBtn.addEventListener('click', function () {
      var active = stepForm.querySelector('.step-slide.is-active');
      var required = active.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (inp) {
        if (!inp.value.trim()) {
          valid = false;
          inp.classList.add('is-error');
          inp.focus();
        } else {
          inp.classList.remove('is-error');
        }
      });
      // Email format validation on step 3
      if (currentStep === 3) {
        var emailInput = active.querySelector('[name="email"]');
        if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
          valid = false;
          emailInput.classList.add('is-error');
          emailInput.focus();
        }
      }
      if (valid && currentStep < totalSteps) goToStep(currentStep + 1);
    });

    // Clear error state on input
    stepForm.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-error')) {
        e.target.classList.remove('is-error');
      }
    });

    backBtn.addEventListener('click', function () {
      if (currentStep > 1) goToStep(currentStep - 1);
    });

    stepForm.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (currentStep < totalSteps) nextBtn.click();
        else submitBtn.click();
      }
    });

    // +/- stepper buttons
    var stepperBtns = stepForm.querySelectorAll('.step-stepper-btn');
    stepperBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('.step-stepper-input');
        var val = parseInt(input.value) || 1;
        if (btn.dataset.action === 'increment') {
          input.value = val + 1;
        } else if (btn.dataset.action === 'decrement' && val > 1) {
          input.value = val - 1;
        }
      });
    });

    // Datum "Nog niet bekend" checkbox
    var datumNtb = document.getElementById('datumNtb');
    var datumInput = document.getElementById('datumInput');
    if (datumNtb && datumInput) {
      datumNtb.addEventListener('change', function () {
        if (datumNtb.checked) {
          datumInput.disabled = true;
          datumInput.value = '';
          datumInput.classList.add('is-disabled');
        } else {
          datumInput.disabled = false;
          datumInput.classList.remove('is-disabled');
        }
      });
    }

    stepForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Collect form data
      var formData = new FormData(stepForm);
      var data = {};
      formData.forEach(function (value, key) { data[key] = value; });
      if (datumNtb && datumNtb.checked) {
        data.datum = 'Nog niet bekend';
      }

      // Send to backend (placeholder — replace with actual endpoint)
      var endpoint = '/api/contact';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(function () {
        // Silently handle — backend not configured yet
      });

      // Show success state
      slides.forEach(function (s) { s.classList.remove('is-active'); });
      stepForm.querySelector('.step-nav').style.display = 'none';
      if (headerEl) headerEl.style.display = 'none';
      var introEl = document.querySelector('.step-intro');
      if (introEl) introEl.style.display = 'none';
      successEl.style.display = '';
      progressBar.style.width = '100%';
    });

    gsap.from('.step-intro', {
      y: 40, opacity: 0,
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.footer-inner', start: 'top 80%', once: true }
    });
    gsap.from('.step-form', {
      y: 50, opacity: 0,
      duration: 1, ease: 'power3.out', delay: 0.15,
      scrollTrigger: { trigger: '.footer-inner', start: 'top 80%', once: true }
    });

    // Hide CTA circle + sidebar when in footer contact section
    var ctaCircle = document.querySelector('.header-cta-circle');
    var sidebarNav = document.querySelector('.nav-content-wrapper');
    var sidebarLogo = document.querySelector('.nav-company-box');
    if (ctaCircle) {
      ScrollTrigger.create({
        trigger: '.footer',
        start: 'top 80%',
        end: 'bottom top',
        onEnter: function () {
          gsap.to(ctaCircle, { opacity: 0, scale: 0.8, duration: 0.3, pointerEvents: 'none' });
          if (sidebarNav) gsap.to(sidebarNav, { opacity: 0, x: -20, duration: 0.3, pointerEvents: 'none' });
          if (sidebarLogo) gsap.to(sidebarLogo, { opacity: 0, x: -20, duration: 0.3, pointerEvents: 'none' });
        },
        onLeaveBack: function () {
          gsap.to(ctaCircle, { opacity: 1, scale: 1, duration: 0.3, pointerEvents: 'auto' });
          if (sidebarNav) gsap.to(sidebarNav, { opacity: 1, x: 0, duration: 0.3, pointerEvents: 'auto' });
          if (sidebarLogo) gsap.to(sidebarLogo, { opacity: 1, x: 0, duration: 0.3, pointerEvents: 'auto' });
        }
      });
    }
  }

  // (p-button arrow animation removed — replaced by .ds-btn)


  // ==========================================================================
  // SITE FOOTER — Staggered entrance for columns, divider, bottom bar
  // ==========================================================================
  var siteFooter = document.querySelector('.site-footer');
  if (siteFooter) {
    var sfCols = siteFooter.querySelectorAll('.sf-col');
    gsap.from(sfCols, {
      y: 30, opacity: 0,
      stagger: 0.1,
      duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: siteFooter, start: 'top 90%', once: true }
    });

    var sfDivider = siteFooter.querySelector('.sf-divider');
    if (sfDivider) {
      gsap.from(sfDivider, {
        scaleX: 0,
        duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: sfDivider, start: 'top 95%', once: true }
      });
    }

    var sfBottom = siteFooter.querySelector('.sf-bottom');
    if (sfBottom) {
      gsap.from(sfBottom, {
        y: 20, opacity: 0,
        duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: sfBottom, start: 'top 95%', once: true }
      });
    }
  }

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
