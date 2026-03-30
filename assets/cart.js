/**
 * Cart JS — drawer, AJAX operations, free-shipping bar
 */
(function() {
  'use strict';

  const drawer = document.querySelector('[data-cart-drawer]');
  const overlay = document.getElementById('overlay');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-active');
    drawer.setAttribute('aria-hidden', 'false');
    overlay?.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-active');
    drawer.setAttribute('aria-hidden', 'true');
    overlay?.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // Toggle buttons
  document.querySelectorAll('[data-cart-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.theme?.settings?.cartType === 'page') {
        window.location = window.theme.routes.cart_url;
      } else {
        openDrawer();
      }
    });
  });

  document.querySelectorAll('[data-cart-drawer-close]').forEach(btn => btn.addEventListener('click', closeDrawer));

  // Quick add forms
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-quick-add-form]') || e.target.closest('[data-product-form]');
    if (!form) return;

    // Don't intercept cart page form
    if (form.closest('.main-cart')) return;

    e.preventDefault();
    const formData = new FormData(form);

    fetch(window.theme.routes.cart_add_url, { method: 'POST', body: formData })
      .then(res => res.json())
      .then(() => {
        refreshCart();
        if (window.theme?.settings?.cartType !== 'page') openDrawer();
      })
      .catch(console.error);
  });

  // Remove items
  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-item]');
    if (!removeBtn) return;
    e.preventDefault();
    const key = removeBtn.dataset.removeItem;
    updateItem(key, 0);
  });

  // Quantity changes in drawer
  document.addEventListener('click', (e) => {
    const minus = e.target.closest('[data-quantity-minus]');
    const plus = e.target.closest('[data-quantity-plus]');

    if (!minus && !plus) return;

    const container = (minus || plus).closest('[data-quantity-selector]');
    const input = container?.querySelector('[data-quantity-input]');
    const lineItem = container?.closest('[data-line-key]');

    if (!input || !lineItem) return;

    let qty = parseInt(input.value) || 1;
    if (minus) qty = Math.max(0, qty - 1);
    if (plus) qty = qty + 1;

    input.value = qty;
    const key = lineItem.dataset.lineKey;
    if (key) updateItem(key, qty);
  });

  function updateItem(key, quantity) {
    fetch(window.theme.routes.cart_change_url + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity })
    })
    .then(res => res.json())
    .then(() => refreshCart())
    .catch(console.error);
  }

  function refreshCart() {
    fetch('/?section_id=cart-drawer')
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newDrawer = doc.querySelector('[data-cart-drawer]');
        if (newDrawer && drawer) {
          drawer.innerHTML = newDrawer.innerHTML;
          // Re-attach close listeners
          drawer.querySelectorAll('[data-cart-drawer-close]').forEach(btn => btn.addEventListener('click', closeDrawer));
        }
      });

    // Update cart count in header
    fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        document.querySelectorAll('[data-cart-count]').forEach(el => {
          el.textContent = cart.item_count;
        });
        window.theme.cartCount = cart.item_count;
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
      });
  }

  // Listen for cart updates from other scripts
  document.addEventListener('cart:updated', () => {});
})();
