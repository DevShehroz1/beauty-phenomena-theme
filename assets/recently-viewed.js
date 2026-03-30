/**
 * Recently Viewed Products — localStorage tracking + rendering
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'recently-viewed';
  const MAX_PRODUCTS = 20;

  function getViewed() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveViewed(handles) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(handles)); }
    catch {}
  }

  // Track current product
  if (window.location.pathname.includes('/products/')) {
    const handle = window.location.pathname.split('/products/')[1]?.split('?')[0]?.split('#')[0];
    if (handle) {
      let viewed = getViewed();
      viewed = viewed.filter(h => h !== handle);
      viewed.unshift(handle);
      if (viewed.length > MAX_PRODUCTS) viewed = viewed.slice(0, MAX_PRODUCTS);
      saveViewed(viewed);
    }
  }

  // Render recently viewed sections
  document.querySelectorAll('[data-recently-viewed]').forEach(section => {
    const grid = section.querySelector('[data-recently-viewed-grid]');
    if (!grid) return;

    const viewed = getViewed();
    const currentHandle = window.location.pathname.split('/products/')[1]?.split('?')[0];
    const handles = viewed.filter(h => h !== currentHandle).slice(0, 4);

    if (handles.length === 0) { section.style.display = 'none'; return; }

    handles.forEach(handle => {
      fetch(`/products/${handle}.js`)
        .then(res => res.json())
        .then(product => {
          const card = document.createElement('div');
          const img = product.featured_image ? `<img src="${product.featured_image}" alt="${product.title}" loading="lazy" class="product-card__image product-card__image--primary">` : '';
          card.innerHTML = `
            <div class="product-card">
              <a href="/products/${handle}" class="product-card__link">
                <div class="product-card__media media">${img}</div>
              </a>
              <div class="product-card__info">
                <a href="/products/${handle}" class="product-card__title">${product.title}</a>
                <div class="price"><span class="price__regular">${(product.price / 100).toFixed(2)}</span></div>
              </div>
            </div>`;
          grid.appendChild(card);
        })
        .catch(() => {});
    });
  });
})();
