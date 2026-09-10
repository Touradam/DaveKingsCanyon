/**
 * Kings Canyon Land - Midnight Champagne Interactions
 * Nav, hero effects, scroll reveal, lightbox, concept image cycling, map POI data
 */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DESKTOP_NAV = 901;

  /* --- DOM References --- */
  var header = document.getElementById("site-header");
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var navLinks = document.querySelectorAll(".nav-link");
  var hero = document.getElementById("hero");
  var heroSpotlight = document.getElementById("hero-spotlight");
  var heroParticles = document.getElementById("hero-particles");
  var revealElements = document.querySelectorAll("[data-reveal]");
  var tiltElements = document.querySelectorAll("[data-tilt]");
  var cycleImages = document.querySelectorAll("img[data-cycle-images]");
  var lightboxButtons = document.querySelectorAll("[data-lightbox-src]");
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var lightboxCounter = document.getElementById("lightbox-counter");
  var footerYear = document.getElementById("footer-year");

  var lightboxTrigger = null;
  var lightboxGallery = null;
  var lightboxIndex = 0;
  var scrollTicking = false;

  /* Hero parallax state */
  var heroMedia = hero ? hero.querySelector(".hero-media") : null;
  var heroContent = hero ? hero.querySelector(".hero-content") : null;
  var parallaxQuery = window.matchMedia("(min-width: 768px)");
  var parallaxOn = false;

  /*
   * Map points of interest for Google My Maps custom embed.
   * TODO: Create a map at https://www.google.com/maps/d/ with these markers,
   * then replace the iframe src in index.html with the My Maps embed URL.
   */
  window.mapPointsOfInterest = [
    {
      name: "Snowline Lodge (Property)",
      address: "44138 E Kings Canyon Road, Dunlap, CA 93621",
      lat: 36.7614,
      lng: -119.1025,
    },
    {
      name: "General Grant Grove",
      lat: 36.7489,
      lng: -118.9734,
    },
    {
      name: "Kings Canyon National Park Entrance",
      lat: 36.7889,
      lng: -118.6753,
    },
    {
      name: "Sequoia National Park / General Sherman",
      lat: 36.5649,
      lng: -118.7725,
    },
    {
      name: "Boyden Caverns",
      lat: 36.8331,
      lng: -118.9667,
    },
    {
      name: "Cedar Grove",
      lat: 36.7942,
      lng: -118.5553,
    },
    {
      name: "Kings River",
      lat: 36.8200,
      lng: -118.6800,
    },
  ];

  /* --- Utility --- */
  function isFinePointer() {
    return window.matchMedia("(pointer: fine)").matches;
  }

  /* --- Footer Year --- */
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* --- Sticky Header --- */
  function updateHeaderScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  }

  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateHeaderScroll();
        updateParallax();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  updateHeaderScroll();

  /* --- Mobile Navigation --- */
  function openNav() {
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
    siteNav.classList.add("is-open");
    document.body.classList.add("nav-open");
  }

  function closeNav() {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth < DESKTOP_NAV) {
          closeNav();
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* --- Hero Spotlight --- */
  if (hero && heroSpotlight && !prefersReducedMotion && isFinePointer()) {
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--spotlight-x", x + "%");
      hero.style.setProperty("--spotlight-y", y + "%");
      hero.classList.add("is-spotlight-active");
    });

    hero.addEventListener("mouseleave", function () {
      hero.classList.remove("is-spotlight-active");
    });
  }

  /* --- Hero Particles --- */
  if (heroParticles && !prefersReducedMotion) {
    var particleCount = window.innerWidth < 640 ? 8 : 14;

    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement("span");
      particle.className = "hero-particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = 40 + Math.random() * 60 + "%";
      particle.style.setProperty("--particle-duration", 10 + Math.random() * 8 + "s");
      particle.style.setProperty("--particle-delay", Math.random() * 6 + "s");
      particle.style.width = particle.style.height = 2 + Math.random() * 2 + "px";
      heroParticles.appendChild(particle);
    }
  }

  /* --- Hero Parallax ---
     Layered depth on scroll: the image drifts down slowly while the
     content rises and gently fades. Desktop only, since the effect is
     simplified away on small screens and under reduced motion. */
  function updateParallax() {
    if (!parallaxOn || !hero) return;
    var heroHeight = hero.offsetHeight;
    var scrolled = window.scrollY;
    if (scrolled > heroHeight) return;
    var progress = Math.min(scrolled / heroHeight, 1);
    heroMedia.style.transform =
      "translate3d(0," + (progress * 5).toFixed(2) + "%,0) scale(1.12)";
    heroContent.style.transform =
      "translate3d(0," + (progress * -36).toFixed(1) + "px,0)";
    heroContent.style.opacity = (1 - progress * 0.85).toFixed(3);
  }

  function syncParallax() {
    var canRun = !!(hero && heroMedia && heroContent);
    var shouldEnable = canRun && parallaxQuery.matches && !prefersReducedMotion;
    if (shouldEnable === parallaxOn) return;
    parallaxOn = shouldEnable;

    if (parallaxOn) {
      hero.classList.add("is-parallax");
      // Parallax owns the hero content transform, so hand its reveal over
      if (heroContent.hasAttribute("data-reveal")) {
        heroContent.removeAttribute("data-reveal");
        heroContent.setAttribute("data-parallax-reveal", "");
      }
      updateParallax();
    } else {
      hero.classList.remove("is-parallax");
      heroMedia.style.transform = "";
      heroContent.style.transform = "";
      heroContent.style.opacity = "";
      if (heroContent.hasAttribute("data-parallax-reveal")) {
        heroContent.removeAttribute("data-parallax-reveal");
        heroContent.setAttribute("data-reveal", "");
        // Already in view, so mark it visible instead of hiding it again
        heroContent.classList.add("is-visible");
      }
    }
  }

  syncParallax();

  if (typeof parallaxQuery.addEventListener === "function") {
    parallaxQuery.addEventListener("change", syncParallax);
  } else if (typeof parallaxQuery.addListener === "function") {
    parallaxQuery.addListener(syncParallax);
  }

  /* --- 3D Tilt on Concept Images ---
     Pointer position sets a target rotation, then a rAF loop eases the
     current rotation toward it for a smooth, weighted feel. */
  if (!prefersReducedMotion && isFinePointer()) {
    var tiltTargets = tiltElements.length
      ? tiltElements
      : document.querySelectorAll(".concept-image-btn");

    var TILT_MAX = 6;
    var TILT_EASE = 0.12;

    tiltTargets.forEach(function (el) {
      var targetX = 0;
      var targetY = 0;
      var currentX = 0;
      var currentY = 0;
      var rafId = null;

      function renderTilt() {
        currentX += (targetX - currentX) * TILT_EASE;
        currentY += (targetY - currentY) * TILT_EASE;
        el.style.setProperty("--tilt-x", currentX.toFixed(3) + "deg");
        el.style.setProperty("--tilt-y", currentY.toFixed(3) + "deg");

        if (
          Math.abs(targetX - currentX) > 0.005 ||
          Math.abs(targetY - currentY) > 0.005
        ) {
          rafId = window.requestAnimationFrame(renderTilt);
        } else {
          rafId = null;
        }
      }

      function kickTilt() {
        if (rafId === null) {
          rafId = window.requestAnimationFrame(renderTilt);
        }
      }

      el.addEventListener("pointermove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        targetY = x * TILT_MAX;
        targetX = -y * TILT_MAX;
        kickTilt();
      });

      el.addEventListener("pointerleave", function () {
        targetX = 0;
        targetY = 0;
        kickTilt();
      });
    });
  }

  /* --- Concept Image Cycler --- */
  if (cycleImages.length && !prefersReducedMotion) {
    cycleImages.forEach(function (img) {
      // data-no-cycle keeps the on-page image static; its sources are only
      // used as the lightbox gallery once the visitor clicks through
      if (img.hasAttribute("data-no-cycle")) return;

      var sources = img
        .getAttribute("data-cycle-images")
        .split(",")
        .map(function (src) {
          return src.trim();
        })
        .filter(Boolean);

      if (sources.length < 2) return;

      // Preload every frame so crossfades never wait on the network
      sources.forEach(function (src) {
        var preloader = new Image();
        preloader.src = src;
      });

      var lightboxBtn = img.closest("[data-lightbox-src]");
      var currentIndex = 0;

      window.setInterval(function () {
        currentIndex = (currentIndex + 1) % sources.length;
        var next = sources[currentIndex];
        img.classList.add("is-cycling");

        window.setTimeout(function () {
          img.src = next;
          if (lightboxBtn) {
            lightboxBtn.setAttribute("data-lightbox-src", next);
          }

          // Fade back in once the frame is decoded and ready to paint
          if (img.decode) {
            img.decode().then(function () {
              img.classList.remove("is-cycling");
            }).catch(function () {
              img.classList.remove("is-cycling");
            });
          } else {
            img.classList.remove("is-cycling");
          }
        }, 450);
      }, 4500);
    });
  }

  /* --- Scroll Reveal with Stagger --- */
  function applyStaggerDelays() {
    var groups = document.querySelectorAll(
      ".about-grid, .location-grid, .concepts-list, .potential-list, .quick-facts, .contact-grid"
    );

    groups.forEach(function (group) {
      var items = group.querySelectorAll("[data-reveal]");
      items.forEach(function (el, index) {
        if (!el.style.getPropertyValue("--reveal-delay")) {
          el.style.setProperty("--reveal-delay", index * 80 + "ms");
        }
      });
    });
  }

  applyStaggerDelays();

  if (revealElements.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );

    revealElements.forEach(function (el) {
      if (prefersReducedMotion) {
        el.classList.add("is-visible");
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* --- Lightbox --- */
  function updateLightboxCounter() {
    if (!lightboxCounter) return;
    if (lightboxGallery && lightboxGallery.length > 1) {
      lightboxCounter.textContent =
        lightboxIndex + 1 + " / " + lightboxGallery.length;
    }
  }

  function setLightboxGallery(trigger, src) {
    lightboxGallery = null;
    lightboxIndex = 0;

    var cycleImg = trigger
      ? trigger.querySelector("img[data-cycle-images]")
      : null;

    if (cycleImg) {
      var sources = cycleImg
        .getAttribute("data-cycle-images")
        .split(",")
        .map(function (item) {
          return item.trim();
        })
        .filter(Boolean);

      if (sources.length > 1) {
        lightboxGallery = sources;
        var found = sources.indexOf(src);
        lightboxIndex = found === -1 ? 0 : found;
      }
    }

    var hasGallery = lightboxGallery !== null;
    if (lightboxPrev) lightboxPrev.hidden = !hasGallery;
    if (lightboxNext) lightboxNext.hidden = !hasGallery;
    if (lightboxCounter) lightboxCounter.hidden = !hasGallery;
  }

  function stepLightbox(delta) {
    if (!lightboxGallery) return;

    lightboxIndex =
      (lightboxIndex + delta + lightboxGallery.length) % lightboxGallery.length;
    var next = lightboxGallery[lightboxIndex];

    lightboxImage.classList.add("is-stepping");

    window.setTimeout(function () {
      lightboxImage.src = next;
      updateLightboxCounter();

      if (lightboxImage.decode) {
        lightboxImage.decode().then(function () {
          lightboxImage.classList.remove("is-stepping");
        }).catch(function () {
          lightboxImage.classList.remove("is-stepping");
        });
      } else {
        lightboxImage.classList.remove("is-stepping");
      }
    }, 200);
  }

  function openLightbox(src, alt, trigger) {
    lightboxTrigger = trigger;
    setLightboxGallery(trigger, src);
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxCaption.textContent = alt;
    updateLightboxCounter();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxGallery = null;
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
    if (lightboxTrigger) {
      lightboxTrigger.focus();
      lightboxTrigger = null;
    }
  }

  if (lightbox && lightboxImage) {
    lightboxButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(
          btn.getAttribute("data-lightbox-src"),
          btn.getAttribute("data-lightbox-alt") || "",
          btn
        );
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", function () {
        stepLightbox(-1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener("click", function () {
        stepLightbox(1);
      });
    }

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        stepLightbox(-1);
      } else if (e.key === "ArrowRight") {
        stepLightbox(1);
      }
    });

    /* Swipe navigation on touch devices: up/left = next, down/right = previous */
    var swipeStartX = 0;
    var swipeStartY = 0;
    var SWIPE_MIN = 48;

    lightbox.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches.length !== 1) return;
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      "touchend",
      function (e) {
        if (!lightboxGallery || e.changedTouches.length !== 1) return;

        var dx = e.changedTouches[0].clientX - swipeStartX;
        var dy = e.changedTouches[0].clientY - swipeStartY;
        var absX = Math.abs(dx);
        var absY = Math.abs(dy);

        if (absX < SWIPE_MIN && absY < SWIPE_MIN) return;

        if (absY >= absX) {
          stepLightbox(dy < 0 ? 1 : -1);
        } else {
          stepLightbox(dx < 0 ? 1 : -1);
        }
      },
      { passive: true }
    );
  }

  /* --- Sticky Mobile CTA Bar ---
     Shows once the hero is scrolled past, hides while the contact
     section is in view so the CTA is never duplicated, and can be
     dismissed for the rest of the session. */
  var mobileCta = document.getElementById("mobile-cta");
  var mobileCtaDismiss = document.getElementById("mobile-cta-dismiss");
  var contactSection = document.getElementById("contact");
  var ctaDismissed = false;
  var ctaPastHero = false;
  var ctaContactVisible = false;

  try {
    ctaDismissed = window.sessionStorage.getItem("kc-cta-dismissed") === "1";
  } catch (err) {
    ctaDismissed = false;
  }

  function updateMobileCta() {
    if (!mobileCta) return;
    var show = ctaPastHero && !ctaContactVisible && !ctaDismissed;
    mobileCta.classList.toggle("is-visible", show);
    mobileCta.setAttribute("aria-hidden", show ? "false" : "true");
  }

  if (mobileCta && "IntersectionObserver" in window) {
    if (hero) {
      var heroObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            ctaPastHero =
              !entry.isIntersecting && entry.boundingClientRect.top < 0;
            updateMobileCta();
          });
        },
        { threshold: 0 }
      );
      heroObserver.observe(hero);
    }

    if (contactSection) {
      var contactObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            ctaContactVisible = entry.isIntersecting;
            updateMobileCta();
          });
        },
        { threshold: 0.15 }
      );
      contactObserver.observe(contactSection);
    }
  } else if (mobileCta && hero) {
    /* Fallback without IntersectionObserver: show after the hero */
    window.addEventListener("scroll", function () {
      ctaPastHero = window.scrollY > hero.offsetHeight * 0.9;
      updateMobileCta();
    }, { passive: true });
  }

  if (mobileCtaDismiss) {
    mobileCtaDismiss.addEventListener("click", function () {
      ctaDismissed = true;
      try {
        window.sessionStorage.setItem("kc-cta-dismissed", "1");
      } catch (err) {
        /* storage unavailable, dismissal lasts for this page view */
      }
      updateMobileCta();
    });
  }

  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }
})();
