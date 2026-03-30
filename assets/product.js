/**
 * Product Page JS — variant selection, gallery, zoom, sticky ATC
 */
(function() {
  'use strict';

  const section = document.querySelector('.main-product');
  if (!section) return;

  let productData;
  try { productData = JSON.parse(section.dataset.productJson); } catch { return; }

  /* ===== Variant Selection ===== */
  const variantSelect = section.querySelector('[data-variant-select]');
  const optionSelectors = section.querySelectorAll('[data-option-selector]');
  const addToCartBtn = section.querySelector('[data-add-to-cart]');
  const variantIdInput = section.querySelector('[data-variant-id]');
  const priceEl = section.querySelector('.price');

  function updateVariant() {
    const selectedOptions = [];
    optionSelectors.forEach(sel => selectedOptions.push(sel.value));

    // Also check swatches
    section.querySelectorAll('.swatch.is-active').forEach(sw => {
      const index = sw.closest('.swatch-list')?.dataset.optionIndex;
      if (index !== undefined) selectedOptions[parseInt(index)] = sw.dataset.value;
    });

    const variant = productData.variants.find(v =>
      v.options.every((opt, i) => opt === selectedOptions[i])
    );

    if (!variant) return;

    // Update hidden select
    if (variantSelect) variantSelect.value = variant.id;
    if (variantIdInput) variantIdInput.value = variant.id;

    // Update button
    if (addToCartBtn) {
      addToCartBtn.disabled = !variant.available;
      addToCartBtn.textContent = variant.available
        ? window.theme.strings.addToCart
        : window.theme.strings.soldOut;
    }

    // Update price
    if (priceEl) {
      const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
      priceEl.className = 'price' + (onSale ? ' price--on-sale' : '');
      const regular = priceEl.querySelector('.price__regular');
      const compare = priceEl.querySelector('.price__compare');
      if (regular) regular.textContent = formatMoney(variant.price);
      if (compare) {
        if (onSale) {
          compare.innerHTML = '<s>' + formatMoney(variant.compare_at_price) + '</s>';
          compare.style.display = '';
        } else {
          compare.style.display = 'none';
        }
      }
    }

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('variant', variant.id);
    history.replaceState(null, '', url.toString());

    // Update gallery to show variant image
    if (variant.featured_media) {
      const mediaId = variant.featured_media.id;
      showMedia(mediaId);
    }

    // Update sticky ATC price
    const stickyPrice = document.querySelector('[data-sticky-price]');
    if (stickyPrice) stickyPrice.textContent = formatMoney(variant.price);
  }

  optionSelectors.forEach(sel => sel.addEventListener('change', updateVariant));

  // Swatch click handling
  section.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      const list = sw.closest('.swatch-list');
      list?.querySelectorAll('.swatch').forEach(s => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      // Update option value display
      const optionLabel = sw.closest('.main-product__option')?.querySelector('[data-option-value]');
      if (optionLabel) optionLabel.textContent = sw.dataset.value;
      updateVariant();
    });
  });

  /* ===== Image Gallery ===== */
  function showMedia(mediaId) {
    section.querySelectorAll('.main-product__media-item').forEach(item => {
      item.classList.toggle('is-active', item.dataset.mediaId == mediaId);
    });
    section.querySelectorAll('.main-product__thumb').forEach(thumb => {
      thumb.classList.toggle('is-active', thumb.dataset.mediaId == mediaId);
    });
  }

  section.querySelectorAll('.main-product__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => showMedia(thumb.dataset.mediaId));
  });

  /* ===== Image Zoom ===== */
  section.querySelectorAll('[data-image-zoom]').forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (!img) return;

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
    });

    wrapper.addEventListener('mouseleave', () => {
      img.style.transformOrigin = 'center center';
    });
  });

  /* ===== Sticky ATC ===== */
  const stickyAtc = document.querySelector('[data-sticky-atc]');
  const buyButtons = section.querySelector('.main-product__buy-buttons');

  if (stickyAtc && buyButtons) {
    const observer = new IntersectionObserver(([entry]) => {
      stickyAtc.classList.toggle('is-visible', !entry.isIntersecting);
      stickyAtc.setAttribute('aria-hidden', entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(buyButtons);

    // Sticky ATC button click
    const stickyBtn = stickyAtc.querySelector('[data-sticky-atc-btn]');
    stickyBtn?.addEventListener('click', () => {
      const form = section.querySelector('[data-product-form]');
      if (form) {
        const formData = new FormData(form);
        fetch(window.theme.routes.cart_add_url, {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(() => {
          document.dispatchEvent(new CustomEvent('cart:updated'));
        });
      }
    });
  }

  /* ===== Quantity Sync ===== */
  const quantityInput = section.querySelector('[data-quantity-input]');
  const quantityValue = section.querySelector('[data-quantity-value]');
  if (quantityInput && quantityValue) {
    quantityInput.addEventListener('change', () => {
      quantityValue.value = quantityInput.value;
    });
  }

  /* ===== Helpers ===== */
  function formatMoney(cents) {
    const format = window.theme?.moneyFormat || '${{amount}}';
    const amount = (cents / 100).toFixed(2);
    return format.replace(/\{\{\s*amount\s*\}\}/, amount);
  }
})();
