/**
 * Accordion — expand/collapse logic
 */
(function() {
  'use strict';

  // Image accordion panels (hover/click expand)
  document.querySelectorAll('[data-image-accordions]').forEach(container => {
    const panels = container.querySelectorAll('[data-accordion-panel]');
    panels.forEach(panel => {
      panel.addEventListener('mouseenter', () => {
        panels.forEach(p => p.classList.remove('is-active'));
        panel.classList.add('is-active');
      });
      panel.addEventListener('click', () => {
        panels.forEach(p => p.classList.remove('is-active'));
        panel.classList.add('is-active');
      });
    });
  });
})();
