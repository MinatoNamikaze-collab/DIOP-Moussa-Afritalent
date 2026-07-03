/* =========================================
   AfriTalent — main.js (JavaScript vanilla)
   7 fonctionnalités obligatoires
   ========================================= */

// === 1. DARK MODE / LIGHT MODE avec localStorage ===
function initTheme() {
  const savedTheme = localStorage.getItem('afritalent-theme');
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    btn.innerHTML = '<i class="bi bi-moon-fill"></i>';
  } else {
    btn.innerHTML = '<i class="bi bi-sun-fill"></i>';
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    if (isLight) {
      localStorage.setItem('afritalent-theme', 'light');
      btn.innerHTML = '<i class="bi bi-moon-fill"></i>';
    } else {
      localStorage.setItem('afritalent-theme', 'dark');
      btn.innerHTML = '<i class="bi bi-sun-fill"></i>';
    }
  });
}

// === 2. NAVBAR DYNAMIQUE AU SCROLL ===
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// === 3. BOUTON RETOUR EN HAUT ===
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// === 4. ANIMATIONS FADE-IN AU SCROLL (IntersectionObserver) ===
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// === 5. COMPTEURS ANIMÉS (IntersectionObserver) ===
function animateCounter(el, target, duration = 2000, prefix = '', suffix = '') {
  const startTime = performance.now();
  const isFloat = target % 1 !== 0;

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Easing easeOutQuart
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = eased * target;

    if (isFloat) {
      el.textContent = prefix + current.toFixed(1) + suffix;
    } else {
      el.textContent = prefix + Math.floor(current).toLocaleString('fr-FR') + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = prefix + (isFloat ? target.toFixed(1) : target.toLocaleString('fr-FR')) + suffix;
    }
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseFloat(entry.target.dataset.counter);
        const prefix = entry.target.dataset.prefix || '';
        const suffix = entry.target.dataset.suffix || '';
        animateCounter(entry.target, target, 2200, prefix, suffix);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

// === 6. FILTRAGE DYNAMIQUE DES FREELANCES ===
function initFreelanceFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.freelance-card-wrap');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      cards.forEach(card => {
        const shouldShow = filter === 'all' || card.dataset.category === filter;
        if (shouldShow) {
          card.style.display = 'block';
          card.style.animation = 'fadeInCard 0.4s ease forwards';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const noResult = document.getElementById('no-result');
      if (noResult) {
        noResult.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });
}

// === 7. VALIDATION DU FORMULAIRE DE CONTACT ===
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    nom:     { el: document.getElementById('nom'),     min: 2,  label: 'Le nom' },
    prenom:  { el: document.getElementById('prenom'),  min: 2,  label: 'Le prénom' },
    email:   { el: document.getElementById('email'),   regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: "L'email" },
    sujet:   { el: document.getElementById('sujet'),   label: 'Le sujet' },
    message: { el: document.getElementById('message'), min: 20, label: 'Le message' }
  };

  // Validation en temps réel
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (!field.el) return;
    field.el.addEventListener('blur', () => validateField(key, fields));
    field.el.addEventListener('input', () => {
      if (field.el.classList.contains('is-invalid')) validateField(key, fields);
    });
  });

  // Soumission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;
    Object.keys(fields).forEach(key => {
      if (!validateField(key, fields)) allValid = false;
    });

    if (allValid) {
      const successMsg = document.getElementById('success-message');
      if (successMsg) {
        form.style.display = 'none';
        successMsg.style.display = 'block';
      }
    }
  });
}

function validateField(key, fields) {
  const field = fields[key];
  if (!field || !field.el) return true;

  const value = field.el.value.trim();
  let errorMsg = '';

  if (!value) {
    errorMsg = `${field.label} est obligatoire.`;
  } else if (field.regex && !field.regex.test(value)) {
    errorMsg = `${field.label} n'est pas valide (ex: nom@domaine.com).`;
  } else if (field.min && value.length < field.min) {
    errorMsg = `${field.label} doit contenir au moins ${field.min} caractères.`;
  }

  const errorEl = document.getElementById(`${key}-error`);
  if (errorMsg) {
    field.el.classList.add('is-invalid');
    field.el.classList.remove('is-valid');
    if (errorEl) errorEl.textContent = errorMsg;
    return false;
  } else {
    field.el.classList.remove('is-invalid');
    field.el.classList.add('is-valid');
    if (errorEl) errorEl.textContent = '';
    return true;
  }
}

// === UTILITAIRES ===

// Année dynamique dans le footer
function initFooterYear() {
  document.querySelectorAll('.current-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

// Lien actif dans la navbar
function initActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

// Animation CSS pour les cartes filtrées
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInCard {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;
document.head.appendChild(style);

// Délais échelonnés pour les grilles stagger
function initStaggerDelays() {
  document.querySelectorAll('.grid-stagger .fade-in').forEach((el, i) => {
    el.dataset.delay = i * 80;
  });
}

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initBackToTop();
  initScrollAnimations();
  initCounters();
  initFreelanceFilter();
  initContactForm();
  initFooterYear();
  initActiveLink();
  initStaggerDelays();
});

