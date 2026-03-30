/**
 * Slideshow — fade/slide transitions, auto-play, dots, arrows, touch support
 */
(function() {
  'use strict';

  document.querySelectorAll('[data-slideshow]').forEach(container => {
    const section = container.closest('[data-section-type="slideshow"]');
    if (!section) return;

    const slides = container.querySelectorAll('.slideshow__slide');
    const dots = section.querySelectorAll('[data-slide-dot]');
    const prevBtn = section.querySelector('[data-slide-prev]');
    const nextBtn = section.querySelector('[data-slide-next]');
    const autoplay = section.dataset.autoplay === 'true';
    const speed = parseInt(section.dataset.speed || 5, 10) * 1000;
    const parallax = section.dataset.parallax === 'true';

    let current = 0;
    let timer = null;
    let touchStartX = 0;

    function goTo(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slides[current]?.classList.remove('is-active');
      dots[current]?.classList.remove('is-active');

      current = index;

      slides[current]?.classList.add('is-active');
      dots[current]?.classList.add('is-active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAutoplay() {
      if (!autoplay || slides.length <= 1) return;
      stopAutoplay();
      timer = setInterval(next, speed);
    }

    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    // Controls
    prevBtn?.addEventListener('click', () => { prev(); startAutoplay(); });
    nextBtn?.addEventListener('click', () => { next(); startAutoplay(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.slideDot, 10));
        startAutoplay();
      });
    });

    // Pause on hover/focus
    section.addEventListener('mouseenter', stopAutoplay);
    section.addEventListener('mouseleave', startAutoplay);
    section.addEventListener('focusin', stopAutoplay);
    section.addEventListener('focusout', startAutoplay);

    // Touch support
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next(); else prev();
        startAutoplay();
      }
    }, { passive: true });

    // Keyboard
    section.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
      if (e.key === 'ArrowRight') { next(); startAutoplay(); }
    });

    // Parallax
    if (parallax) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const rect = section.getBoundingClientRect();
            const offset = rect.top * 0.5;
            slides.forEach(slide => {
              const img = slide.querySelector('.slideshow__image');
              if (img) img.style.transform = `translateY(${offset}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }

    startAutoplay();
  });
})();
