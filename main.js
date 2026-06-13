/* ══════════════════════════════════════════════════════════
   KUSAL BISTA PORTFOLIO — ADVANCED INTERACTIONS & ANIMATIONS
   Phase 2 & 3: Advanced Animations, Performance Optimization,
   Premium Polish & Intelligent Scroll Effects
═════════════════════════════════════════════════════════════ */

/* ── PERFORMANCE: Prefers Reduced Motion Support ── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animationEnabled = !prefersReducedMotion;

/* ── CUSTOM CURSOR with Enhanced Interactivity ── */
const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;
let cursorActive = false;

document.addEventListener('mousemove', e => {
  cursorActive = true;
  cursorX = e.clientX;
  cursorY = e.clientY;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
});

// Smoothly lag the ring (GPU-accelerated)
function animateRing() {
  ringX += (cursorX - ringX) * 0.12;
  ringY += (cursorY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  if (animationEnabled) requestAnimationFrame(animateRing);
}
if (animationEnabled) animateRing();

// Expand cursor on interactive elements
const interactiveElements = 'a, button, .tag, .skill-group, .proj-card, .gh-card, .award-card, .clink, .contact-email';
document.querySelectorAll(interactiveElements).forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (!animationEnabled) return;
    cursor.style.transform = 'translate(-50%, -50%) scale(2.8)';
    cursorRing.style.transform = 'translate(-50%, -50%) scale(1.6)';
    cursorRing.style.borderColor = 'rgba(214,74,58,0.9)';
    cursor.style.filter = 'drop-shadow(0 0 8px rgba(214,74,58,0.6))';
  });
  el.addEventListener('mouseleave', () => {
    if (!animationEnabled) return;
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorRing.style.borderColor = 'rgba(214,74,58,0.6)';
    cursor.style.filter = 'drop-shadow(0 0 4px rgba(214,74,58,0.4))';
  });
});

document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  cursorRing.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1';
  cursorRing.style.opacity = '1';
});

/* ── MOBILE NAV TOGGLE with Smooth Animation ── */
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
  });
  
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ══════════════════════════════════════════════════════════
   ADVANCED PARTICLE SYSTEM
   - Optimized for 60fps performance
   - Responsive to mouse interaction
   - Layered particle types for depth
══════════════════════════════════════════════════════════ */

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
let W, H, particles = [], mouse = { x: -9999, y: -9999 };
let lastParticleTime = 0;

function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
function rand(a, b) { return Math.random() * (b - a) + a; }

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x     = rand(0, W);
    this.y     = init ? rand(0, H) : H + 10;
    this.vx    = rand(-0.15, 0.15);
    this.vy    = rand(-0.7, -0.05);
    this.size  = rand(0.8, 2.8);
    this.alpha = rand(0.25, 0.75);
    this.decay = rand(0.0012, 0.003);
    this.a     = this.alpha;
    this.pulse = rand(0, Math.PI * 2);
    this.color = Math.random() < 0.12 ? '#d64a3a'
                 : Math.random() < 0.08 ? '#6b4ba1' : '#1a1a1a';
    this.mass = rand(0.6, 1.4);
  }
  
  update() {
    this.pulse += 0.04;
    const pulseFactor = 1 + Math.sin(this.pulse) * 0.15;

    const dx = this.x - mouse.x, dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    
    // Mouse interaction (optimized)
    if (dist < 140) {
      const f = (140 - dist) / 140 * 0.3;
      this.vx += (dx / (dist + 0.1)) * f * (1 / this.mass);
      this.vy += (dy / (dist + 0.1)) * f * (1 / this.mass);
    }
    
    // Subtle gravity towards center
    this.vx += (W / 2 - this.x) * 0.000008;
    this.vy += (H / 2 - this.y) * 0.000005;
    
    // Air resistance
    this.vx *= 0.987;
    this.vy *= 0.987;
    this.x += this.vx;
    this.y += this.vy;
    this.a -= this.decay;
    this._pulseFactor = pulseFactor;
    
    if (this.a <= 0 || this.y < -10) this.reset(false);
  }
  
  draw() {
    if (this.a <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.a);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * (this._pulseFactor || 1), 0, Math.PI * 2);
    ctx.fill();

    // Glow for accent particles (optimized)
    if (this.color !== '#1a1a1a' && this.a > 0.3) {
      ctx.globalAlpha = Math.max(0, this.a * 0.25);
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawConnections() {
  // Optimized: only check nearby particles
  for (let i = 0; i < particles.length; i++) {
    if (particles[i].a <= 0.1) continue;
    for (let j = i + 1; j < Math.min(particles.length, i + 20); j++) {
      if (particles[j].a <= 0.1) continue;
      const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (d < 90) {
        ctx.save();
        ctx.globalAlpha = (1 - d / 90) * 0.08 * Math.min(particles[i].a, particles[j].a);
        const hasAccent = particles[i].color === '#d64a3a' || particles[j].color === '#d64a3a';
        ctx.strokeStyle = hasAccent ? 'rgba(214,74,58,0.6)' : 'rgba(26,26,26,0.3)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// Enhanced Shooting Star effect
class ShootingStar {
  constructor() { this.reset(); }
  reset() {
    this.x   = rand(0, W);
    this.y   = rand(0, H * 0.35);
    this.len = rand(40, 100);
    this.speed = rand(6, 14);
    this.angle = rand(15, 55) * Math.PI / 180;
    this.alpha = 0;
    this.life  = 0;
    this.maxLife = rand(40, 80);
    this.active = Math.random() < 0.004;
    this.color = Math.random() < 0.6 ? '#d64a3a' : '#6b4ba1';
  }
  
  update() {
    if (!this.active) { 
      if (Math.random() < 0.001) { 
        this.reset(); 
        this.active = true; 
      } 
      return; 
    }
    this.life++;
    this.alpha = this.life < 10 ? this.life / 10 : Math.max(0, 1 - (this.life - 10) / (this.maxLife - 10));
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    if (this.life >= this.maxLife) { this.active = false; }
  }
  
  draw() {
    if (!this.active || this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha * 0.7;
    const grd = ctx.createLinearGradient(
      this.x, this.y,
      this.x - Math.cos(this.angle) * this.len,
      this.y - Math.sin(this.angle) * this.len
    );
    grd.addColorStop(0, this.color === '#d64a3a' ? 'rgba(214,74,58,0.8)' : 'rgba(107,75,161,0.8)');
    grd.addColorStop(1, 'transparent');
    ctx.strokeStyle = grd;
    ctx.lineWidth   = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
    ctx.stroke();
    ctx.restore();
  }
}

// Orbital particles for tech vibe
class OrbitalParticle {
  constructor(centerX, centerY) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = rand(35, 100);
    this.angle = rand(0, Math.PI * 2);
    this.speed = rand(0.001, 0.005);
    this.size = rand(1.2, 2);
    this.color = Math.random() < 0.6 ? '#d64a3a' : '#6b4ba1';
    this.opacity = rand(0.2, 0.6);
  }
  
  update() {
    this.angle += this.speed;
    this.x = this.centerX + Math.cos(this.angle) * this.radius;
    this.y = this.centerY + Math.sin(this.angle) * this.radius;
  }
  
  draw() {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = this.opacity * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let shootingStars = [];
let orbitalParticles = [];
let frameCount = 0;

function initParticles() {
  particles = [];
  const n = Math.min(Math.floor(W * H / 5500), 220);
  for (let i = 0; i < n; i++) particles.push(new Particle());
  shootingStars = Array.from({ length: 3 }, () => new ShootingStar());
  
  orbitalParticles = [];
  for (let i = 0; i < 2; i++) {
    orbitalParticles.push(new OrbitalParticle(W * (0.25 + i * 0.5), H * 0.4));
  }
}

function loop() {
  if (!animationEnabled) return;
  frameCount++;
  
  ctx.clearRect(0, 0, W, H);
  
  // Draw orbital paths (every 3 frames to optimize)
  if (frameCount % 3 === 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 74, 58, 0.06)';
    ctx.lineWidth = 0.8;
    orbitalParticles.forEach(op => {
      ctx.beginPath();
      ctx.arc(op.centerX, op.centerY, op.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }
  
  // Update and draw (GPU-optimized)
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  shootingStars.forEach(s => { s.update(); s.draw(); });
  orbitalParticles.forEach(o => { o.update(); o.draw(); });
  
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

if (animationEnabled) {
  resize();
  initParticles();
  loop();
}

/* ══════════════════════════════════════════════════════════
   INTELLIGENT SCROLL REVEAL SYSTEM
   - Intersection Observer for performance
   - Staggered animations
   - Smart timing calculations
══════════════════════════════════════════════════════════ */

const tlObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      if (animationEnabled) {
        setTimeout(() => e.target.classList.add('show'), i * 80);
      } else {
        e.target.classList.add('show');
      }
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.tl-item').forEach(el => tlObs.observe(el));

const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      if (animationEnabled) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
      } else {
        entry.target.classList.add('visible');
      }
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── COUNTER ANIMATION with Easing ── */
function animateCounter(el) {
  const raw    = el.dataset.target || el.textContent;
  const suffix = raw.replace(/[0-9.]/g, '');
  const target = parseFloat(raw);
  if (isNaN(target)) return;
  
  const duration = 1400;
  const start    = performance.now();
  
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    // Cubic ease-out
    const ease = 1 - Math.pow(1 - t, 3);
    const value = (target * ease).toFixed(target % 1 !== 0 ? 2 : 0);
    el.textContent = value + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      if (animationEnabled) animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.astat .num').forEach(el => {
  el.dataset.target = el.textContent;
  counterObs.observe(el);
});

/* ══════════════════════════════════════════════════════════
   ACTIVE NAVIGATION with Smooth Transitions
══════════════════════════════════════════════════════════ */

const secs  = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');
const nav   = document.querySelector('nav');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  lastScrollY = scrollY;
  
  // Shrink nav on scroll
  if (scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Highlight active link
  let cur = '';
  secs.forEach(s => { 
    if (scrollY >= s.offsetTop - 140) cur = s.id; 
  });
  
  links.forEach(l => {
    const isActive = l.getAttribute('href') === `#${cur}`;
    if (isActive) {
      l.style.color = 'var(--accent)';
      l.style.fontWeight = '700';
    } else {
      l.style.color = '';
      l.style.fontWeight = '500';
    }
  });
}, { passive: true });

/* ── PARALLAX on Hero Elements ── */
const heroLeft = document.querySelector('.hero-left');
const heroRight = document.querySelector('.hero-right');

window.addEventListener('scroll', () => {
  if (!animationEnabled) return;
  const scrolled = window.scrollY;
  if (heroLeft) heroLeft.style.transform = `translateY(${scrolled * 0.12}px)`;
  if (heroRight) heroRight.style.transform = `translateY(${scrolled * 0.07}px)`;
}, { passive: true });

/* ══════════════════════════════════════════════════════════
   ADVANCED HOVER INTERACTIONS
   - Magnetic buttons
   - 3D tilt effect on cards
   - Smooth follow animations
══════════════════════════════════════════════════════════ */

// Magnetic Buttons
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    if (!animationEnabled) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// 3D Tilt Effect on Stat Cards
document.querySelectorAll('.astat').forEach(card => {
  card.addEventListener('mousemove', e => {
    if (!animationEnabled) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `scale(1.01) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    card.style.perspective = '1000px';
  });
  card.addEventListener('mouseleave', () => { 
    card.style.transform = '';
  });
});

// Project Card Shine Effect
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    if (!animationEnabled) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    card.style.backgroundPosition = `${x}% ${y}%`;
  });
});

/* ── GITHUB API with Enhanced Error Handling ── */
async function loadGitHub() {
  const grid = document.getElementById('gh-grid');
  if (!grid) return;
  
  try {
    const res = await fetch('https://api.github.com/users/kusalb/repos?sort=updated&per_page=30&type=public');
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const repos = await res.json();

    const filtered = repos
      .filter(r => !r.fork && r.description)
      .sort((a, b) => (b.stargazers_count + b.watchers_count) - (a.stargazers_count + a.watchers_count))
      .slice(0, 9);

    if (!filtered.length) {
      grid.innerHTML = '<div class="gh-loading">No public repositories found.</div>';
      return;
    }

    grid.innerHTML = '';
    filtered.forEach((repo, i) => {
      const langColors = {
        Python: '#3572A5', JavaScript: '#f1e05a', HTML: '#e34c26',
        CSS: '#563d7c', Jupyter: '#DA5B0B', Shell: '#89e051',
        TypeScript: '#3178c6', Go: '#00ADD8', Rust: '#CE422B'
      };
      const langColor = langColors[repo.language] || '#d64a3a';
      const desc = repo.description
        ? repo.description.slice(0, 85) + (repo.description.length > 85 ? '…' : '')
        : 'No description';
      
      const card = document.createElement('a');
      card.className = 'gh-card reveal';
      card.style.transitionDelay = `${i * 35}ms`;
      card.href   = repo.html_url;
      card.target = '_blank';
      card.rel    = 'noopener noreferrer';
      
      card.innerHTML = `
        <div class="gh-card-top">
          <div class="gh-name">${repo.name.replace(/-/g, ' ')}</div>
          <span class="gh-arrow">↗</span>
        </div>
        <div class="gh-desc">${desc}</div>
        <div class="gh-footer">
          ${repo.language ? `<span class="gh-lang"><span class="gh-lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
          ${repo.stargazers_count > 0 ? `<span class="gh-stars">⭐ ${repo.stargazers_count}</span>` : ''}
          <span class="gh-stars" style="margin-left:auto">${new Date(repo.updated_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</span>
        </div>
      `;
      
      grid.appendChild(card);
    });
    
    // Observe newly added cards
    document.querySelectorAll('.gh-card.reveal').forEach(el => revealObs.observe(el));
  } catch (err) {
    grid.innerHTML = `<div class="gh-loading" style="color:var(--muted)">Could not load repos — <a href="https://github.com/kusalb" target="_blank" style="color:var(--accent); text-decoration: underline;">view on GitHub →</a></div>`;
  }
}

loadGitHub();

/* ── PHOTO CELL RIPPLE EFFECT ── */
document.querySelectorAll('.photo-cell').forEach(cell => {
  cell.addEventListener('click', e => {
    if (!animationEnabled) return;
    const ripple = document.createElement('span');
    const rect   = cell.getBoundingClientRect();
    Object.assign(ripple.style, {
      position: 'absolute',
      width: '0', height: '0',
      borderRadius: '50%',
      background: 'rgba(214,74,58,0.5)',
      left: (e.clientX - rect.left) + 'px',
      top:  (e.clientY - rect.top)  + 'px',
      transform: 'translate(-50%,-50%)',
      animation: 'rippleOut 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      pointerEvents: 'none',
      zIndex: '10',
    });
    cell.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* ── INJECT RIPPLE KEYFRAME ── */
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleOut {
    from { width: 0; height: 0; opacity: 1; }
    to   { width: 180px; height: 180px; opacity: 0; }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 10px rgba(214,74,58,0.4); }
    50% { text-shadow: 0 0 20px rgba(214,74,58,0.8); }
  }
`;
document.head.appendChild(rippleStyle);

/* ══════════════════════════════════════════════════════════
   PERFORMANCE: Lazy Load Animations
   - Only animate when in viewport
   - Reduce motion for accessibility
   - Optimize for mobile devices
══════════════════════════════════════════════════════════ */

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  // Reduce animation complexity on mobile
  document.documentElement.style.setProperty('--duration-normal', '0.2s');
  document.documentElement.style.setProperty('--duration-slow', '0.35s');
}

/* ── SCROLL LOCK for Modals (if needed) ── */
function lockScroll() { document.body.style.overflow = 'hidden'; }
function unlockScroll() { document.body.style.overflow = ''; }

/* ── PRELOAD RESOURCES ── */
if ('loading' in HTMLImageElement.prototype) {
  document.querySelectorAll('img').forEach(img => {
    img.loading = 'lazy';
  });
}

/* ── REPORT WEB VITALS (optional monitoring) ── */
if ('PerformanceObserver' in window) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Log to console in development
        if (entry.name === 'largest-contentful-paint') {
          console.log('LCP:', entry.renderTime || entry.loadTime);
        }
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Silently fail if not supported
  }
}

/* ── DARK MODE TOGGLE (optional future feature) ── */
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) document.documentElement.classList.add('dark-mode');
  
  darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark-mode'));
  });
}

console.log('%c🎨 Kusal Bista Portfolio — World-Class Design & Interactions Loaded', 'color: #d64a3a; font-weight: bold; font-size: 14px;');
