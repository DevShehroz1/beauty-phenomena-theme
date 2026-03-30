/**
 * Popup — timing, cookie management
 */
(function() {
  'use strict';

  const popup = document.querySelector('[data-popup]');
  if (!popup) return;

  const COOKIE_NAME = 'popup_dismissed';
  const delay = parseInt(popup.dataset.delay || 5) * 1000;

  if (getCookie(COOKIE_NAME)) return;

  setTimeout(() => {
    popup.classList.add('is-active');
    popup.setAttribute('aria-hidden', 'false');
  }, delay);

  popup.querySelectorAll('[data-popup-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      popup.classList.remove('is-active');
      popup.setAttribute('aria-hidden', 'true');
      setCookie(COOKIE_NAME, '1', 7);
    });
  });

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
  }
})();
