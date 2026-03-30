/**
 * Collection Page JS — filtering, sorting, infinite scroll
 */
(function() {
  'use strict';

  const section = document.querySelector('.main-collection');
  if (!section) return;

  /* ===== Filter Toggle ===== */
  const filterToggle = section.querySelector('[data-filter-toggle]');
  const filtersPanel = section.querySelector('[data-filters]');

  filterToggle?.addEventListener('click', () => {
    const isHidden = filtersPanel.hidden;
    filtersPanel.hidden = !isHidden;
    filterToggle.querySelector('svg')?.style.setProperty('transform', isHidden ? 'rotate(45deg)' : '');
  });

  /* ===== Sorting ===== */
  const sortSelect = section.querySelector('[data-sort-select]');
  sortSelect?.addEventListener('change', () => {
    const url = new URL(window.location);
    url.searchParams.set('sort_by', sortSelect.value);
    window.location = url.toString();
  });

  /* ===== Filtering (AJAX) ===== */
  const filterInputs = section.querySelectorAll('[data-filter-input]');
  let filterDebounce;

  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      clearTimeout(filterDebounce);
      filterDebounce = setTimeout(applyFilters, 300);
    });
  });

  function applyFilters() {
    const url = new URL(window.location.pathname, window.location.origin);

    // Preserve sort
    if (sortSelect?.value) url.searchParams.set('sort_by', sortSelect.value);

    // Collect checked filters
    filterInputs.forEach(input => {
      if (input.type === 'checkbox' && input.checked) {
        url.searchParams.append(input.name, input.value);
      } else if (input.type === 'number' && input.value) {
        url.searchParams.set(input.name, input.value);
      }
    });

    // Fetch and replace grid
    fetch(url.toString())
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newGrid = doc.querySelector('[data-collection-grid]');
        const currentGrid = section.querySelector('[data-collection-grid]');
        if (newGrid && currentGrid) {
          currentGrid.innerHTML = newGrid.innerHTML;
        }
        // Update URL
        history.pushState(null, '', url.toString());

        // Update count
        const newCount = doc.querySelector('.main-collection__count');
        const currentCount = section.querySelector('.main-collection__count');
        if (newCount && currentCount) currentCount.textContent = newCount.textContent;
      })
      .catch(() => {
        // Fallback: full page reload
        window.location = url.toString();
      });
  }

  /* ===== Infinite Scroll ===== */
  const pagination = section.querySelector('.main-collection__pagination');
  const nextLink = pagination?.querySelector('.pagination__link[aria-label="Next page"]');
  const grid = section.querySelector('[data-collection-grid]');

  if (nextLink && grid) {
    let loading = false;
    const loadMore = () => {
      if (loading) return;
      loading = true;

      const spinner = document.createElement('div');
      spinner.className = 'main-collection__loading text-center';
      spinner.textContent = 'Loading...';
      grid.parentNode.insertBefore(spinner, pagination);

      fetch(nextLink.href)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const newItems = doc.querySelectorAll('[data-collection-grid] > *');
          newItems.forEach(item => grid.appendChild(item));

          // Update next link
          const newNext = doc.querySelector('.pagination__link[aria-label="Next page"]');
          if (newNext) {
            nextLink.href = newNext.href;
          } else {
            pagination.style.display = 'none';
            observer.disconnect();
          }

          spinner.remove();
          loading = false;
        })
        .catch(() => {
          spinner.remove();
          loading = false;
        });
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: '200px' });

    observer.observe(pagination);
  }
})();
