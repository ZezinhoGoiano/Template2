/**
 * Argentum Advocacia — script.js
 * Funcionalidades: Navbar, Scroll Reveal, Estatísticas,
 * Slider, FAQ Accordion, Acessibilidade, Utilitários.
 */

'use strict';

/* ================================================
   UTILITÁRIOS
================================================ */

/**
 * Seleciona um elemento do DOM
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Seleciona múltiplos elementos do DOM
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {NodeList}
 */
const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Aguarda o DOM estar pronto e executa callback
 * @param {Function} fn
 */
const onReady = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

/**
 * Throttle — limita a frequência de execução de uma função
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
const throttle = (fn, delay = 100) => {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn(...args);
    }
  };
};

/**
 * Debounce — adia a execução de uma função
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
const debounce = (fn, delay = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/* ================================================
   1. REMOVER CLASSE DE LOADING
================================================ */
onReady(() => {
  // Remove a classe que desabilita transições no carregamento
  requestAnimationFrame(() => {
    document.body.classList.remove('js-loading');
  });
});

/* ================================================
   2. NAVBAR — SCROLL + MOBILE MENU
================================================ */
const initNavbar = () => {
  const header      = $('#header');
  const hamburger   = $('#navHamburger');
  const navMenu     = $('#navMenu');
  const navLinks    = $$('.nav__link', navMenu);

  if (!header) return;

  // ----- Efeito blur e redimensionamento ao scroll -----
  const handleScroll = throttle(() => {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
  }, 80);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on init

  // ----- Menu mobile -----
  if (!hamburger || !navMenu) return;

  const openMenu = () => {
    navMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Fechar menu de navegação');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menu de navegação');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Fechar menu ao clicar em link
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Fechar menu ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Fechar menu ao redimensionar para desktop
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth >= 1024) {
      closeMenu();
    }
  }, 150));

  // ----- Active Link ao scroll -----
  const allSections = $$('section[id]');

  const setActiveLink = throttle(() => {
    const scrollPos = window.scrollY + 120;

    allSections.forEach((section) => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = $(`.nav__link[href="#${id}"]`, navMenu);

      if (link) {
        link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
      }
    });
  }, 100);

  window.addEventListener('scroll', setActiveLink, { passive: true });
};

/* ================================================
   3. SCROLL REVEAL (INTERSECTION OBSERVER)
================================================ */
const initScrollReveal = () => {
  const revealEls = $$('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:   0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach((el) => observer.observe(el));
};

/* ================================================
   4. ESTATÍSTICAS ANIMADAS (COUNTER)
================================================ */
const initCounters = () => {
  const counterEls = $$('.stats__item[data-target]');
  if (!counterEls.length) return;

  /**
   * Anima um número de 0 até target
   * @param {Element} el — o elemento .stats__number
   * @param {number} target
   * @param {string} prefix
   * @param {string} suffix
   * @param {number} duration — ms
   */
  const animateCounter = (el, target, prefix, suffix, duration = 1800) => {
    const numberEl = el.querySelector('.stats__number');
    if (!numberEl) return;

    const start     = performance.now();
    const startVal  = 0;

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing easeOutExpo
      const ease     = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current  = Math.floor(startVal + (target - startVal) * ease);

      // Formata números grandes com separador de milhar
      const formatted = target >= 1000
        ? current.toLocaleString('pt-BR')
        : current;

      numberEl.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Valor final exato
        const finalFormatted = target >= 1000
          ? target.toLocaleString('pt-BR')
          : target;
        numberEl.textContent = `${prefix}${finalFormatted}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  // Dispara ao entrar na viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const item   = entry.target;
          const target = parseInt(item.dataset.target, 10);
          const suffix = item.dataset.suffix || '';
          const prefix = item.dataset.prefix || '';

          // Delay baseado na posição no grid
          const index = Array.from(counterEls).indexOf(item);
          setTimeout(() => {
            animateCounter(item, target, prefix, suffix);
          }, index * 150);

          observer.unobserve(item);
        }
      });
    },
    { threshold: 0.4 }
  );

  counterEls.forEach((el) => observer.observe(el));
};

/* ================================================
   5. SLIDER DE DEPOIMENTOS
================================================ */
const initTestimonialsSlider = () => {
  const track    = $('#testimonialsTrack');
  const dotsEl   = $('#testimonialDots');
  const prevBtn  = $('#testimonialPrev');
  const nextBtn  = $('#testimonialNext');

  if (!track || !dotsEl || !prevBtn || !nextBtn) return;

  const cards     = Array.from(track.children);
  const total     = cards.length;
  let current     = 0;
  let autoPlayId  = null;
  let touchStartX = 0;
  let touchEndX   = 0;

  // Define quantos cards mostrar por viewport
  const getVisible = () => {
    if (window.innerWidth < 640)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  // Cria dots de navegação
  const createDots = () => {
    dotsEl.innerHTML = '';
    const visible    = getVisible();
    const totalDots  = Math.ceil(total / visible);

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = `testimonial-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.dataset.index = i;
      dot.addEventListener('click', () => goTo(i * visible));
      dotsEl.appendChild(dot);
    }
  };

  // Atualiza posição e dots
  const updateSlider = () => {
    const visible   = getVisible();
    const cardWidth = track.parentElement.offsetWidth;

    // Calcula offset por card (com gap)
    const gap = 24; // var(--space-6) = 1.5rem = 24px
    const cardW = (cardWidth - gap * (visible - 1)) / visible;

    const offset = current * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Atualiza dots
    const dotEls   = Array.from(dotsEl.children);
    const activeDot = Math.floor(current / visible);

    dotEls.forEach((dot, i) => {
      const isActive = i === activeDot;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Estado dos botões prev/next
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= total - visible;
    prevBtn.style.opacity = current === 0 ? '0.4' : '1';
    nextBtn.style.opacity = current >= total - visible ? '0.4' : '1';
  };

  // Navegação
  const goTo = (index) => {
    const visible = getVisible();
    const maxIdx  = Math.max(0, total - visible);
    current = Math.max(0, Math.min(index, maxIdx));
    updateSlider();
  };

  const prev = () => {
    const visible = getVisible();
    goTo(current - visible);
  };

  const next = () => {
    const visible = getVisible();
    goTo(current + visible);
  };

  // Auto-play
  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayId = setInterval(() => {
      const visible = getVisible();
      if (current >= total - visible) {
        goTo(0);
      } else {
        next();
      }
    }, 5500);
  };

  const stopAutoPlay = () => {
    if (autoPlayId) clearInterval(autoPlayId);
  };

  // Eventos
  prevBtn.addEventListener('click', () => { prev(); startAutoPlay(); });
  nextBtn.addEventListener('click', () => { next(); startAutoPlay(); });

  // Teclado no slider
  track.parentElement.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); startAutoPlay(); }
    if (e.key === 'ArrowRight') { next(); startAutoPlay(); }
  });

  // Touch / swipe
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAutoPlay();
    }
  }, { passive: true });

  // Pausar ao hover
  track.parentElement.addEventListener('mouseenter', stopAutoPlay);
  track.parentElement.addEventListener('mouseleave', startAutoPlay);

  // Pausar ao focar
  track.parentElement.addEventListener('focusin', stopAutoPlay);
  track.parentElement.addEventListener('focusout', startAutoPlay);

  // Responsivo
  window.addEventListener('resize', debounce(() => {
    createDots();
    goTo(0);
  }, 200));

  // Init
  createDots();
  updateSlider();
  startAutoPlay();
};

/* ================================================
   6. FAQ ACCORDION
================================================ */
const initFAQ = () => {
  const faqItems = $$('.faq__item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Fechar todos os outros (comportamento accordion)
      faqItems.forEach((otherItem) => {
        const otherBtn    = otherItem.querySelector('.faq__question');
        const otherAnswer = otherItem.querySelector('.faq__answer');
        if (otherBtn && otherAnswer && otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      // Toggle atual
      btn.setAttribute('aria-expanded', (!isExpanded).toString());
      answer.hidden = isExpanded;

      // Scroll suave para garantir visibilidade
      if (!isExpanded) {
        setTimeout(() => {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
      }
    });
  });
};

/* ================================================
   7. PAINEL DE ACESSIBILIDADE
================================================ */
const initA11yPanel = () => {
  const panel         = $('#a11yPanel');
  const toggleBtn     = $('#a11yToggle');
  const optionsEl     = $('#a11yOptions');
  const btnContrast   = $('#btnContrast');
  const btnFontInc    = $('#btnFontInc');
  const btnFontDec    = $('#btnFontDec');
  const btnReduceMotion = $('#btnReduceMotion');
  const btnReset      = $('#btnReset');

  if (!panel || !toggleBtn || !optionsEl) return;

  // Estado persistido em localStorage
  const state = {
    contrast:     false,
    fontSize:     0,    // offset em %
    reduceMotion: false,
  };

  // Carrega estado salvo
  const loadState = () => {
    try {
      const saved = localStorage.getItem('argentum_a11y');
      if (saved) Object.assign(state, JSON.parse(saved));
    } catch (_) { /* silent */ }
  };

  const saveState = () => {
    try {
      localStorage.setItem('argentum_a11y', JSON.stringify(state));
    } catch (_) { /* silent */ }
  };

  const applyState = () => {
    // Alto contraste
    document.body.classList.toggle('high-contrast', state.contrast);
    btnContrast?.setAttribute('aria-pressed', state.contrast.toString());

    // Tamanho da fonte (aplicado no <html>)
    const baseFontSize = 16;
    const newSize = baseFontSize + state.fontSize;
    document.documentElement.style.fontSize = `${newSize}px`;

    // Redução de animações
    document.body.classList.toggle('reduce-motion', state.reduceMotion);
    btnReduceMotion?.setAttribute('aria-pressed', state.reduceMotion.toString());
  };

  // Toggle painel
  const openPanel = () => {
    optionsEl.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    // Foco no primeiro botão
    const firstBtn = optionsEl.querySelector('.a11y-btn');
    if (firstBtn) firstBtn.focus();
  };

  const closePanel = () => {
    optionsEl.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    isOpen ? closePanel() : openPanel();
  });

  // Fechar com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closePanel();
      toggleBtn.focus();
    }
  });

  // Fechar ao clicar fora do painel
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && toggleBtn.getAttribute('aria-expanded') === 'true') {
      closePanel();
    }
  });

  // --- Botões de controle ---

  // Alto contraste
  btnContrast?.addEventListener('click', () => {
    state.contrast = !state.contrast;
    applyState();
    saveState();
  });

  // Aumentar fonte (máx. +8px)
  btnFontInc?.addEventListener('click', () => {
    if (state.fontSize < 8) {
      state.fontSize += 2;
      applyState();
      saveState();
      announceToScreenReader(`Fonte aumentada para ${16 + state.fontSize}px`);
    }
  });

  // Diminuir fonte (mín. -4px)
  btnFontDec?.addEventListener('click', () => {
    if (state.fontSize > -4) {
      state.fontSize -= 2;
      applyState();
      saveState();
      announceToScreenReader(`Fonte diminuída para ${16 + state.fontSize}px`);
    }
  });

  // Redução de animações
  btnReduceMotion?.addEventListener('click', () => {
    state.reduceMotion = !state.reduceMotion;
    applyState();
    saveState();
  });

  // Redefinir
  btnReset?.addEventListener('click', () => {
    state.contrast     = false;
    state.fontSize     = 0;
    state.reduceMotion = false;
    applyState();
    saveState();
    announceToScreenReader('Preferências de acessibilidade redefinidas');
  });

  // Trap focus dentro do painel quando aberto
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(panel.querySelectorAll('button:not([disabled])'));
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Init
  loadState();
  applyState();
};

/* ================================================
   8. LIVE REGION PARA SCREEN READERS
================================================ */
/**
 * Anuncia mensagem para leitores de tela via ARIA live region
 * @param {string} message
 * @param {string} [politeness='polite']
 */
const announceToScreenReader = (message, politeness = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', politeness);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.style.cssText = `
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0);
    white-space: nowrap; border: 0;
  `;
  document.body.appendChild(announcer);

  requestAnimationFrame(() => {
    announcer.textContent = message;
    setTimeout(() => announcer.remove(), 3000);
  });
};

/* ================================================
   9. SMOOTH SCROLL PARA ÂNCORAS INTERNAS
================================================ */
const initSmoothScroll = () => {
  const HEADER_OFFSET = 80; // altura do header fixo

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });

    // Foco acessível no destino
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  });
};

/* ================================================
   10. ANO ATUAL NO FOOTER
================================================ */
const initCurrentYear = () => {
  const yearEl = $('#currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
};

/* ================================================
   11. PARALLAX LEVE NO HERO
================================================ */
const initHeroParallax = () => {
  const hero = $('.hero');
  if (!hero) return;

  // Desativado se o usuário prefere redução de movimento
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const handleScroll = throttle(() => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      // Move background levemente ao scroll
      hero.style.backgroundPositionY = `calc(30% + ${scrollY * 0.3}px)`;
    }
  }, 16); // ~60fps

  window.addEventListener('scroll', handleScroll, { passive: true });
};

/* ================================================
   12. BOTÃO DE VOLTAR AO TOPO (IMPLICIT via #top)
================================================ */
// O scroll suave para #top já é gerido pelo initSmoothScroll.
// Aqui apenas garantimos que o logo/skip-link funcionem.

/* ================================================
   13. LAZY LOADING NATIVO + FALLBACK
================================================ */
const initLazyLoad = () => {
  // Modern browsers suportam loading="lazy" nativamente.
  // Este fallback existe para browsers mais antigos.
  if ('loading' in HTMLImageElement.prototype) return;

  const images = $$('img[loading="lazy"]');
  if (!images.length) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        imageObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach((img) => imageObserver.observe(img));
};

/* ================================================
   14. MENU MOBILE — PREVENT BACKGROUND SCROLL
       (já tratado no initNavbar, reforço aqui)
================================================ */

/* ================================================
   15. HIGHLIGHT DO LINK DA SEÇÃO ATIVA (CSS class)
================================================ */
// Já tratado no initNavbar com setActiveLink.

/* ================================================
   INICIALIZAÇÃO PRINCIPAL
================================================ */
onReady(() => {
  try { initNavbar();              } catch (e) { console.warn('Navbar error:', e); }
  try { initScrollReveal();        } catch (e) { console.warn('ScrollReveal error:', e); }
  try { initCounters();            } catch (e) { console.warn('Counters error:', e); }
  try { initTestimonialsSlider();  } catch (e) { console.warn('Slider error:', e); }
  try { initFAQ();                 } catch (e) { console.warn('FAQ error:', e); }
  try { initA11yPanel();           } catch (e) { console.warn('A11y panel error:', e); }
  try { initSmoothScroll();        } catch (e) { console.warn('SmoothScroll error:', e); }
  try { initCurrentYear();         } catch (e) { console.warn('Year error:', e); }
  try { initHeroParallax();        } catch (e) { console.warn('Parallax error:', e); }
  try { initLazyLoad();            } catch (e) { console.warn('LazyLoad error:', e); }

  // Log de confirmação em desenvolvimento
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.info('%c✓ Argentum Advocacia — scripts carregados com sucesso.', 'color:#C8A96A;font-weight:bold;');
  }
});

/* ================================================
   ROBOTS.TXT (referência para criação manual)
   User-agent: *
   Allow: /
   Sitemap: https://www.argentumadvocacia.com.br/sitemap.xml
================================================ */
