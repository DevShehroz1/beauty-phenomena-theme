/**
 * Theme JS — main initialization, global features
 */
(function() {
  'use strict';

  /* ===== Loading Overlay ===== */
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    window.addEventListener('load', () => {
      loadingOverlay.classList.add('is-hidden');
      setTimeout(() => loadingOverlay.remove(), 500);
    });
    // Fallback: hide after 3s even if load doesn't fire
    setTimeout(() => {
      loadingOverlay.classList.add('is-hidden');
    }, 3000);
  }

  /* ===== Quantity Selectors ===== */
  document.addEventListener('click', (e) => {
    const minus = e.target.closest('[data-quantity-minus]');
    const plus = e.target.closest('[data-quantity-plus]');

    if (!minus && !plus) return;

    const container = (minus || plus).closest('[data-quantity-selector]');
    const input = container?.querySelector('[data-quantity-input]');
    if (!input) return;

    let value = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || Infinity;

    if (minus) value = Math.max(min, value - 1);
    if (plus) value = Math.min(max, value + 1);

    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ===== Back to Top ===== */
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
  backToTop.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(backToTop);

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  let backToTopVisible = false;
  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > 600;
    if (shouldShow !== backToTopVisible) {
      backToTopVisible = shouldShow;
      backToTop.classList.toggle('is-visible', shouldShow);
    }
  }, { passive: true });

  /* ===== Focus Trap Utility ===== */
  window.trapFocus = function(element) {
    const focusable = element.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    element.addEventListener('keydown', handleTab);
    first?.focus();

    return () => element.removeEventListener('keydown', handleTab);
  };

  /* ===== Cart Count Updates ===== */
  document.addEventListener('cart:updated', (e) => {
    const cart = e.detail;
    if (cart?.item_count !== undefined) {
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = cart.item_count;
      });
    }
  });

  /* ===== Lazy Load Scripts ===== */
  // Load section-specific scripts as needed
  ['animations.js', 'slideshow.js', 'header.js', 'cart.js', 'accordion.js', 'hotspots.js', 'countdown.js', 'popup.js', 'recently-viewed.js'].forEach(file => {
    const script = document.createElement('script');
    script.src = window.Shopify?.cdnHost
      ? `https://${window.Shopify.cdnHost}/s/files/1/assets/${file}`
      : `/assets/${file}`;
    script.defer = true;
    document.head.appendChild(script);
  });

})();
