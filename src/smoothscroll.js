const DESKTOP_QUERY = '(min-width: 768px)';
let observer;

function setupScrollLift() {
  if (observer) observer.disconnect();

  const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;

  // Reset any stale state when switching modes
  document.querySelectorAll('.scroll-lift, .scroll-lift-group')
    .forEach(el => el.classList.remove('is-visible'));

  const groups = document.querySelectorAll('.scroll-lift-group');
  const standalone = Array.from(document.querySelectorAll('.scroll-lift'))
    .filter(el => !el.closest('.scroll-lift-group')); // not inside any group

  const targets = isDesktop
    ? [...groups, ...standalone]                 // desktop: whole group + any lone items
    : [...document.querySelectorAll('.scroll-lift')]; // mobile: every card individually (grouped ones included)

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
}

setupScrollLift();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setupScrollLift, 200);
});