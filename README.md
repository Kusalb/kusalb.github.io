# Kusal Bista — Immersive 3D AI & Data Portfolio

A zero-build portfolio designed for GitHub Pages. It uses semantic HTML, modern CSS and framework-free JavaScript only.

## What makes this version different

- A bespoke **Research Signal Deck** instead of a generic project-card grid
- Six deliberately selected repositories, each with its own animated data instrument
- Numbered pagination, previous/next controls, keyboard navigation and touch dragging
- Project-specific visuals for LLM reasoning, energy forecasting, recommendation networks, sentiment analysis, computer vision and accessibility
- A vertical scroll telemetry rail plus a custom native scrollbar
- Pointer-reactive 3D hero scene, data core, wireframe geometry and floating telemetry
- Dimensional case-study panels, credential cards and timeline details
- Persistent light and dark themes
- Responsive mobile behaviour and full `prefers-reduced-motion` support

## Motion-performance architecture

The animation system is intentionally restrained outside the viewport:

- Scroll updates are batched through `requestAnimationFrame`
- Off-screen sections pause their CSS animations
- The neural canvas stops completely when the hero is not visible
- The neural canvas is capped near 30 fps and uses a reduced node count on mobile
- Pointer tilt is updated once per frame and element bounds are cached during interaction
- The custom cursor renders only while it is moving
- Reveal animations use transform and opacity rather than blur
- Hidden browser tabs pause continuous CSS and canvas motion

## Portfolio content

- Three high-value featured case studies
- Six selected open-source projects in the slider
- Six selected project records are stored locally in `data.js`
- Experience, education and eight certification records
- Downloadable professional profile PDF
- SEO metadata, social-sharing image and Schema.org structured data

## Technology

The deployed website requires only:

- `index.html`
- `styles.css`
- `data.js`
- `main.js`
- Static images and documents

There is no React, Vite, npm, Python, server, database, runtime API request or build step.

## Deploy to GitHub Pages

1. Extract the ZIP.
2. Copy every extracted file and folder directly into the root of `Kusalb/kusalb.github.io`.
3. Commit and push to the `main` branch.
4. Open **Settings → Pages**.
5. Choose **Deploy from a branch**, `main`, and `/ (root)`.

The included `CNAME` keeps `kusalbista.com.np` connected.

```bash
git clone https://github.com/Kusalb/kusalb.github.io.git
cd kusalb.github.io

# Copy the extracted files into this directory.
git add .
git commit -m "Refine portfolio motion and project signal deck"
git push origin main
```

## Preview locally

Double-click `index.html`. The site works directly from the filesystem as well as on GitHub Pages. Google Fonts load when an internet connection is available; system fallbacks are included.

## Change the six slider projects

Edit `data.js`. The slider reads the six static project objects in `SITE_DATA.githubProjects`. Keep exactly six objects for the intended deck layout. Every project is stored locally:

```js
{
  repo: "repository_name",
  title: "Human-readable project title",
  category: "ai",
  featured: true,
  summary: "Outcome-focused project description.",
  technologies: ["LLMs", "RAG", "Jupyter"],
  language: "Jupyter Notebook",
  year: "2024",
  accent: "violet"
}
```

## Certification links

Credential names are based on the supplied professional profile. Where a unique public verification URL was unavailable, the card links to the LinkedIn certification section. Replace `credentialUrl` in `data.js` when a direct verification link becomes available.

## Privacy

The public portfolio displays Adelaide, South Australia, but does not expose a suburb, postcode or phone number.
