// Prev/next arrows for the reviews row (_includes/section-testimonials.html).
// The row itself is a native scroll-snap scroller, so swipe, trackpad and
// keyboard scrolling work without this; the script only drives the arrows.
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');

  const step = () => {
    const card = track.firstElementChild;
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap);
  };

  const update = () => {
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step() }));
  next.addEventListener('click', () => track.scrollBy({ left: step() }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});
