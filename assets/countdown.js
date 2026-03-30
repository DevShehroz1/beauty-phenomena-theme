/**
 * Countdown Timer
 */
(function() {
  'use strict';

  document.querySelectorAll('[data-countdown]').forEach(el => {
    const dateStr = el.dataset.date;
    if (!dateStr) return;

    const endDate = new Date(dateStr).getTime();
    if (isNaN(endDate)) return;

    const daysEl = el.querySelector('[data-countdown-days]');
    const hoursEl = el.querySelector('[data-countdown-hours]');
    const minutesEl = el.querySelector('[data-countdown-minutes]');
    const secondsEl = el.querySelector('[data-countdown-seconds]');

    function update() {
      const now = Date.now();
      const diff = endDate - now;

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
        el.classList.add('is-ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

      // Urgency pulse when under 1 hour
      if (diff < 3600000) {
        el.classList.add('is-urgent');
      }

      requestAnimationFrame(() => setTimeout(update, 1000));
    }

    update();
  });
})();
