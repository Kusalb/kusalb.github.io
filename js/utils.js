/**
 * UTILITY FUNCTIONS
 * Reusable helpers for common operations
 */

const DOMUtils = (() => {
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  return { $, $$ };
})();

const StringUtils = (() => {
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

  return { escapeHtml, safeUrl };
})();

const TimingUtils = (() => {
  function debounce(callback, wait) {
    let timeout = 0;
    return (...args) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => callback(...args), wait);
    };
  }

  return { debounce };
})();