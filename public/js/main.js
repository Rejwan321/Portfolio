/* ── Scroll progress + nav ─────────────────── */
const nav = document.getElementById('mainNav');
const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', () => {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
  if (progressBar) {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) + '%' : '0';
  }
});

/* ── Mobile menu ────────────────────────────── */
const navToggler = document.getElementById('navToggler');
const mobileMenu = document.getElementById('mobileMenu');

if (navToggler && mobileMenu) {
  navToggler.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    navToggler.innerHTML = open ? '<i class="fa fa-times"></i>' : '<i class="fa fa-bars"></i>';
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      navToggler.innerHTML = '<i class="fa fa-bars"></i>';
    });
  });
}

/* ── Typing animation ───────────────────────── */
const typedTextEl = document.getElementById('typedText');
if (typedTextEl) {
  const words = ['web applications.', 'backend systems.', 'full-stack products.', 'clean APIs.'];
  let wordIndex = 0, charIndex = 0, isDeleting = false, speed = 120;

  function type() {
    const word = words[wordIndex];
    typedTextEl.textContent = isDeleting
      ? word.substring(0, charIndex - 1)
      : word.substring(0, charIndex + 1);

    if (isDeleting) { charIndex--; speed = 55; }
    else             { charIndex++; speed = 120; }

    if (!isDeleting && charIndex === word.length) {
      speed = 1800; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 380;
    }
    setTimeout(type, speed);
  }
  setTimeout(type, 700);
}

/* ── Intersection observer: fade-in ─────────── */
const fadeEls = document.querySelectorAll(
  '.timeline-entry, .principle-card, .dont-card, .skill-category-row, .contact-info-item, .social-link-row'
);

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    io.observe(el);
  });
}

document.addEventListener('animationend', (e) => {
  if (e.target.classList.contains('visible')) {
    e.target.style.opacity = '1';
    e.target.style.transform = 'none';
  }
});

/* Make intersection observer add visible → CSS finishes the animation */
document.head.insertAdjacentHTML('beforeend', `<style>
  .visible { opacity: 1 !important; transform: none !important; }
</style>`);