/**
 * Animation System — IntersectionObserver-based scroll animations, parallax
 */
(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== Scroll Reveal Animations ===== */
  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animate-on-scroll, .image-reveal').forEach(el => {
      revealObserver.observe(el);
    });

    // Re-observe for dynamically added elements
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.classList?.contains('animate-on-scroll') || node.classList?.contains('image-reveal')) {
            revealObserver.observe(node);
          }
          node.querySelectorAll?.('.animate-on-scroll, .image-reveal').forEach(el => {
            revealObserver.observe(el);
          });
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    // If reduced motion, make everything visible immediately
    document.querySelectorAll('.animate-on-scroll, .image-reveal').forEach(el => {
      el.classList.add('is-visible');
    });
  }

  /* ===== Parallax Effects ===== */
  if (!prefersReducedMotion) {
    const parallaxElements = document.querySelectorAll('.parallax');
    if (parallaxElements.length > 0) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            parallaxElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              if (rect.top < windowHeight && rect.bottom > 0) {
                const offset = (rect.top - windowHeight / 2) * 0.3;
                const img = el.querySelector('img');
                if (img) img.style.transform = `translateY(${offset}px)`;
              }
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /* ===== Text Opacity Animation ===== */
  if (!prefersReducedMotion) {
    const opacityElements = document.querySelectorAll('[data-text-opacity]');
    if (opacityElements.length > 0) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            opacityElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const center = windowHeight / 2;
              const elementCenter = rect.top + rect.height / 2;
              const distance = Math.abs(elementCenter - center);
              const maxDistance = windowHeight / 2;
              const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7);
              el.style.opacity = opacity;
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }
})();
