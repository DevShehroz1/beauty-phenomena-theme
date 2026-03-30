/**
 * Header JS — sticky header, mega menu, mobile menu, search overlay
 */

(function() {
  'use strict';

  /* ===== Sticky Header ===== */
  const header = document.querySelector('.header--sticky');
  if (header) {
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    header.parentNode.insertBefore(sentinel, header);

    const observer = new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(sentinel);
  }

  /* ===== Mega Menu ===== */
  document.querySelectorAll('.header__nav-item.has-submenu').forEach(item => {
    const btn = item.querySelector('button.header__nav-link');
    const megaMenu = item.querySelector('.mega-menu');
    if (!btn || !megaMenu) return;

    let closeTimeout;

    function open() {
      clearTimeout(closeTimeout);
      document.querySelectorAll('.header__nav-item.is-active').forEach(el => {
        if (el !== item) close(el);
      });
      item.classList.add('is-active');
      btn.setAttribute('aria-expanded', 'true');
    }

    function close(el) {
      el = el || item;
      el.classList.remove('is-active');
      el.querySelector('button.header__nav-link')?.setAttribute('aria-expanded', 'false');
    }

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', () => {
      closeTimeout = setTimeout(() => close(), 150);
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (item.classList.contains('is-active')) {
        close();
      } else {
        open();
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        btn.focus();
      }
    });
  });

  /* ===== Mobile Menu ===== */
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const overlay = document.getElementById('overlay');
  const toggleBtns = document.querySelectorAll('[data-mobile-menu-toggle]');
  const closeBtns = document.querySelectorAll('[data-mobile-menu-close]');

  function openMobileMenu() {
    mobileMenu?.classList.add('is-active');
    overlay?.classList.add('is-active');
    mobileMenu?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove('is-active');
    overlay?.classList.remove('is-active');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggleBtns.forEach(btn => btn.addEventListener('click', openMobileMenu));
  closeBtns.forEach(btn => btn.addEventListener('click', closeMobileMenu));
  overlay?.addEventListener('click', () => {
    closeMobileMenu();
    closeSearch();
  });

  // Mobile submenu toggles
  document.querySelectorAll('[data-submenu-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.mobile-menu__item');
      const isActive = item.classList.contains('is-active');

      // Close other submenus
      document.querySelectorAll('.mobile-menu__item.is-active').forEach(el => {
        el.classList.remove('is-active');
        el.querySelector('[data-submenu-toggle]')?.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('is-active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ===== Search Overlay ===== */
  const searchOverlay = document.querySelector('[data-search-overlay]');
  const searchInput = document.querySelector('[data-predictive-search-input]');

  function openSearch() {
    searchOverlay?.classList.add('is-active');
    searchOverlay?.setAttribute('aria-hidden', 'false');
    setTimeout(() => searchInput?.focus(), 100);
  }

  function closeSearch() {
    searchOverlay?.classList.remove('is-active');
    searchOverlay?.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-search-toggle]').forEach(btn => {
    btn.addEventListener('click', openSearch);
  });

  document.querySelectorAll('[data-search-close]').forEach(btn => {
    btn.addEventListener('click', closeSearch);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeMobileMenu();
    }
  });

  /* ===== Predictive Search ===== */
  if (searchInput && window.theme?.settings?.predictiveSearch) {
    let debounceTimer;
    const resultsContainer = document.querySelector('[data-predictive-search-results]');

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();

      if (query.length < 2) {
        if (resultsContainer) resultsContainer.innerHTML = '';
        return;
      }

      debounceTimer = setTimeout(() => {
        fetch(`${window.theme.routes.predictive_search_url}?q=${encodeURIComponent(query)}&resources[type]=product,article,collection,page&resources[limit]=4`, {
          headers: { 'Accept': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
          if (!resultsContainer) return;
          let html = '';
          const resources = data.resources?.results || {};

          if (resources.products?.length) {
            html += '<div class="search-results__group"><h4 class="search-results__title label-text">Products</h4><ul>';
            resources.products.forEach(product => {
              const img = product.image ? `<img src="${product.image}" alt="${product.title}" width="60" height="60" loading="lazy">` : '';
              html += `<li class="search-results__item"><a href="${product.url}">${img}<div><span>${product.title}</span><span class="search-results__price">${product.price}</span></div></a></li>`;
            });
            html += '</ul></div>';
          }

          if (resources.collections?.length) {
            html += '<div class="search-results__group"><h4 class="search-results__title label-text">Collections</h4><ul>';
            resources.collections.forEach(c => {
              html += `<li class="search-results__item"><a href="${c.url}">${c.title}</a></li>`;
            });
            html += '</ul></div>';
          }

          if (resources.articles?.length) {
            html += '<div class="search-results__group"><h4 class="search-results__title label-text">Articles</h4><ul>';
            resources.articles.forEach(a => {
              html += `<li class="search-results__item"><a href="${a.url}">${a.title}</a></li>`;
            });
            html += '</ul></div>';
          }

          resultsContainer.innerHTML = html || '<p class="search-results__empty">No results found</p>';
        })
        .catch(() => {});
      }, 300);
    });
  }
})();
