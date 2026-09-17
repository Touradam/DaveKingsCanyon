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
  var lightboxButtons = document.querySelectorAll("[data-lightbox-src], [data-lightbox-video]");
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxVideo = document.getElementById("lightbox-video");
  var lightboxBaWrap = document.getElementById("lightbox-before-after");
  var lightboxBaBefore = document.getElementById("lightbox-ba-before");
  var lightboxBaAfter = document.getElementById("lightbox-ba-after");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var lightboxCounter = document.getElementById("lightbox-counter");
  var footerYear = document.getElementById("footer-year");

  var lightboxTrigger = null;
  var lightboxGallery = null;
  var lightboxGalleryAlts = null;
  var lightboxBeforeAfter = null;
  var lightboxBaTimer = null;
  var lightboxIndex = 0;
  var scrollTicking = false;

  /* Parse "base|before|after;base|before|after" into a lookup map */
  function parseBeforeAfterMap(attr) {
    var map = {};
    if (!attr) return map;
    attr.split(";").forEach(function (entry) {
      var parts = entry
        .split("|")
        .map(function (item) {
          return item.trim();
        })
        .filter(Boolean);
      if (parts.length === 3) {
        map[parts[0]] = [parts[1], parts[2]];
      }
    });
    return map;
  }

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

  /* --- Hero tagline typewriter --- */
  (function initHeroWrite() {
    var tagline = document.querySelector(".hero-tagline[data-write]");
    var lines = document.querySelectorAll(".hero-tagline [data-write-text]");
    if (!lines.length) return;

    function fillAll() {
      lines.forEach(function (line) {
        line.textContent = line.getAttribute("data-write-text") || "";
        line.classList.remove("is-writing");
        line.classList.add("is-written");
      });
    }

    if (prefersReducedMotion) {
      fillAll();
      return;
    }

    // Keep the translucent box at its full size so only the text writes in
    if (tagline) {
      tagline.style.minWidth = tagline.offsetWidth + "px";
    }

    var lineIndex = 0;

    function typeLine(line, done) {
      var full = line.getAttribute("data-write-text") || "";
      var i = 0;
      line.textContent = "";
      line.classList.add("is-writing");
      line.classList.remove("is-written");

      function tick() {
        i += 1;
        line.textContent = full.slice(0, i);
        if (i < full.length) {
          var ch = full.charAt(i - 1);
          var delay = ch === "." ? 220 : ch === "," ? 90 : 28;
          window.setTimeout(tick, delay);
        } else {
          line.classList.remove("is-writing");
          line.classList.add("is-written");
          done();
        }
      }

      window.setTimeout(tick, 40);
    }

    function next() {
      if (lineIndex >= lines.length) return;
      var line = lines[lineIndex];
      lineIndex += 1;
      typeLine(line, function () {
        window.setTimeout(next, 320);
      });
    }

    lines.forEach(function (line) {
      line.textContent = "";
    });

    window.setTimeout(next, 700);
  })();

  if (typeof parallaxQuery.addEventListener === "function") {
    parallaxQuery.addEventListener("change", syncParallax);
  } else if (typeof parallaxQuery.addListener === "function") {
    parallaxQuery.addListener(syncParallax);
  }

  /* --- Hero Backdrop Flip ---
     Click anywhere on the hero (except links and buttons) to flip
     between the resort rendering and the drone photo. Disabled under
     reduced motion. */
  var heroFlip = document.getElementById("hero-flip");
  if (heroFlip && hero && !prefersReducedMotion) {
    hero.classList.add("hero--flippable");
    hero.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      heroFlip.classList.toggle("is-flipped");
    });
  }

  /* --- Local Explorer Island ---
     The category pills carry their photo set in data-gallery and open
     the shared lightbox directly, so the page stays free of image
     grids until a visitor asks to explore. They are wired up with the
     other lightbox triggers below. */

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

      var beforeAfter = parseBeforeAfterMap(
        img.getAttribute("data-before-after")
      );

      // Preload every frame so crossfades never wait on the network
      sources.forEach(function (src) {
        var preloader = new Image();
        preloader.src = src;
      });
      Object.keys(beforeAfter).forEach(function (key) {
        beforeAfter[key].forEach(function (src) {
          var preloader = new Image();
          preloader.src = src;
        });
      });

      var lightboxBtn = img.closest("[data-lightbox-src]");
      var btn = img.closest(".concept-image-btn");
      var overlay = btn ? btn.querySelector(".concept-before-after") : null;
      var overlayBefore = overlay
        ? overlay.querySelector(".concept-image--before")
        : null;
      var overlayAfter = overlay
        ? overlay.querySelector(".concept-image--after")
        : null;

      var currentIndex = 0;
      var STEP_MS = 4500;

      function swapBaseFrame(src) {
        img.classList.add("is-cycling");

        window.setTimeout(function () {
          img.src = src;
          if (lightboxBtn) {
            lightboxBtn.setAttribute("data-lightbox-src", src);
          }

          // Fade back in once the frame is decoded and ready to paint
          var done = function () {
            img.classList.remove("is-cycling");
          };
          if (img.decode) {
            img.decode().then(done).catch(done);
          } else {
            done();
          }
        }, 450);
      }

      // Play the before/after pair over the base frame, then hand back
      function playBeforeAfter(src, pair, done) {
        img.src = src;
        if (lightboxBtn) {
          lightboxBtn.setAttribute("data-lightbox-src", src);
        }
        overlayBefore.src = pair[0];
        overlayAfter.src = pair[1];
        overlay.classList.remove("is-after");
        overlay.hidden = false;
        // Force a style flush so the fade-in transition runs from opacity 0
        void overlay.offsetWidth;
        overlay.classList.add("is-active");

        window.setTimeout(function () {
          overlay.classList.add("is-after");
        }, 1200);

        window.setTimeout(function () {
          overlay.classList.remove("is-active");
          window.setTimeout(function () {
            overlay.hidden = true;
            overlay.classList.remove("is-after");
            done();
          }, 550);
        }, 4600);
      }

      function advance() {
        currentIndex = (currentIndex + 1) % sources.length;
        var next = sources[currentIndex];
        var pair = beforeAfter[next];

        if (pair && overlay) {
          playBeforeAfter(next, pair, function () {
            window.setTimeout(advance, 1400);
          });
        } else {
          swapBaseFrame(next);
          window.setTimeout(advance, STEP_MS);
        }
      }

      // When the first frame has a before/after pair, open the cycle with it
      var firstPair = beforeAfter[sources[0]];
      if (firstPair && overlay) {
        window.setTimeout(function () {
          playBeforeAfter(sources[0], firstPair, function () {
            window.setTimeout(advance, 1400);
          });
        }, 900);
      } else {
        window.setTimeout(advance, STEP_MS);
      }
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

  function currentLightboxAlt(fallback) {
    if (
      lightboxGalleryAlts &&
      lightboxGalleryAlts.length &&
      lightboxIndex >= 0 &&
      lightboxIndex < lightboxGalleryAlts.length &&
      lightboxGalleryAlts[lightboxIndex]
    ) {
      return lightboxGalleryAlts[lightboxIndex];
    }
    return fallback || "";
  }

  function setLightboxGallery(trigger, src) {
    lightboxGallery = null;
    lightboxGalleryAlts = null;
    lightboxBeforeAfter = null;
    lightboxIndex = 0;

    var sources = null;

    if (trigger) {
      // Island pills carry the gallery on the trigger itself; concept
      // cards keep it on the enclosed cycling image
      var galleryAttr = trigger.getAttribute("data-gallery");
      var cycleImg = trigger.querySelector("img[data-cycle-images]");
      var list = galleryAttr || (cycleImg ? cycleImg.getAttribute("data-cycle-images") : null);

      if (cycleImg) {
        lightboxBeforeAfter = parseBeforeAfterMap(
          cycleImg.getAttribute("data-before-after")
        );
      }

      if (list) {
        sources = list
          .split(",")
          .map(function (item) {
            return item.trim();
          })
          .filter(Boolean);

        if (sources.length > 1) {
          lightboxGallery = sources;
          var found = sources.indexOf(src);
          lightboxIndex = found === -1 ? 0 : found;

          var altsAttr = trigger.getAttribute("data-gallery-alts");
          if (altsAttr) {
            lightboxGalleryAlts = altsAttr.split(",").map(function (item) {
              return item.trim();
            });
          }
        }
      }
    }

    var hasGallery = lightboxGallery !== null;
    if (lightboxPrev) lightboxPrev.hidden = !hasGallery;
    if (lightboxNext) lightboxNext.hidden = !hasGallery;
    if (lightboxCounter) lightboxCounter.hidden = !hasGallery;
  }

  function resetLightboxBeforeAfter() {
    if (lightboxBaTimer) {
      window.clearTimeout(lightboxBaTimer);
      lightboxBaTimer = null;
    }
    if (lightboxBaWrap) {
      lightboxBaWrap.classList.remove("is-after");
      lightboxBaWrap.hidden = true;
    }
    if (lightboxBaBefore) lightboxBaBefore.src = "";
    if (lightboxBaAfter) {
      lightboxBaAfter.src = "";
      lightboxBaAfter.alt = "";
    }
  }

  // Show a gallery frame; frames with a before/after pair replay their
  // transition every time they appear. Returns true when a pair was shown.
  function presentLightboxFrame(src, alt) {
    var pair = lightboxBeforeAfter && lightboxBeforeAfter[src];

    if (pair && lightboxBaWrap && lightboxBaBefore && lightboxBaAfter) {
      if (lightboxBaTimer) {
        window.clearTimeout(lightboxBaTimer);
      }
      lightboxImage.hidden = true;
      lightboxBaBefore.src = pair[0];
      lightboxBaAfter.src = pair[1];
      lightboxBaAfter.alt = alt || "";
      lightboxBaWrap.classList.remove("is-after");
      lightboxBaWrap.hidden = false;
      // Force a style flush so the crossfade replays from the before frame
      void lightboxBaWrap.offsetWidth;
      lightboxBaTimer = window.setTimeout(function () {
        lightboxBaWrap.classList.add("is-after");
      }, 650);
      return true;
    }

    resetLightboxBeforeAfter();
    lightboxImage.hidden = false;
    return false;
  }

  function stepLightbox(delta) {
    if (!lightboxGallery) return;

    lightboxIndex =
      (lightboxIndex + delta + lightboxGallery.length) % lightboxGallery.length;
    var next = lightboxGallery[lightboxIndex];
    var nextAlt = currentLightboxAlt("");

    if (presentLightboxFrame(next, nextAlt)) {
      lightboxCaption.textContent = nextAlt;
      updateLightboxCounter();
      return;
    }

    lightboxImage.classList.add("is-stepping");

    window.setTimeout(function () {
      lightboxImage.src = next;
      lightboxImage.alt = nextAlt;
      lightboxCaption.textContent = nextAlt;
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

  function showLightboxImage() {
    resetLightboxBeforeAfter();
    if (lightboxImage) lightboxImage.hidden = false;
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute("src");
      lightboxVideo.load();
      lightboxVideo.hidden = true;
    }
  }

  function showLightboxVideo(src) {
    if (lightboxImage) {
      lightboxImage.hidden = true;
      lightboxImage.src = "";
    }
    if (lightboxVideo) {
      lightboxVideo.hidden = false;
      lightboxVideo.muted = true;
      lightboxVideo.defaultMuted = true;
      lightboxVideo.volume = 0;
      lightboxVideo.setAttribute("muted", "");
      lightboxVideo.src = src;
      lightboxVideo.load();
      var playPromise = lightboxVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
  }

  function openLightbox(src, alt, trigger) {
    lightboxTrigger = trigger;
    setLightboxGallery(trigger, src);
    showLightboxImage();
    var resolvedAlt = currentLightboxAlt(alt);
    if (!presentLightboxFrame(src, resolvedAlt)) {
      lightboxImage.src = src;
      lightboxImage.alt = resolvedAlt;
    }
    lightboxCaption.textContent = resolvedAlt;
    updateLightboxCounter();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    lightboxClose.focus();
  }

  function openLightboxVideo(src, alt, trigger) {
    lightboxTrigger = trigger;
    lightboxGallery = null;
    lightboxIndex = 0;
    if (lightboxPrev) lightboxPrev.hidden = true;
    if (lightboxNext) lightboxNext.hidden = true;
    if (lightboxCounter) lightboxCounter.hidden = true;
    showLightboxVideo(src);
    lightboxCaption.textContent = alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    resetLightboxBeforeAfter();
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute("src");
      lightboxVideo.load();
      lightboxVideo.hidden = true;
    }
    if (lightboxImage) {
      lightboxImage.src = "";
      lightboxImage.alt = "";
      lightboxImage.hidden = true;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }
    lightboxGallery = null;
    lightboxGalleryAlts = null;
    lightboxBeforeAfter = null;
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
        var videoSrc = btn.getAttribute("data-lightbox-video");
        var alt = btn.getAttribute("data-lightbox-alt") || "";
        if (videoSrc) {
          openLightboxVideo(videoSrc, alt, btn);
          return;
        }
        openLightbox(btn.getAttribute("data-lightbox-src"), alt, btn);
      });
    });

    if (lightboxVideo) {
      lightboxVideo.addEventListener("volumechange", function () {
        if (!lightboxVideo.muted || lightboxVideo.volume > 0) {
          lightboxVideo.muted = true;
          lightboxVideo.volume = 0;
        }
      });
    }

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

  /* --- Floating Call CTA ---
     The listing agent stays one tap away: the floater pops in for
     8 seconds, retreats, then returns every minute. It stops for good
     once the call link is tapped, stays quiet while the contact
     section is on screen, and a dismissal lasts the whole session. */
  var floatingCta = document.getElementById("floating-cta");
  var floatingCtaDismiss = document.getElementById("floating-cta-dismiss");
  var floatingCtaCall = floatingCta
    ? floatingCta.querySelector(".floating-cta-call")
    : null;
  var contactSection = document.getElementById("contact");
  var ctaDismissed = false;
  var ctaAnswered = false;
  var ctaContactVisible = false;
  var CTA_SHOW_AFTER = 3000;  /* first appearance, shortly after load */
  var CTA_VISIBLE_MS = 8000;  /* stays up for 8 seconds */
  var CTA_EVERY_MS = 60000;   /* then once a minute */
  var ctaPulseTimer = null;
  var ctaHideTimer = null;

  try {
    ctaDismissed = window.sessionStorage.getItem("kc-cta-dismissed") === "1";
  } catch (err) {
    ctaDismissed = false;
  }

  function setFloatingCtaVisible(show) {
    if (!floatingCta) return;
    floatingCta.classList.toggle("is-visible", show);
    floatingCta.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function stopFloatingCta() {
    window.clearTimeout(ctaPulseTimer);
    window.clearInterval(ctaPulseTimer);
    window.clearTimeout(ctaHideTimer);
    ctaPulseTimer = null;
    ctaHideTimer = null;
  }

  function pulseFloatingCta() {
    if (ctaDismissed || ctaAnswered || ctaContactVisible) return;
    setFloatingCtaVisible(true);
    ctaHideTimer = window.setTimeout(function () {
      setFloatingCtaVisible(false);
    }, CTA_VISIBLE_MS);
  }

  function startFloatingCta() {
    if (!floatingCta || ctaDismissed) return;
    ctaPulseTimer = window.setTimeout(function () {
      pulseFloatingCta();
      ctaPulseTimer = window.setInterval(pulseFloatingCta, CTA_EVERY_MS);
    }, CTA_SHOW_AFTER);
  }

  if (floatingCta) {
    startFloatingCta();

    if (contactSection && "IntersectionObserver" in window) {
      var ctaContactObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            ctaContactVisible = entry.isIntersecting;
            if (ctaContactVisible) {
              window.clearTimeout(ctaHideTimer);
              setFloatingCtaVisible(false);
            }
          });
        },
        { threshold: 0.15 }
      );
      ctaContactObserver.observe(contactSection);
    }

    if (floatingCtaDismiss) {
      floatingCtaDismiss.addEventListener("click", function () {
        ctaDismissed = true;
        try {
          window.sessionStorage.setItem("kc-cta-dismissed", "1");
        } catch (err) {
          /* storage unavailable, dismissal lasts for this page view */
        }
        stopFloatingCta();
        setFloatingCtaVisible(false);
      });
    }

    if (floatingCtaCall) {
      floatingCtaCall.addEventListener("click", function () {
        /* Visitor is calling: no need to keep asking */
        ctaAnswered = true;
        stopFloatingCta();
        setFloatingCtaVisible(false);
      });
    }
  }

  /* --- Phone Link Helper ---
     tel: links open the dialer straight away on phones. On desktops
     without a calling app the click can feel dead, so the number is
     also copied to the clipboard with a quick inline confirmation. */
  var phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var number = link.getAttribute("href").replace("tel:", "");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(number).catch(function () {});
      }
      if (!link.classList.contains("contact-agent-action")) return;
      var label = link.querySelector("span");
      if (!label) return;
      var original = label.textContent;
      link.classList.add("is-copied");
      label.textContent = "Number copied";
      window.setTimeout(function () {
        link.classList.remove("is-copied");
        label.textContent = original;
      }, 2000);
    });
  });

  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }
})();
