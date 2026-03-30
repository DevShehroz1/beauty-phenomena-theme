/**
 * Predictive Search (also loaded by header.js, this handles search page input)
 */
(function() {
  'use strict';
  // Main search page input can also have predictive search
  const input = document.querySelector('.main-search__input');
  if (!input || !window.theme?.settings?.predictiveSearch) return;

  // Predictive search is already handled by header.js for the overlay
  // This script is a placeholder for search page enhancements
})();
