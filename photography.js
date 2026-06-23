(() => {
  "use strict";

  /*
   * PHOTO SETTINGS
   * Put files inside: assets/photos/
   * Name them sequentially: 1.jpg, 2.jpg, 3.jpg, ...
   */
  const PHOTO_DIRECTORY = "assets/photos";
  const PHOTO_EXTENSION = "jpg";
  const PHOTO_COUNT = 12;

  /*
   * Optional information for each numbered image.
   * The array position matches the file number:
   * first object = 1.jpg, second object = 2.jpg, etc.
   *
   * Add or remove entries when PHOTO_COUNT changes.
   */
  const PHOTO_DETAILS = [
    { title: "After the Storm", category: "landscape", detail: "Landscape study", layout: "wide tall" },
    { title: "Solitude", category: "portrait", detail: "Natural-light portrait", layout: "tall" },
    { title: "Crossing Lines", category: "street", detail: "Urban observation", layout: "" },
    { title: "Concrete Rhythm", category: "architecture", detail: "Geometry study", layout: "" },
    { title: "Blue Hour", category: "landscape", detail: "Landscape at dawn", layout: "" },
    { title: "Night Stories", category: "street", detail: "City after dark", layout: "tall" },
    { title: "Edge of the World", category: "landscape", detail: "Ocean study", layout: "wide tall" },
    { title: "In Between", category: "portrait", detail: "Environmental portrait", layout: "" },
    { title: "Vertical City", category: "architecture", detail: "Urban form", layout: "" },
    { title: "The Long Road", category: "landscape", detail: "Desert passage", layout: "" },
    { title: "Human Scale", category: "street", detail: "Public space", layout: "wide" },
    { title: "Still House", category: "architecture", detail: "Residential architecture", layout: "" }
  ];

  const header = document.getElementById("site-header");
  const progressBar = document.getElementById("progress-bar");
  const menuButton = document.getElementById("menu-button");
  const navLinks = document.getElementById("nav-links");
  const gallery = document.getElementById("gallery");
  const filters = [...document.querySelectorAll(".filter")];

  let previousScroll = window.scrollY;
  let scrollFrame = 0;
  let works = [];
  let currentIndex = 0;
  let lastFocused = null;

  const imagePath = (number) =>
    `${PHOTO_DIRECTORY}/${number}.${PHOTO_EXTENSION}`;

  function createGallery() {
    const fragment = document.createDocumentFragment();

    for (let number = 1; number <= PHOTO_COUNT; number += 1) {
      const info = PHOTO_DETAILS[number - 1] || {
        title: `Frame ${String(number).padStart(2, "0")}`,
        category: "landscape",
        detail: "Selected photograph",
        layout: ""
      };

      const figure = document.createElement("figure");
      figure.className = `work reveal ${info.layout}`.trim();
      figure.dataset.category = info.category;
      figure.dataset.title = info.title;
      figure.dataset.detail = info.detail;
      figure.dataset.number = String(number);

      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Open ${info.title} in fullscreen`);

      const image = document.createElement("img");
      image.src = imagePath(number);
      image.alt = info.title;
      image.loading = number <= 2 ? "eager" : "lazy";
      image.decoding = "async";

      /*
       * If a numbered file is missing, remove its card.
       * This lets the page continue working when there are fewer images.
       */
      image.addEventListener("error", () => {
        figure.remove();
        refreshWorks();
      });

      const caption = document.createElement("figcaption");
      caption.className = "work-meta";
      caption.innerHTML = `
        <div>
          <strong>${info.title}</strong>
          <span>${info.category} · ${info.detail}</span>
        </div>
        <i aria-hidden="true">↗</i>
      `;

      button.appendChild(image);
      figure.append(button, caption);
      fragment.appendChild(figure);
    }

    gallery.appendChild(fragment);
    refreshWorks();
    observeReveals(gallery);
  }

  function refreshWorks() {
    works = [...gallery.querySelectorAll(".work")];

    works.forEach((work) => {
      const button = work.querySelector("button");
      if (button.dataset.lightboxReady === "true") return;

      button.dataset.lightboxReady = "true";
      button.addEventListener("click", () => openLightbox(work));
    });
  }

  function updateScrollState() {
    scrollFrame = 0;

    const current = Math.max(0, window.scrollY);
    const maximum = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );

    header.classList.toggle("scrolled", current > 40);
    header.classList.toggle(
      "hidden",
      current > previousScroll &&
        current > 240 &&
        !navLinks.classList.contains("open")
    );

    progressBar.style.transform = `scaleX(${Math.min(1, current / maximum)})`;
    previousScroll = current;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
    },
    { passive: true }
  );

  menuButton.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  let revealObserver = null;

  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px"
      }
    );
  }

  function observeReveals(context = document) {
    const items = [...context.querySelectorAll(".reveal:not(.in-view)")];

    items.forEach((item) => {
      if (revealObserver) {
        revealObserver.observe(item);
      } else {
        item.classList.add("in-view");
      }
    });
  }

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;

      filters.forEach((item) => {
        item.classList.toggle("active", item === filter);
      });

      works.forEach((work) => {
        work.classList.toggle(
          "hidden",
          category !== "all" && work.dataset.category !== category
        );
      });
    });
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDetail = document.getElementById("lightbox-detail");
  const lightboxCount = document.getElementById("lightbox-count");
  const closeButton = document.getElementById("lightbox-close");
  const previousButton = document.getElementById("lightbox-prev");
  const nextButton = document.getElementById("lightbox-next");

  function visibleWorks() {
    return works.filter((work) => !work.classList.contains("hidden"));
  }

  function renderLightbox() {
    const items = visibleWorks();
    if (!items.length) return;

    currentIndex = (currentIndex + items.length) % items.length;

    const item = items[currentIndex];
    const source = item.querySelector("img");

    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt;
    lightboxTitle.textContent = item.dataset.title;
    lightboxDetail.textContent = item.dataset.detail;
    lightboxCount.textContent =
      `${String(currentIndex + 1).padStart(2, "0")} / ` +
      String(items.length).padStart(2, "0");
  }

  function openLightbox(work) {
    const items = visibleWorks();
    currentIndex = Math.max(0, items.indexOf(work));
    lastFocused = document.activeElement;

    renderLightbox();

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
    lastFocused?.focus();
  }

  closeButton.addEventListener("click", closeLightbox);

  previousButton.addEventListener("click", () => {
    currentIndex -= 1;
    renderLightbox();
  });

  nextButton.addEventListener("click", () => {
    currentIndex += 1;
    renderLightbox();
  });

  lightbox.addEventListener("click", (event) => {
    if (
      event.target === lightbox ||
      event.target.classList.contains("lightbox-stage")
    ) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;

    if (event.key === "Escape") closeLightbox();

    if (event.key === "ArrowLeft") {
      currentIndex -= 1;
      renderLightbox();
    }

    if (event.key === "ArrowRight") {
      currentIndex += 1;
      renderLightbox();
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  createGallery();
  observeReveals();
  updateScrollState();
})();
