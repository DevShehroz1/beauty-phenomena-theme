/**
 * Shop the Look — Hotspot interactions
 */
(function() {
  'use strict';
  document.querySelectorAll('[data-hotspot]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.hotspot;
      const popup = document.querySelector(`[data-hotspot-popup="${id}"]`);
      // Close all other popups
      document.querySelectorAll('.hotspot__popup.is-active').forEach(p => {
        if (p !== popup) p.classList.remove('is-active');
      });
      document.querySelectorAll('.hotspot.is-active').forEach(h => {
        if (h !== btn) h.classList.remove('is-active');
      });
      popup?.classList.toggle('is-active');
      btn.classList.toggle('is-active');
    });
  });
  // Close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.hotspot__popup.is-active').forEach(p => p.classList.remove('is-active'));
    document.querySelectorAll('.hotspot.is-active').forEach(h => h.classList.remove('is-active'));
  });
})();
