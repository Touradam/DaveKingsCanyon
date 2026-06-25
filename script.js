/**
 * Kings Canyon Land - Midnight Champagne Interactions
 * Nav, hero effects, scroll reveal, lightbox, lazy video embeds, showing scheduler
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
  var lightboxButtons = document.querySelectorAll("[data-lightbox-src]");
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var videoEmbeds = document.querySelectorAll(".video-embed");
  var scheduler = document.getElementById("showing-scheduler");
  var schedulerClose = document.getElementById("scheduler-close");
  var schedulerTriggers = document.querySelectorAll("[data-open-scheduler]");
  var schedulerStepCalendar = document.getElementById("scheduler-step-calendar");
  var schedulerStepForm = document.getElementById("scheduler-step-form");
  var schedulerSelectedDate = document.getElementById("scheduler-selected-date");
  var schedulerBack = document.getElementById("scheduler-back");
  var calendarMonth = document.getElementById("calendar-month");
  var calendarGrid = document.getElementById("calendar-grid");
  var calendarPrev = document.getElementById("calendar-prev");
  var calendarNext = document.getElementById("calendar-next");
  var schedulerFormLink = document.getElementById("scheduler-form-link");
  var footerYear = document.getElementById("footer-year");

  var lightboxTrigger = null;
  var schedulerTrigger = null;
  var scrollTicking = false;
  var calendarView = new Date();
  calendarView.setDate(1);
  var selectedDate = null;

  var dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  var monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });

  /* --- Utility --- */
  function isPlaceholderUrl(url) {
    return !url || url.indexOf("[") !== -1 || url.indexOf("]") !== -1;
  }

  function isYouTubeUrl(url) {
    return /youtube\.com|youtu\.be/i.test(url);
  }

  function isVimeoUrl(url) {
    return /vimeo\.com/i.test(url);
  }

  function toEmbedUrl(url) {
    if (isYouTubeUrl(url)) {
      var ytMatch = url.match(/(?:embed\/|v=|youtu\.be\/)([\w-]+)/);
      if (ytMatch) {
        return "https://www.youtube.com/embed/" + ytMatch[1];
      }
    }

    if (isVimeoUrl(url)) {
      var vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch) {
        return "https://player.vimeo.com/video/" + vimeoMatch[1];
      }
    }

    return url;
  }

  function isFinePointer() {
    return window.matchMedia("(pointer: fine)").matches;
  }

  function resolveSiteUrl(url) {
    if (!url || /^https?:\/\//i.test(url) || url.indexOf("//") === 0) {
      return url;
    }

    var base = window.__SITE_BASE__ || "";
    return base + url.replace(/^\.\//, "");
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
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

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

  /* --- 3D Tilt on Concept Images --- */
  if (!prefersReducedMotion && isFinePointer()) {
    var tiltTargets = tiltElements.length
      ? tiltElements
      : document.querySelectorAll(".concept-image-btn");

    tiltTargets.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--tilt-y", x * 6 + "deg");
        el.style.setProperty("--tilt-x", -y * 6 + "deg");
      });

      el.addEventListener("mouseleave", function () {
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  /* --- Scroll Reveal with Stagger --- */
  function applyStaggerDelays() {
    var groups = document.querySelectorAll(
      ".about-grid, .concepts-list, .video-grid, .potential-list, .quick-facts, .contact-grid"
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
  function openLightbox(src, alt, trigger) {
    lightboxTrigger = trigger;
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxCaption.textContent = alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = "";
    document.body.style.overflow = "";
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

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.hidden && e.key === "Escape") {
        closeLightbox();
      }
    });
  }

  /* --- Lazy Video Embeds --- */
  function buildVideoEmbed(container) {
    if (container.dataset.loaded === "true") return;

    var url = container.getAttribute("data-video-url");
    var title = container.getAttribute("data-video-title") || "Property video";
    var poster = container.getAttribute("data-video-poster") || "";

    if (isPlaceholderUrl(url)) {
      container.innerHTML =
        '<div class="video-placeholder">Replace <code>data-video-url</code> with your video URL</div>';
      container.dataset.loaded = "true";
      return;
    }

    if (isYouTubeUrl(url) || isVimeoUrl(url)) {
      var iframe = document.createElement("iframe");
      iframe.src = toEmbedUrl(url);
      iframe.title = title;
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    } else {
      var video = document.createElement("video");
      video.controls = true;
      video.preload = "none";
      video.title = title;
      if (poster) {
        video.poster = resolveSiteUrl(poster);
      }

      var source = document.createElement("source");
      source.src = resolveSiteUrl(url);
      source.type = "video/mp4";
      video.appendChild(source);
      container.appendChild(video);
    }

    container.dataset.loaded = "true";
  }

  if (videoEmbeds.length && "IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            buildVideoEmbed(entry.target);
            videoObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "100px" }
    );

    videoEmbeds.forEach(function (embed) {
      videoObserver.observe(embed);
    });
  } else {
    videoEmbeds.forEach(buildVideoEmbed);
  }

  /* --- Showing Scheduler --- */
  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function renderCalendar() {
    if (!calendarGrid || !calendarMonth) return;

    var today = startOfDay(new Date());
    var year = calendarView.getFullYear();
    var month = calendarView.getMonth();
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarMonth.textContent = monthFormatter.format(calendarView);
    calendarGrid.innerHTML = "";

    for (var i = 0; i < firstDay; i++) {
      var empty = document.createElement("span");
      empty.className = "calendar-day calendar-day--empty";
      empty.setAttribute("aria-hidden", "true");
      calendarGrid.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(year, month, day);
      var button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.textContent = String(day);
      button.setAttribute("role", "gridcell");
      button.setAttribute(
        "aria-label",
        dateFormatter.format(date)
      );

      if (startOfDay(date) < today) {
        button.disabled = true;
        button.classList.add("calendar-day--disabled");
      } else {
        if (selectedDate && isSameDay(date, selectedDate)) {
          button.classList.add("is-selected");
          button.setAttribute("aria-selected", "true");
        }

        button.addEventListener("click", function (pickedDate) {
          return function () {
            selectShowingDate(pickedDate);
          };
        }(date));
      }

      calendarGrid.appendChild(button);
    }
  }

  function showSchedulerStep(step) {
    if (!schedulerStepCalendar || !schedulerStepForm) return;

    var onCalendar = step === "calendar";
    schedulerStepCalendar.hidden = !onCalendar;
    schedulerStepForm.hidden = onCalendar;
  }

  function selectShowingDate(date) {
    selectedDate = startOfDay(date);
    if (schedulerSelectedDate) {
      schedulerSelectedDate.textContent = dateFormatter.format(selectedDate);
    }
    if (schedulerFormLink) {
      var formBase = schedulerFormLink.getAttribute("data-form-base") || schedulerFormLink.href.split("?")[0];
      var formQuery = schedulerFormLink.getAttribute("data-form-query") || "pvs=105";
      var dateParam = "showing_date=" + encodeURIComponent(dateFormatter.format(selectedDate));
      schedulerFormLink.href = formBase + "?" + formQuery + "&" + dateParam;
    }
    showSchedulerStep("form");
  }

  function openScheduler(trigger) {
    if (!scheduler) return;

    schedulerTrigger = trigger || null;
    selectedDate = null;
    calendarView = new Date();
    calendarView.setDate(1);
    showSchedulerStep("calendar");
    renderCalendar();
    scheduler.hidden = false;
    document.body.style.overflow = "hidden";

    if (schedulerClose) {
      schedulerClose.focus();
    }
  }

  function closeScheduler() {
    if (!scheduler) return;

    scheduler.hidden = true;
    document.body.style.overflow = "";

    if (schedulerTrigger) {
      schedulerTrigger.focus();
      schedulerTrigger = null;
    }
  }

  if (scheduler && calendarGrid) {
    schedulerTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        openScheduler(trigger);
      });
    });

    if (schedulerClose) {
      schedulerClose.addEventListener("click", closeScheduler);
    }

    if (schedulerBack) {
      schedulerBack.addEventListener("click", function () {
        showSchedulerStep("calendar");
        renderCalendar();
      });
    }

    if (calendarPrev) {
      calendarPrev.addEventListener("click", function () {
        calendarView.setMonth(calendarView.getMonth() - 1);
        renderCalendar();
      });
    }

    if (calendarNext) {
      calendarNext.addEventListener("click", function () {
        calendarView.setMonth(calendarView.getMonth() + 1);
        renderCalendar();
      });
    }

    scheduler.addEventListener("click", function (e) {
      if (e.target === scheduler) {
        closeScheduler();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (!scheduler.hidden && e.key === "Escape") {
        closeScheduler();
      }
    });
  }

  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = "auto";
  }
})();
