(function () {
  const nav = document.getElementById('site-nav');
  const menuBtn = document.querySelector('.menu-btn');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.getElementById('hero-dots');
  const form = document.getElementById('search-form');
  const roomGrid = document.getElementById('room-grid');
  const tourModal = document.getElementById('tour-modal');
  const tourImage = document.getElementById('tour-image');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const heroSources = [
    'image/home1.jpg',
    'image/home2.jpg',
    'image/home3.jpg',
    'image/home4.jpg'
  ];
  let heroIndex = 0;
  let heroTimer = null;

  const preloadNextHero = () => {
    const next = heroSources[(heroIndex + 1) % heroSources.length];
    const img = new Image();
    img.decoding = 'async';
    img.src = next;
  };

  const setActiveLink = () => {
    const hash = window.location.hash || '#home';
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === hash);
    });
  };

  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  menuBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = nav.classList.toggle('is-open');
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
      window.setTimeout(setActiveLink, 10);
    });
  });

  window.addEventListener('hashchange', setActiveLink);
  setActiveLink();

  heroSources.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show photo ${index + 1}`);
    if (index === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => {
      heroIndex = index;
      swapHero();
      playHero();
    });
    dotsWrap.appendChild(dot);
  });

  const swapHero = () => {
    if (!heroSlides.length) return;
    const src = heroSources[heroIndex];
    const current = document.querySelector('.hero-slide.is-active');
    const incoming = [...heroSlides].find((slide) => slide !== current) || heroSlides[0];
    const image = incoming.querySelector('img');

    dotsWrap.querySelectorAll('button').forEach((dot, index) => {
      dot.classList.toggle('is-active', index === heroIndex);
    });

    if (current && current.querySelector('img').getAttribute('src') === src) return;

    const show = () => {
      incoming.classList.add('is-active');
      if (current && current !== incoming) current.classList.remove('is-active');
    };

    if (image.getAttribute('src') === src) {
      show();
      return;
    }

    const preload = new Image();
    preload.onload = () => {
      image.src = src;
      image.alt = 'Luviana resort';
      requestAnimationFrame(show);
      preloadNextHero();
    };
    preload.src = src;
  };

  const playHero = () => {
    if (reduceMotion || heroSources.length < 2 || document.hidden) return;
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => {
      heroIndex = (heroIndex + 1) % heroSources.length;
      swapHero();
    }, 7200);
  };

  window.addEventListener('load', () => {
    playHero();
    preloadNextHero();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.clearInterval(heroTimer);
    else playHero();
  });

  const closeSelects = (except) => {
    document.querySelectorAll('.custom-select.is-open').forEach((box) => {
      if (box === except) return;
      box.classList.remove('is-open');
      const trigger = box.querySelector('.custom-select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  };

  document.querySelectorAll('.custom-select').forEach((box) => {
    const trigger = box.querySelector('.custom-select-trigger');
    const menu = box.querySelector('.custom-select-menu');
    const valueEl = box.querySelector('.custom-select-value');
    const input = box.querySelector('input[type="hidden"]');
    const options = [...menu.querySelectorAll('[role="option"]')];

    const setValue = (option) => {
      options.forEach((item) => {
        const selected = item === option;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      valueEl.textContent = option.textContent.trim();
      input.value = option.dataset.value;
      closeSelects();
      trigger.focus();
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const shouldOpen = !box.classList.contains('is-open');
      closeSelects();
      box.classList.toggle('is-open', shouldOpen);
      trigger.setAttribute('aria-expanded', String(shouldOpen));
    });

    options.forEach((option) => {
      option.addEventListener('click', (event) => {
        event.stopPropagation();
        setValue(option);
      });
    });
  });

  document.addEventListener('click', (event) => {
    closeSelects();
    if (!nav.contains(event.target) && !menuBtn.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeSelects();
    closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMenu();
  }, { passive: true });

  const today = new Date();
  const later = new Date();
  later.setDate(today.getDate() + 8);
  const toInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const checkin = form.querySelector('[name="checkin"]');
  const checkout = form.querySelector('[name="checkout"]');
  if (checkin && checkout) {
    checkin.value = toInput(today);
    checkout.value = toInput(later);
    checkin.min = toInput(today);
    checkout.min = toInput(later);
    checkin.addEventListener('change', () => {
      const next = new Date(`${checkin.value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      checkout.min = toInput(next);
      if (checkout.value <= checkin.value) checkout.value = toInput(next);
    });
  }

  const filterRooms = (type) => {
    roomGrid.querySelectorAll('.room-card').forEach((card) => {
      const match = !type || card.dataset.type === type;
      card.classList.toggle('is-hidden', !match);
    });
  };

  document.querySelectorAll('.stay-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stay-tab').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      filterRooms(tab.dataset.filter);
      document.getElementById('rooms').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const active = document.querySelector('.stay-tab.is-active');
    filterRooms(active ? active.dataset.filter : 'resort');
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelectorAll('.heart').forEach((button) => {
    button.addEventListener('click', () => {
      const liked = button.classList.toggle('is-liked');
      button.setAttribute('aria-pressed', String(liked));
      button.innerHTML = liked
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';
    });
  });

  document.querySelectorAll('.accordion').forEach((accordion) => {
    accordion.querySelectorAll('.acc-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.parentElement;
        const open = item.classList.contains('is-open');
        accordion.querySelectorAll('.acc-item').forEach((row) => row.classList.remove('is-open'));
        if (!open) item.classList.add('is-open');
      });
    });
  });

  const tourSources = ['image/home1.jpg', 'image/home2.jpg', 'image/r2.jpg', 'image/ami.jpg', 'image/re.jpg'];
  let tourIndex = 0;
  let tourTimer = null;

  const playTour = () => {
    window.clearInterval(tourTimer);
    tourTimer = window.setInterval(() => {
      tourIndex = (tourIndex + 1) % tourSources.length;
      tourImage.src = tourSources[tourIndex];
    }, 2200);
  };

  document.querySelectorAll('[data-open="tour-modal"]').forEach((button) => {
    button.addEventListener('click', () => {
      tourIndex = 0;
      tourImage.src = tourSources[0];
      tourModal.showModal();
      playTour();
    });
  });

  tourModal.addEventListener('close', () => window.clearInterval(tourTimer));

  document.querySelectorAll('[data-stagger]').forEach((parent) => {
    const direction = parent.getAttribute('data-stagger') || 'up';
    Array.from(parent.children).forEach((child, index) => {
      child.classList.add('reveal');
      child.setAttribute('data-reveal', direction);
      child.style.setProperty('--delay', `${index * 0.1}s`);
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img').src;
      tourImage.src = src;
      tourModal.showModal();
      window.clearInterval(tourTimer);
    });
  });
})();
