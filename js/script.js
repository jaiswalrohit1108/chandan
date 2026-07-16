const body = document.body;
const loader = document.querySelector('.loader');
const loadingPercent = document.getElementById('loadingPercent');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.navbar__links');
const navAnchorLinks = [...document.querySelectorAll('.navbar__links a')];
const themeToggle = document.querySelector('.theme-toggle');
const revealElements = [...document.querySelectorAll('.reveal')];
const counters = [...document.querySelectorAll('.counter')];
const galleryItems = [...document.querySelectorAll('.gallery-item')];
const filterButtons = [...document.querySelectorAll('.filter-btn')];
const modal = document.getElementById('imageModal');
const modalImage = modal.querySelector('img');
const modalClose = modal.querySelector('.modal__close');
const progressBar = document.querySelector('.scroll-progress');
const typingText = document.getElementById('typingText');
const liveClock = document.getElementById('liveClock');
const liveDate = document.getElementById('liveDate');
const year = document.getElementById('year');
const backToTop = document.querySelector('.back-to-top');
const testimonialCards = [...document.querySelectorAll('.testimonial')];
const form = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');
const cursor = document.querySelector('.cursor');
const cursorOuter = document.querySelector('.cursor--outer');
const parallaxTarget = document.querySelector('[data-parallax]');

const fullTypingText = "Hi, I'm Chandan Kumar Jaiswal – Founder & CEO – New Kankali Gas Store";
let typingIndex = 0;

const saveTheme = (mode) => localStorage.setItem('nkgs-theme', mode);
const applyTheme = (mode) => {
  body.classList.toggle('light', mode === 'light');
  themeToggle.innerHTML = mode === 'light'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
};

applyTheme(localStorage.getItem('nkgs-theme') || 'dark');

document.addEventListener('DOMContentLoaded', () => {
  const loaderInterval = setInterval(() => {
    const nextValue = Math.min(parseInt(loadingPercent.textContent, 10) + 4, 100);
    loadingPercent.textContent = String(nextValue);
    if (nextValue >= 100) {
      clearInterval(loaderInterval);
      setTimeout(() => loader.classList.add('is-hidden'), 350);
    }
  }, 25);

  setInterval(() => {
    if (typingIndex <= fullTypingText.length) {
      typingText.textContent = fullTypingText.slice(0, typingIndex++);
    }
  }, 56);

  const now = new Date();
  year.textContent = now.getFullYear();
  const updateDateTime = () => {
    const current = new Date();
    liveClock.textContent = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    liveDate.textContent = current.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  updateDateTime();
  setInterval(updateDateTime, 1000);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('counter')) {
          animateCounter(entry.target);
        }
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach((element) => observer.observe(element));
  counters.forEach((counter) => observer.observe(counter));

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navAnchorLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  themeToggle.addEventListener('click', () => {
    const nextTheme = body.classList.contains('light') ? 'dark' : 'light';
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      galleryItems.forEach((item) => {
        const matches = filter === 'all' || item.dataset.category === filter;
        item.style.display = matches ? 'block' : 'none';
      });
    });
  });

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => openModal(item.dataset.full, item.querySelector('img').alt));
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = `${(scrollTop / scrollHeight) * 100}%`;

    const sections = document.querySelectorAll('section[id]');
    let activeId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (scrollTop >= sectionTop) activeId = section.getAttribute('id');
    });
    navAnchorLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));

    backToTop.style.opacity = scrollTop > 500 ? '1' : '0';
    backToTop.style.pointerEvents = scrollTop > 500 ? 'auto' : 'none';

    if (parallaxTarget) {
      parallaxTarget.style.transform = `translateY(${scrollTop * 0.08}px)`;
    }
  });

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  startTestimonialLoop();
  setupRippleEffects();
  setupCursor();
  createConfettiOnButtons();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 8 || message.length < 10) {
      formStatus.textContent = 'Please complete the form with valid details.';
      formStatus.style.color = '#ff8a80';
      return;
    }

    form.reset();
    formStatus.textContent = 'Thank you. Your message has been prepared for follow-up.';
    formStatus.style.color = 'var(--accent)';
  });
});

function animateCounter(element) {
  if (element.dataset.counted === 'true') return;
  element.dataset.counted = 'true';
  const target = Number(element.dataset.target || 0);
  const duration = 1400;
  const start = performance.now();

  const tick = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    element.textContent = Math.floor(target * easeOutCubic(progress)).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
    else if (element.textContent === '0') element.textContent = target.toLocaleString();
  };

  requestAnimationFrame(tick);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function openModal(src, alt) {
  modalImage.src = src;
  modalImage.alt = alt;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

function startTestimonialLoop() {
  let index = 0;
  setInterval(() => {
    testimonialCards.forEach((card) => card.classList.remove('active'));
    index = (index + 1) % testimonialCards.length;
    testimonialCards[index].classList.add('active');
  }, 4200);
}

function setupRippleEffects() {
  document.querySelectorAll('.ripple').forEach((element) => {
    element.addEventListener('click', (event) => {
      const circle = document.createElement('span');
      const diameter = Math.max(element.clientWidth, element.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - element.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - element.getBoundingClientRect().top - radius}px`;
      circle.className = 'ripple-effect';
      const ripple = element.querySelector('.ripple-effect');
      if (ripple) ripple.remove();
      element.appendChild(circle);
    });
  });
}

function setupCursor() {
  const move = (event) => {
    const { clientX, clientY } = event;
    cursor.style.left = `${clientX}px`;
    cursor.style.top = `${clientY}px`;
    cursorOuter.style.left = `${clientX}px`;
    cursorOuter.style.top = `${clientY}px`;
  };
  window.addEventListener('mousemove', move);
}

function createConfettiOnButtons() {
  document.querySelectorAll('.btn, .theme-toggle, .filter-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (event.currentTarget.closest('.contact-form')) return;
      const confettiLayer = document.createElement('span');
      confettiLayer.style.position = 'absolute';
      confettiLayer.style.inset = '0';
      confettiLayer.style.pointerEvents = 'none';
      button.style.position = 'relative';
      button.appendChild(confettiLayer);
      const colors = ['#00c853', '#64dd17', '#ffffff'];
      for (let i = 0; i < 8; i += 1) {
        const particle = document.createElement('i');
        particle.style.position = 'absolute';
        particle.style.width = '6px';
        particle.style.height = '12px';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.background = colors[i % colors.length];
        particle.style.borderRadius = '999px';
        particle.style.transform = `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${18 + i * 2}px)`;
        particle.style.opacity = '0.9';
        particle.style.transition = 'transform 0.7s ease, opacity 0.7s ease';
        confettiLayer.appendChild(particle);
        requestAnimationFrame(() => {
          particle.style.transform = `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${90 + i * 6}px)`;
          particle.style.opacity = '0';
        });
      }
      setTimeout(() => confettiLayer.remove(), 900);
    });
  });
}
