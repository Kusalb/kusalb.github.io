# Project Structure Documentation

## Overview

This portfolio site is organized into modular folders for better maintainability and scalability.

```
kusalb.github.io/
├── index.html              # Main entry point
├── 404.html                # Custom error page
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── CNAME                   # GitHub Pages custom domain
├── site.webmanifest        # PWA manifest
├── .nojekyll               # Disable Jekyll processing
│
├── css/                    # Stylesheets
│   ├── base.css            # Theme, variables, resets
│   ├── utilities.css       # Layout, spacing, animations
│   └── components.css      # Reusable UI components
│
├── js/                     # JavaScript modules
│   ├── main.js             # Main application logic
│   ├── utils.js            # Helper functions
│   └── data.js             # Site data
│
├── assets/                 # Static resources
│   ├── images/             # Optimized images (webp, png)
│   │   ├── profile/        # Profile photos
│   │   └── icons/          # SVG icons and symbols
│   ├── documents/          # PDFs, resumes
│   │   └── resume.pdf
│   ├── photos/             # Gallery content
│   └── data/               # JSON data files
│
└── docs/                   # Project documentation
    ├── STRUCTURE.md        # This file
    ├── SETUP.md            # Getting started
    └── DEPLOYMENT.md       # Deployment guide
```

## File Organization Strategy

### CSS (`/css`)

- **base.css** (~400 lines)
  - CSS variables (themes, colors, sizing)
  - HTML/body resets
  - Focus states and accessibility
  - Font loading from Google Fonts

- **utilities.css** (~300 lines)
  - Layout utilities (.container, .section-pad)
  - Animation utilities (.reveal)
  - Visibility helpers
  - Text utilities

- **components.css** (~400 lines)
  - Header and navigation styles
  - Button variants
  - Card components
  - Interactive elements

### JavaScript (`/js`)

- **main.js** (~900 lines)
  - Complete application logic
  - Event listeners and handlers
  - DOM manipulation
  - Animation frame management
  - All functionality from original single file

- **utils.js** (~60 lines)
  - DOMUtils: querySelector helpers
  - StringUtils: HTML escaping, URL validation
  - TimingUtils: Debounce functions

- **data.js** (embedded in index.html via script tag)
  - SITE_DATA object
  - Portfolio content
  - Experience timeline
  - GitHub projects
  - Credentials

### Assets (`/assets`)

- **images/**
  - Profile pictures (webp + png fallback)
  - SVG icons
  - Optimized for web delivery

- **documents/**
  - PDF resume
  - Certification files
  - Linked from portfolio

- **photos/**
  - Project screenshots (if needed)
  - Gallery images

## Loading Order in HTML

```html
<!-- CSS Order (specificity from broad to specific) -->
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/utilities.css">
<link rel="stylesheet" href="css/components.css">

<!-- Data first -->
<script src="js/data.js"></script>

<!-- Utilities then main -->
<script src="js/utils.js"></script>
<script src="js/main.js"></script>
```

## Performance Notes

- CSS is split for maintainability but loaded sequentially (minimal perf impact)
- All JavaScript is vanilla (no dependencies)
- GitHub Pages compatible (no build process)
- Static delivery optimized for GitHub's CDN

## Version Control

- Modular structure makes diffs clearer
- Easier to track which sections changed
- Better for collaborative editing
- Reduced merge conflicts
