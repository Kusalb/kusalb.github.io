# Setup & Development Guide

## Local Development

### Prerequisites
- Git
- Browser with dev tools (Chrome, Firefox, Safari)
- Text editor (VS Code recommended)
- Node.js (optional, for local server)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Kusalb/kusalb.github.io.git
cd kusalb.github.io

# Start a local server (using Python)
python -m http.server 8000
# or Node.js
npx http-server

# Visit http://localhost:8000
```

## File Organization

```
Project Root/
├── index.html         (Main page)
├── css/               (Stylesheets)
│   ├── base.css       (Variables & resets)
│   ├── utilities.css  (Layout & helpers)
│   └── components.css (UI elements)
├── js/                (Scripts)
│   ├── main.js        (Core logic)
│   ├── utils.js       (Helpers)
│   └── data.js        (Content)
└── assets/            (Static resources)
    ├── images/
    ├── documents/
    └── data/
```

## Editing Content

### Update Portfolio Data

Edit `js/data.js`:

```javascript
window.SITE_DATA = {
  githubUsername: "your-handle",
  roles: ["Your role 1", "Your role 2"],
  experience: [ /* timeline items */ ],
  credentials: [ /* cert items */ ],
  // ... etc
};
```

### Update Styles

1. **Colors/Themes**: Edit `css/base.css` CSS variables
2. **Layout**: Modify `css/utilities.css`
3. **Components**: Update `css/components.css`

### Update HTML

Edit `index.html` for:
- Meta tags
- Hero section text
- Main page structure

## Browser Testing

### Light Theme
- Set `data-theme="light"` in `<html>` tag
- Or toggle via theme button

### Mobile Responsiveness
- Test at 320px, 768px, 1024px, 1440px
- Check touch interactions

### Accessibility
- Use keyboard navigation (Tab, Enter, Arrow keys)
- Test with screen reader
- Check color contrast ratios

## Debugging

### Console Errors
```javascript
// Check in browser DevTools
window.SITE_DATA // Verify data loads
DOMUtils.$('#element-id') // Test DOM queries
```

### Common Issues

1. **Styles not loading**
   - Check CSS file paths are relative
   - Verify link tags in HTML

2. **JavaScript errors**
   - Open DevTools Console
   - Check file paths in script tags
   - Verify data.js loads before main.js

3. **Layout breaks on mobile**
   - Check viewport meta tag
   - Test CSS media queries
   - Review container widths
