# Kusal Bista — AI & Data Portfolio

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

