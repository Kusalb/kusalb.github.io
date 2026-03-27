/* ── CUSTOM CURSOR ── */
const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  cursor.style.left = cursorX + 'px';
  cursor.style.top  = cursorY + 'px';
});

// Smoothly lag the ring
function animateRing() {
  ringX += (cursorX - ringX) * 0.12;
  ringY += (cursorY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Expand cursor on interactive elements
document.querySelectorAll('a, button, .tag, .skill-group, .proj-card, .gh-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
    cursorRing.style.transform = 'translate(-50%, -50%) scale(1.5)';
    cursorRing.style.borderColor = 'rgba(255,77,28,0.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorRing.style.borderColor = 'rgba(255,77,28,0.5)';
  });
});

/* ── PARTICLE CANVAS ── */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [], mouse = { x: -9999, y: -9999 };

function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
function rand(a, b) { return Math.random() * (b - a) + a; }

const LANG_COLORS = {
  Python: '#3572A5', JavaScript: '#f1e05a', HTML: '#e34c26',
  CSS: '#563d7c', Jupyter: '#DA5B0B', Shell: '#89e051', default: '#e8e6f0'
};

class Particle {
  constructor() { this.reset(true); }
  reset(init) {
    this.x     = rand(0, W);
    this.y     = init ? rand(0, H) : H + 10;
    this.vx    = rand(-0.15, 0.15);
    this.vy    = rand(-0.55, -0.1);
    this.size  = rand(0.8, 2.8);
    this.alpha = rand(0.2, 0.7);
    this.decay = rand(0.0015, 0.0035);
    this.a     = this.alpha;
    this.pulse = rand(0, Math.PI * 2);
    this.color = Math.random() < 0.12 ? '#ff4d1c'
               : Math.random() < 0.08 ? '#7c3aed' : '#e8e6f0';
  }
  update() {
    this.pulse += 0.05;
    const pulseFactor = 1 + Math.sin(this.pulse) * 0.15;

    const dx = this.x - mouse.x, dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 140) {
      const f = (140 - dist) / 140 * 0.32;
      this.vx += (dx / dist) * f;
      this.vy += (dy / dist) * f;
    }
    // Slight gravity towards center-x
    this.vx += (W / 2 - this.x) * 0.00002;

    this.vx *= 0.98; this.vy *= 0.98;
    this.x += this.vx; this.y += this.vy;
    this.a -= this.decay;
    this._pulseFactor = pulseFactor;
    if (this.a <= 0 || this.y < -10) this.reset(false);
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.a);
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * (this._pulseFactor || 1), 0, Math.PI * 2);
    ctx.fill();

    // Add a soft glow for accent-colored particles
    if (this.color !== '#e8e6f0') {
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
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (d < 95) {
        ctx.save();
        ctx.globalAlpha = (1 - d / 95) * 0.09 * Math.min(particles[i].a, particles[j].a);

        // Color the connection line based on particle colors
        const hasAccent = particles[i].color === '#ff4d1c' || particles[j].color === '#ff4d1c';
        ctx.strokeStyle = hasAccent ? '#ff4d1c' : '#e8e6f0';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// Shooting star effect
class ShootingStar {
  constructor() { this.reset(); }
  reset() {
    this.x   = rand(0, W);
    this.y   = rand(0, H * 0.4);
    this.len = rand(40, 100);
    this.speed = rand(6, 14);
    this.angle = rand(20, 50) * Math.PI / 180;
    this.alpha = 0;
    this.life  = 0;
    this.maxLife = rand(40, 80);
    this.active = Math.random() < 0.005; // rare
  }
  update() {
    if (!this.active) { if (Math.random() < 0.001) { this.reset(); this.active = true; } return; }
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
    grd.addColorStop(0, 'rgba(255,77,28,0.9)');
    grd.addColorStop(1, 'transparent');
    ctx.strokeStyle = grd;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
    ctx.stroke();
    ctx.restore();
  }
}

let shootingStars = [];

function initParticles() {
  particles = [];
  const n = Math.min(Math.floor(W * H / 5000), 220);
  for (let i = 0; i < n; i++) particles.push(new Particle());
  shootingStars = Array.from({ length: 3 }, () => new ShootingStar());
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  shootingStars.forEach(s => { s.update(); s.draw(); });
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => { resize(); initParticles(); });
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
resize(); initParticles(); loop();

/* ── TIMELINE OBSERVER ── */
const tlObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) setTimeout(() => e.target.classList.add('show'), i * 100);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.tl-item').forEach(el => tlObs.observe(el));

/* ── GENERAL SCROLL REVEAL ── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const raw    = el.dataset.target || el.textContent;
  const suffix = raw.replace(/[0-9.]/g, '');
  const target = parseFloat(raw);
  if (isNaN(target)) return;
  const duration = 1400;
  const start    = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
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
      animateCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.astat .num').forEach(el => {
  el.dataset.target = el.textContent;
  counterObs.observe(el);
});

/* ── ACTIVE NAV ── */
const secs  = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a');
const nav   = document.querySelector('nav');

window.addEventListener('scroll', () => {
  // Shrink nav on scroll
  nav.classList.toggle('scrolled', window.scrollY > 60);

  // Highlight active link
  let cur = '';
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
  links.forEach(l => {
    l.style.color = l.getAttribute('href') === `#${cur}` ? 'var(--accent)' : '';
  });
}, { passive: true });

/* ── PARALLAX on hero elements ── */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroLeft = document.querySelector('.hero-left');
  if (heroLeft) heroLeft.style.transform = `translateY(${scrolled * 0.15}px)`;
  const heroRight = document.querySelector('.hero-right');
  if (heroRight) heroRight.style.transform = `translateY(${scrolled * 0.08}px)`;
}, { passive: true });

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ── TILT EFFECT on stat cards ── */
document.querySelectorAll('.astat').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `scale(1.02) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── GITHUB API ── */
async function loadGitHub() {
  const grid = document.getElementById('gh-grid');
  try {
    const res = await fetch('https://api.github.com/users/kusalb/repos?sort=updated&per_page=30&type=public');
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    const filtered = repos
      .filter(r => !r.fork)
      .sort((a, b) => (b.stargazers_count + b.watchers_count) - (a.stargazers_count + a.watchers_count));

    if (!filtered.length) {
      grid.innerHTML = '<div class="gh-loading">No public repositories found.</div>';
      return;
    }

    grid.innerHTML = '';
    filtered.forEach((repo, i) => {
      const langColor = LANG_COLORS[repo.language] || LANG_COLORS.default;
      const desc = repo.description
        ? repo.description.slice(0, 90) + (repo.description.length > 90 ? '…' : '')
        : 'No description provided.';
      const card = document.createElement('a');
      card.className = 'gh-card reveal';
      card.style.transitionDelay = `${i * 40}ms`;
      card.href   = repo.html_url;
      card.target = '_blank';
      card.rel    = 'noopener noreferrer';
      card.innerHTML = `
        <div class="gh-card-top">
          <div class="gh-name">${repo.name}</div>
          <span class="gh-arrow">↗</span>
        </div>
        <div class="gh-desc">${desc}</div>
        <div class="gh-footer">
          ${repo.language ? `<span class="gh-lang"><span class="gh-lang-dot" style="background:${langColor}"></span>${repo.language}</span>` : ''}
          ${repo.stargazers_count > 0 ? `<span class="gh-stars">★ ${repo.stargazers_count}</span>` : ''}
          <span class="gh-stars" style="margin-left:auto">${new Date(repo.updated_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</span>
        </div>`;
      grid.appendChild(card);
    });
    // Observe newly added cards
    document.querySelectorAll('.gh-card.reveal').forEach(el => revealObs.observe(el));
  } catch (err) {
    grid.innerHTML = `<div class="gh-loading" style="color:var(--muted)">Could not load repos — <a href="https://github.com/kusalb" target="_blank" style="color:var(--accent)">view on GitHub ↗</a></div>`;
  }
}
loadGitHub();

/* ── PHOTO CELL RIPPLE ── */
document.querySelectorAll('.photo-cell').forEach(cell => {
  cell.addEventListener('click', e => {
    const ripple = document.createElement('span');
    const rect   = cell.getBoundingClientRect();
    Object.assign(ripple.style, {
      position: 'absolute',
      width: '0', height: '0',
      borderRadius: '50%',
      background: 'rgba(255,77,28,0.3)',
      left: (e.clientX - rect.left) + 'px',
      top:  (e.clientY - rect.top)  + 'px',
      transform: 'translate(-50%,-50%)',
      animation: 'rippleOut 0.6s ease forwards',
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
    to   { width: 200px; height: 200px; opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);
