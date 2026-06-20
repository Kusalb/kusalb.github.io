(() => {
  "use strict";

  const data = window.SITE_DATA || {};
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const compactViewport = window.matchMedia("(max-width: 700px)");

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  /* -----------------------------------------------------------------------
     INTRO
     ----------------------------------------------------------------------- */
  const introGate = $("#intro-gate");
  let introComplete = false;

  function finishIntro() {
    if (introComplete) return;
    introComplete = true;
    body.classList.remove("is-loading");
    window.setTimeout(() => introGate?.remove(), 800);
  }

  window.addEventListener("load", () => {
    window.setTimeout(finishIntro, reducedMotion ? 0 : 380);
  }, { once: true });
  window.setTimeout(finishIntro, reducedMotion ? 0 : 1600);

  /* -----------------------------------------------------------------------
     THEME
     ----------------------------------------------------------------------- */
  const themeToggle = $("#theme-toggle");

  function updateThemeLabel() {
    if (!themeToggle) return;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    themeToggle.title = `Switch to ${nextTheme} mode`;
  }

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("kb-theme", nextTheme);
    } catch (_) {
      // Local storage may be unavailable in restrictive local previews.
    }
    updateThemeLabel();
    window.dispatchEvent(new CustomEvent("kb-theme-change"));
  });
  updateThemeLabel();

  /* -----------------------------------------------------------------------
     NAVIGATION
     ----------------------------------------------------------------------- */
  const menuToggle = $("#menu-toggle");
  const navMenu = $("#nav-menu");

  function setMenu(open) {
    menuToggle?.classList.toggle("open", open);
    navMenu?.classList.toggle("open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    body.classList.toggle("menu-open", open);
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!navMenu?.classList.contains("open"));
  });

  $$("#nav-menu a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  /* -----------------------------------------------------------------------
     SCROLL TELEMETRY — one animation-frame update per visual frame
     ----------------------------------------------------------------------- */
  const header = $(".site-header");
  const progress = $(".scroll-progress span");
  const scrollPercent = $("#scroll-percent");
  const backToTop = $("#back-to-top");
  const ambientDepth = $(".ambient-depth");
  let previousScroll = window.scrollY;
  let scrollFrame = 0;

  function updateScrollState() {
    scrollFrame = 0;
    const current = Math.max(0, window.scrollY);
    const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, current / maximum);
    const delta = current - previousScroll;

    if (progress) progress.style.transform = `scaleY(${ratio})`;
    if (scrollPercent) scrollPercent.textContent = String(Math.round(ratio * 100)).padStart(2, "0");

    if (header && Math.abs(delta) > 5) {
      header.classList.toggle("hidden", delta > 0 && current > 240 && !body.classList.contains("menu-open"));
    }

    backToTop?.classList.toggle("visible", current > 760);
    ambientDepth?.classList.toggle("is-sleeping", current > window.innerHeight * 1.2);
    previousScroll = current;
  }

  function requestScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollState);
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
  updateScrollState();

  /* -----------------------------------------------------------------------
     VISIBILITY-AWARE MOTION
     ----------------------------------------------------------------------- */
  const motionZones = $$("main > section");
  motionZones.forEach((zone) => zone.classList.add("motion-zone"));

  if ("IntersectionObserver" in window) {
    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("motion-active", entry.isIntersecting);
      });
    }, { rootMargin: "18% 0px 18%", threshold: 0.01 });

    motionZones.forEach((zone) => motionObserver.observe(zone));
  } else {
    motionZones.forEach((zone) => zone.classList.add("motion-active"));
  }

  document.addEventListener("visibilitychange", () => {
    body.classList.toggle("page-hidden", document.hidden);
  });

  /* -----------------------------------------------------------------------
     REVEALS — transform and opacity only
     ----------------------------------------------------------------------- */
  const revealObserver = (!reducedMotion && "IntersectionObserver" in window)
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -42px" })
    : null;

  function observeReveals(context = document) {
    const items = $$(".reveal:not(.in-view)", context);
    items.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 65}ms`);
      if (revealObserver) revealObserver.observe(item);
      else item.classList.add("in-view");
    });
  }

  observeReveals();

  /* -----------------------------------------------------------------------
     ACTIVE NAVIGATION
     ----------------------------------------------------------------------- */
  const sectionLinks = $$("#nav-menu a[href^='#']");
  const navSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    }, { threshold: [0.18, 0.42], rootMargin: "-18% 0px -58%" });

    navSections.forEach((section) => sectionObserver.observe(section));
  }

  /* -----------------------------------------------------------------------
     HERO ROLE ROTATION
     ----------------------------------------------------------------------- */
  const roleValue = $("#role-value");
  const roles = Array.isArray(data.roles) ? data.roles : [];
  let roleIndex = 0;

  if (roleValue && roles.length > 1 && !reducedMotion) {
    window.setInterval(() => {
      if (document.hidden || !$(".hero")?.classList.contains("motion-active")) return;
      roleIndex = (roleIndex + 1) % roles.length;
      roleValue.classList.remove("swap");
      void roleValue.offsetWidth;
      roleValue.textContent = roles[roleIndex];
      roleValue.classList.add("swap");
    }, 2800);
  }

  /* -----------------------------------------------------------------------
     COUNTERS
     ----------------------------------------------------------------------- */
  function animateCount(node) {
    const target = Number(node.dataset.count || 0);
    const suffix = node.dataset.suffix || "";
    const start = performance.now();
    const duration = 1000;

    function frame(now) {
      const time = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - time, 3);
      node.textContent = `${Math.round(target * eased)}${suffix}`;
      if (time < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const counters = $$("[data-count]");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach((node) => {
      node.textContent = `${node.dataset.count}${node.dataset.suffix || ""}`;
    });
  } else {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.7 });

    counters.forEach((node) => counterObserver.observe(node));
  }

  /* -----------------------------------------------------------------------
     OPTIMISED POINTER DEPTH
     ----------------------------------------------------------------------- */
  const depthInitialised = new WeakSet();
  const magneticInitialised = new WeakSet();

  function initDepthInteractions(context = document) {
    if (!finePointer || reducedMotion) return;

    $$(".depth-card, .depth-panel, .credential-card, .education-card, .github-profile-card", context).forEach((card) => {
      if (depthInitialised.has(card)) return;
      depthInitialised.add(card);

      let rect = null;
      let pointerEvent = null;
      let frame = 0;

      function renderDepth() {
        frame = 0;
        if (!rect || !pointerEvent) return;
        const x = Math.max(0, Math.min(1, (pointerEvent.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (pointerEvent.clientY - rect.top) / rect.height));
        card.style.setProperty("--card-rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
        card.style.setProperty("--card-ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
        card.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
      }

      card.addEventListener("pointerenter", () => {
        rect = card.getBoundingClientRect();
        card.classList.add("is-interacting");
      });

      card.addEventListener("pointermove", (event) => {
        pointerEvent = event;
        if (!frame) frame = requestAnimationFrame(renderDepth);
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        rect = null;
        pointerEvent = null;
        card.classList.remove("is-interacting");
        card.style.setProperty("--card-rx", "0deg");
        card.style.setProperty("--card-ry", "0deg");
        card.style.setProperty("--glow-x", "50%");
        card.style.setProperty("--glow-y", "50%");
      });
    });
  }

  function initMagnetic(context = document) {
    if (!finePointer || reducedMotion) return;

    $$(".magnetic", context).forEach((element) => {
      if (magneticInitialised.has(element)) return;
      magneticInitialised.add(element);

      let rect = null;
      element.addEventListener("pointerenter", () => {
        rect = element.getBoundingClientRect();
        element.classList.add("is-interacting");
      });
      element.addEventListener("pointermove", (event) => {
        if (!rect) return;
        const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.1;
        element.style.translate = `${x}px ${y}px`;
      }, { passive: true });
      element.addEventListener("pointerleave", () => {
        rect = null;
        element.classList.remove("is-interacting");
        element.style.translate = "";
      });
    });
  }

  initDepthInteractions();
  initMagnetic();

  /* -----------------------------------------------------------------------
     OPTIMISED CUSTOM CURSOR + HERO PARALLAX
     ----------------------------------------------------------------------- */
  const cursorDot = $("#cursor-dot");
  const cursorAura = $("#cursor-aura");
  const hero = $(".hero");
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let auraX = targetX;
  let auraY = targetY;
  let cursorFrame = 0;

  function renderCursor() {
    cursorFrame = 0;
    auraX += (targetX - auraX) * 0.18;
    auraY += (targetY - auraY) * 0.18;

    if (cursorAura) cursorAura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0)`;

    if (hero?.classList.contains("motion-active")) {
      const rect = hero.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (targetX - rect.left) / Math.max(1, rect.width)));
      const y = Math.max(0, Math.min(1, (targetY - rect.top) / Math.max(1, rect.height)));
      root.style.setProperty("--scene-rx", `${((0.5 - y) * 2.7).toFixed(2)}deg`);
      root.style.setProperty("--scene-ry", `${((x - 0.5) * 3.8).toFixed(2)}deg`);
      root.style.setProperty("--scene-shift-x", `${((x - 0.5) * 28).toFixed(1)}px`);
      root.style.setProperty("--scene-shift-y", `${((y - 0.5) * 20).toFixed(1)}px`);
    }

    if (Math.abs(targetX - auraX) > 0.15 || Math.abs(targetY - auraY) > 0.15) {
      cursorFrame = requestAnimationFrame(renderCursor);
    }
  }

  if (finePointer && !reducedMotion) {
    body.classList.add("cursor-active");

    window.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (cursorDot) cursorDot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      root.style.setProperty("--pointer-x", `${targetX}px`);
      root.style.setProperty("--pointer-y", `${targetY}px`);
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    }, { passive: true });

    document.addEventListener("pointerover", (event) => {
      body.classList.toggle("cursor-hover", Boolean(event.target.closest("a, button, input, .depth-card, .depth-panel, .lab-slide")));
    });

    document.addEventListener("pointerout", (event) => {
      if (!event.relatedTarget?.closest?.("a, button, input, .depth-card, .depth-panel, .lab-slide")) {
        body.classList.remove("cursor-hover");
      }
    });
  }

  /* -----------------------------------------------------------------------
     EXPERIENCE + CREDENTIALS
     ----------------------------------------------------------------------- */
  const timeline = $("#experience-timeline");
  if (timeline && Array.isArray(data.experience)) {
    timeline.innerHTML = data.experience.map((item) => `
      <article class="timeline-item reveal ${item.current ? "current" : ""}">
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-date">${escapeHtml(item.dates)}</div>
        <div class="timeline-role">
          <h3>${escapeHtml(item.title)}</h3>
          <h4>${escapeHtml(item.company)}</h4>
          <span>${escapeHtml(item.location)}</span>
          <ul>${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
        </div>
      </article>
    `).join("");
    observeReveals(timeline);
  }

  const credentialGrid = $("#credential-grid");
  if (credentialGrid && Array.isArray(data.credentials)) {
    credentialGrid.innerHTML = data.credentials.map((credential, index) => `
      <a class="credential-card reveal depth-card" href="${safeUrl(credential.credentialUrl)}" target="_blank" rel="noopener"
         aria-label="${escapeHtml(credential.title)} — open credential record">
        <div class="credential-top">
          <span class="credential-badge" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true">↗</span>
        </div>
        <h3>${escapeHtml(credential.title)}</h3>
        <p>${escapeHtml(credential.issuer)}</p>
        <div class="credential-meta">
          <span>${escapeHtml(credential.type)}</span>
          <span>${escapeHtml(credential.year)}</span>
        </div>
      </a>
    `).join("");
    observeReveals(credentialGrid);
    initDepthInteractions(credentialGrid);
  }

  /* -----------------------------------------------------------------------
     SIX-SIGNAL RESEARCH DECK
     ----------------------------------------------------------------------- */
  const projectTrack = $("#github-grid");
  const projectViewport = $("#project-viewport");
  const projectPrevious = $("#project-previous");
  const projectNext = $("#project-next");
  const projectPagination = $("#project-pagination");
  const projectCurrent = $("#project-current");
  const projectProgress = $("#project-progress");
  const projectCarousel = $("#project-carousel");
  const selectedProjects = (Array.isArray(data.githubProjects) ? data.githubProjects : [])
    .filter((project) => project.featured)
    .slice(0, 6);

  const categoryNames = {
    ai: "Applied intelligence",
    data: "Data investigation",
    product: "Human-centred product",
    web: "Web system",
    tools: "Automation tool",
    learning: "Technical learning"
  };

  function projectVisual(project, index) {
    const visualByRepository = {
      Improving_consistency_of_llama: `
        <div class="signal-visual signal-llm" aria-hidden="true">
          <div class="reasoning-orbit orbit-a"><i></i><i></i><i></i></div>
          <div class="reasoning-orbit orbit-b"><i></i><i></i><i></i></div>
          <div class="reasoning-core"><span>RAG</span><b>+</b><span>CoT</span></div>
          <div class="token-stream"><span>01</span><span>reason</span><span>retrieve</span><span>verify</span></div>
        </div>`,
      predict_future_energy_use_in_household: `
        <div class="signal-visual signal-energy" aria-hidden="true">
          <svg viewBox="0 0 620 300" preserveAspectRatio="none">
            <path class="signal-grid" d="M0 50H620M0 100H620M0 150H620M0 200H620M0 250H620M100 0V300M200 0V300M300 0V300M400 0V300M500 0V300"></path>
            <path class="energy-shadow" d="M0 242 C50 222 70 247 115 205 S192 182 235 196 S315 90 355 133 S425 94 470 111 S548 44 620 65 L620 300 L0 300Z"></path>
            <path class="energy-line" d="M0 242 C50 222 70 247 115 205 S192 182 235 196 S315 90 355 133 S425 94 470 111 S548 44 620 65"></path>
          </svg>
          <div class="model-rack"><span>ARIMA</span><span>RF</span><span>LSTM</span><strong>ConvLSTM</strong></div>
        </div>`,
      basket_recommendation_using_collaborative_filtering: `
        <div class="signal-visual signal-network" aria-hidden="true">
          <svg viewBox="0 0 620 320">
            <g class="network-lines">
              <path d="M95 170L235 76L368 146L515 73M95 170L232 247L368 146L515 247M235 76L232 247M368 146L515 247"></path>
            </g>
            <g class="network-nodes">
              <circle cx="95" cy="170" r="24"></circle><circle cx="235" cy="76" r="18"></circle>
              <circle cx="232" cy="247" r="20"></circle><circle cx="368" cy="146" r="28"></circle>
              <circle cx="515" cy="73" r="17"></circle><circle cx="515" cy="247" r="22"></circle>
            </g>
          </svg>
          <div class="network-labels"><span>USER</span><span>SIMILARITY</span><span>NEXT BASKET</span></div>
        </div>`,
      tripadvisor_hotel_review_sentiment_analysis: `
        <div class="signal-visual signal-sentiment" aria-hidden="true">
          <div class="sentiment-radar"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="sentiment-center"><strong>0.84</strong><span>POSITIVE SIGNAL</span></div>
          <div class="sentiment-spectrum"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div>
        </div>`,
      fruit_classification_cnn: `
        <div class="signal-visual signal-vision" aria-hidden="true">
          <div class="pixel-field">${Array.from({ length: 36 }, (_, cell) => `<i style="--cell:${cell}"></i>`).join("")}</div>
          <div class="vision-lens"><span>CNN</span><i></i><b>98×98</b></div>
          <div class="vision-classes"><span>APPLE</span><span>ORANGE</span><span>BANANA</span></div>
        </div>`,
      Abilis: `
        <div class="signal-visual signal-abilis" aria-hidden="true">
          <div class="access-ring"><span>A</span></div>
          <div class="voice-wave">${Array.from({ length: 20 }, (_, bar) => `<i style="--bar:${bar}"></i>`).join("")}</div>
          <div class="access-modes"><span>VOICE</span><span>VISION</span><span>ACCESS</span></div>
        </div>`
    };

    return visualByRepository[project.repo] || `
      <div class="signal-visual signal-default" aria-hidden="true">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <i></i><i></i><i></i>
      </div>`;
  }

  function renderProjectDeck() {
    if (!projectTrack || !selectedProjects.length) return;

    projectTrack.innerHTML = selectedProjects.map((project, index) => {
      const repositoryUrl = `https://github.com/${data.githubUsername}/${project.repo}`;
      return `
        <article class="lab-slide${index === 0 ? " is-active" : ""}"
          id="project-slide-${index + 1}"
          role="group"
          aria-roledescription="slide"
          aria-label="${index + 1} of ${selectedProjects.length}: ${escapeHtml(project.title)}"
          data-index="${String(index + 1).padStart(2, "0")}"
          aria-hidden="${index === 0 ? "false" : "true"}"
          style="--signal-accent:${accentValue(project.accent)}">
          <div class="lab-slide-copy">
            <div class="lab-project-overline">
              <span>NODE ${String(index + 1).padStart(2, "0")}</span>
              <i aria-hidden="true"></i>
              <span>${escapeHtml(categoryNames[project.category] || "Open-source project")}</span>
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.summary)}</p>
            <div class="lab-project-tags">
              ${(project.technologies || []).slice(0, 4).map((technology) => `<span>${escapeHtml(technology)}</span>`).join("")}
            </div>
            <div class="lab-project-meta">
              <span>${escapeHtml(project.language || "Repository")}</span>
              <span>${escapeHtml(project.year || "GitHub")}</span>
              <span>STATIC NODE</span>
            </div>
            <a class="lab-project-link magnetic" href="${repositoryUrl}" target="_blank" rel="noopener" tabindex="${index === 0 ? "0" : "-1"}">
              Inspect repository <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div class="lab-slide-visual">
            <div class="lab-visual-frame">
              ${projectVisual(project, index)}
              <span class="lab-scanline" aria-hidden="true"></span>
            </div>
            <div class="lab-coordinate" aria-hidden="true">
              <span>KB.LAB/${String(index + 1).padStart(2, "0")}</span>
              <span>${escapeHtml(project.repo.slice(0, 24).toUpperCase())}</span>
            </div>
          </div>
        </article>
      `;
    }).join("");

    if (projectPagination) {
      projectPagination.innerHTML = selectedProjects.map((project, index) => `
        <button type="button" class="lab-page${index === 0 ? " active" : ""}" data-slide="${index}"
          aria-label="Show project ${index + 1}: ${escapeHtml(project.title)}" ${index === 0 ? 'aria-current="true"' : ""}>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <i aria-hidden="true"></i>
        </button>
      `).join("");
    }

    const profile = data.profile || {};
    if ($("#repo-count")) $("#repo-count").textContent = profile.publicRepos || data.githubProjects.length;
    if ($("#follower-count")) $("#follower-count").textContent = profile.followers || "59";
    if ($("#github-location")) $("#github-location").textContent = profile.location || "Adelaide";

    initProjectSlider();
    initMagnetic(projectTrack);
  }

  function accentValue(accent) {
    const accents = {
      violet: "var(--violet)",
      mint: "var(--mint)",
      blue: "var(--blue)",
      orange: "var(--orange)",
      pink: "var(--pink)",
      cyan: "var(--cyan)"
    };
    return accents[accent] || "var(--mint)";
  }

  function initProjectSlider() {
    if (!projectTrack || !projectViewport || !selectedProjects.length) return;

    const slides = $$(".lab-slide", projectTrack);
    const pages = $$(".lab-page", projectPagination || document);
    let currentIndex = 0;
    let startX = 0;
    let startY = 0;
    let dragX = 0;
    let dragging = false;
    let horizontalDrag = false;
    let suppressClick = false;

    function updateSlider(nextIndex, direction = 0, immediate = false) {
      currentIndex = (nextIndex + slides.length) % slides.length;
      projectTrack.classList.toggle("is-immediate", immediate);
      projectTrack.dataset.direction = direction < 0 ? "previous" : "next";
      projectTrack.style.transform = `translate3d(${-currentIndex * 100}%, 0, 0)`;

      slides.forEach((slide, index) => {
        const active = index === currentIndex;
        slide.classList.toggle("is-active", active);
        slide.classList.toggle("is-before", index < currentIndex);
        slide.classList.toggle("is-after", index > currentIndex);
        slide.setAttribute("aria-hidden", String(!active));
        $("a", slide)?.setAttribute("tabindex", active ? "0" : "-1");
      });

      pages.forEach((page, index) => {
        const active = index === currentIndex;
        page.classList.toggle("active", active);
        if (active) page.setAttribute("aria-current", "true");
        else page.removeAttribute("aria-current");
      });

      if (projectCurrent) projectCurrent.textContent = String(currentIndex + 1).padStart(2, "0");
      if (projectProgress) projectProgress.style.transform = `scaleX(${(currentIndex + 1) / slides.length})`;

      if (immediate) requestAnimationFrame(() => projectTrack.classList.remove("is-immediate"));
    }

    function move(direction) {
      updateSlider(currentIndex + direction, direction);
    }

    projectPrevious?.addEventListener("click", () => move(-1));
    projectNext?.addEventListener("click", () => move(1));
    pages.forEach((page) => {
      page.addEventListener("click", () => {
        const nextIndex = Number(page.dataset.slide || 0);
        updateSlider(nextIndex, nextIndex > currentIndex ? 1 : -1);
      });
    });

    projectViewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.key === "Home") {
        event.preventDefault();
        updateSlider(0, -1);
      } else if (event.key === "End") {
        event.preventDefault();
        updateSlider(slides.length - 1, 1);
      }
    });

    projectViewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("a, button")) return;
      startX = event.clientX;
      startY = event.clientY;
      dragX = 0;
      dragging = true;
      horizontalDrag = false;
      suppressClick = false;
      projectViewport.setPointerCapture?.(event.pointerId);
      projectTrack.classList.add("is-dragging");
    });

    projectViewport.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;
      if (!horizontalDrag && Math.abs(deltaX) < 7) return;
      if (!horizontalDrag && Math.abs(deltaY) > Math.abs(deltaX)) return;
      horizontalDrag = true;
      suppressClick = Math.abs(deltaX) > 12;
      dragX = deltaX;
      projectTrack.style.transform = `translate3d(calc(${-currentIndex * 100}% + ${dragX}px), 0, 0)`;
    }, { passive: true });

    function finishDrag(event) {
      if (!dragging) return;
      dragging = false;
      projectTrack.classList.remove("is-dragging");
      projectViewport.releasePointerCapture?.(event.pointerId);
      const threshold = Math.min(95, projectViewport.clientWidth * 0.12);
      if (horizontalDrag && Math.abs(dragX) > threshold) {
        move(dragX < 0 ? 1 : -1);
      } else {
        updateSlider(currentIndex, 0);
      }
      dragX = 0;
      horizontalDrag = false;
    }

    projectViewport.addEventListener("pointerup", finishDrag);
    projectViewport.addEventListener("pointercancel", finishDrag);
    projectViewport.addEventListener("click", (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);

    window.addEventListener("resize", debounce(() => updateSlider(currentIndex, 0, true), 120), { passive: true });
    updateSlider(0, 0, true);
  }

  renderProjectDeck();

  /* -----------------------------------------------------------------------
     EMAIL
     ----------------------------------------------------------------------- */
  const copyButton = $("#copy-email");
  const toast = $("#toast");
  let toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  copyButton?.addEventListener("click", async () => {
    const email = copyButton.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyButton.textContent = "Copied";
      showToast("Email copied to clipboard");
      window.setTimeout(() => { copyButton.textContent = "Copy email"; }, 1800);
    } catch (_) {
      window.location.href = `mailto:${email}`;
    }
  });

  /* -----------------------------------------------------------------------
     NEURAL CANVAS — 30fps, lower DPR, real pause when off-screen
     ----------------------------------------------------------------------- */
  const canvas = $("#neural-canvas");
  if (canvas && !reducedMotion) {
    const context = canvas.getContext("2d", { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let nodes = [];
    let canvasFrame = 0;
    let canvasRunning = false;
    let lastFrameTime = 0;
    let canvasVisible = true;
    let colors = readCanvasPalette();

    function readCanvasPalette() {
      const styles = getComputedStyle(root);
      return {
        node: styles.getPropertyValue("--mint").trim() || "#27deb4",
        link: root.dataset.theme === "light" ? "36, 91, 118" : "123, 160, 197"
      };
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nodeCount = compactViewport.matches
        ? 22
        : Math.max(30, Math.min(48, Math.floor(width / 30)));

      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.2 + 0.65
      }));
    }

    function drawCanvas(time) {
      if (!canvasRunning) return;
      canvasFrame = requestAnimationFrame(drawCanvas);
      if (time - lastFrameTime < 33) return;
      lastFrameTime = time;

      context.clearRect(0, 0, width, height);
      const connectionDistance = compactViewport.matches ? 82 : 108;
      const connectionSquared = connectionDistance * connectionDistance;

      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -8 || node.x > width + 8) node.vx *= -1;
        if (node.y < -8 || node.y > height + 8) node.vy *= -1;

        for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
          const other = nodes[otherIndex];
          const xDistance = node.x - other.x;
          const yDistance = node.y - other.y;
          const distanceSquared = xDistance * xDistance + yDistance * yDistance;
          if (distanceSquared >= connectionSquared) continue;

          const opacity = 0.085 * (1 - distanceSquared / connectionSquared);
          context.beginPath();
          context.strokeStyle = `rgba(${colors.link}, ${opacity.toFixed(3)})`;
          context.lineWidth = 0.7;
          context.moveTo(node.x, node.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }

        context.beginPath();
        context.fillStyle = colors.node;
        context.globalAlpha = 0.18 + node.radius * 0.08;
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    }

    function startCanvas() {
      if (canvasRunning || !canvasVisible || document.hidden) return;
      canvasRunning = true;
      canvasFrame = requestAnimationFrame(drawCanvas);
    }

    function stopCanvas() {
      canvasRunning = false;
      if (canvasFrame) cancelAnimationFrame(canvasFrame);
      canvasFrame = 0;
    }

    if ("IntersectionObserver" in window) {
      const canvasObserver = new IntersectionObserver((entries) => {
        canvasVisible = entries[0]?.isIntersecting ?? true;
        if (canvasVisible) startCanvas();
        else stopCanvas();
      }, { rootMargin: "120px" });
      canvasObserver.observe(canvas);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopCanvas();
      else startCanvas();
    });

    window.addEventListener("resize", debounce(() => {
      resizeCanvas();
      startCanvas();
    }, 160), { passive: true });

    compactViewport.addEventListener?.("change", resizeCanvas);
    window.addEventListener("kb-theme-change", () => { colors = readCanvasPalette(); });

    resizeCanvas();
    startCanvas();
  }

  /* -----------------------------------------------------------------------
     FOOTER
     ----------------------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* -----------------------------------------------------------------------
     HELPERS
     ----------------------------------------------------------------------- */
  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeUrl(value = "") {
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
    } catch (_) {
      return "#";
    }
  }

  function debounce(callback, wait) {
    let timeout = 0;
    return (...args) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => callback(...args), wait);
    };
  }
})();
