// app.js (mejorado)
// 1) Navegación por cards (secciones principales) + hash + localStorage
// 2) Tabs por semanas en Cronograma + localStorage
// 3) Acordeones por actividad (accesibles, con maxHeight estable)
// 4) Accesibilidad: teclado, ARIA, focus management
// 5) Robusto: ignora clicks inválidos y evita errores si faltan nodos

document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------
  // Helpers
  // ---------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STORAGE = {
    section: 'musicala_brochure_active_section',
    week: 'musicala_brochure_active_week'
  };

  const safeId = (id) => (typeof id === 'string' ? id.trim().replace(/^#/, '') : '');
  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const smoothScrollToEl = (el, offset = 16) => {
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  };

  const setHash = (id) => {
    const clean = safeId(id);
    if (!clean) return;
    // replaceState evita que el back button se vuelva un infierno
    history.replaceState(null, '', `#${clean}`);
  };

  // ---------------------------
  // 1) Secciones + Cards menu
  // ---------------------------
  const cards = $$('.cards-menu__item');
  const sections = $$('.content-section');

  // Solo consideramos "cards" del menú principal (los anchors también tienen esa clase en tu HTML)
  // Filtramos: si es <button> o tiene data-target, lo tratamos como card del menú.
  const navCards = cards.filter((el) => el.hasAttribute('data-target'));

  const sectionById = (id) => sections.find((s) => s.id === id);

  const setActiveCard = (targetId) => {
    navCards.forEach((card) => {
      const cardTarget = safeId(card.getAttribute('data-target'));
      card.classList.toggle('is-active', cardTarget === targetId);
      // ARIA para accesibilidad
      card.setAttribute('aria-current', cardTarget === targetId ? 'page' : 'false');
    });
  };

  const setActiveSection = (targetId, opts = {}) => {
    const { scroll = true, updateHash = true, persist = true, focus = false } = opts;

    const id = safeId(targetId);
    if (!id) return;

    const section = sectionById(id);
    if (!section) return;

    sections.forEach((s) => s.classList.toggle('is-active', s.id === id));
    setActiveCard(id);

    // Persistencia
    if (persist) {
      try { localStorage.setItem(STORAGE.section, id); } catch (_) {}
    }

    // Hash
    if (updateHash) setHash(id);

    // Scroll hacia el inicio de la sección activa
    if (scroll) smoothScrollToEl(section, 16);

    // Focus opcional (útil si se navega con teclado)
    if (focus) {
      // Enfoca el primer heading si existe
      const heading = $('h1, h2, h3', section);
      if (heading) heading.setAttribute('tabindex', '-1');
      (heading || section).focus?.();
      if (heading) heading.removeAttribute('tabindex');
    }

    // Cuando se cambia de sección, recalcula acordeones visibles
    refreshOpenAccordions(section);
  };

  // Click en cards
  if (navCards.length && sections.length) {
    navCards.forEach((card) => {
      // Botón accesible por teclado
      if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      const activate = () => {
        const targetId = safeId(card.getAttribute('data-target'));
        if (targetId) setActiveSection(targetId, { scroll: true, updateHash: true, persist: true });
      };

      card.addEventListener('click', activate);

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  // Navegación por hash (deep link)
  const goToHashSectionIfValid = () => {
    const hashId = safeId(window.location.hash);
    if (hashId && sectionById(hashId)) {
      setActiveSection(hashId, { scroll: true, updateHash: true, persist: true });
      return true;
    }
    return false;
  };

  // Carga inicial: 1) hash 2) localStorage 3) card marcada 4) primera sección
  (() => {
    if (goToHashSectionIfValid()) return;

    // localStorage
    let saved = '';
    try { saved = safeId(localStorage.getItem(STORAGE.section)); } catch (_) {}
    if (saved && sectionById(saved)) {
      setActiveSection(saved, { scroll: false, updateHash: true, persist: false });
      return;
    }

    // card activa (HTML)
    const initialCard = $('.cards-menu__item.is-active[data-target]');
    const initialTarget = initialCard ? safeId(initialCard.getAttribute('data-target')) : '';
    if (initialTarget && sectionById(initialTarget)) {
      setActiveSection(initialTarget, { scroll: false, updateHash: true, persist: true });
      return;
    }

    // fallback: primera sección existente
    const first = sections[0];
    if (first) setActiveSection(first.id, { scroll: false, updateHash: true, persist: true });
  })();

  // Si cambia el hash manualmente
  window.addEventListener('hashchange', () => {
    goToHashSectionIfValid();
  });

  // ---------------------------
  // 2) Tabs de semanas (Cronograma)
  // ---------------------------
  const weekTabs = $$('.schedule-tab');
  const weekPanels = $$('.week-panel');

  const activateWeek = (week, opts = {}) => {
    const { persist = true } = opts;
    const w = safeId(week); // por si llega "#1"
    if (!w) return;

    weekTabs.forEach((tab) => {
      const tWeek = safeId(tab.getAttribute('data-week'));
      const isActive = tWeek === w;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    weekPanels.forEach((panel) => {
      const pWeek = safeId(panel.getAttribute('data-week-panel'));
      const isActive = pWeek === w;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');

      // Ajuste de acordeones abiertos dentro del panel activo
      if (isActive) refreshOpenAccordions(panel);
    });

    if (persist) {
      try { localStorage.setItem(STORAGE.week, w); } catch (_) {}
    }
  };

  if (weekTabs.length && weekPanels.length) {
    // Set ARIA roles
    const tabsWrap = $('.schedule-tabs');
    if (tabsWrap) tabsWrap.setAttribute('role', 'tablist');

    weekTabs.forEach((tab, idx) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', idx === 0 ? '0' : '-1');

      const w = safeId(tab.getAttribute('data-week'));
      const panel = weekPanels.find((p) => safeId(p.getAttribute('data-week-panel')) === w);
      if (panel) {
        // Vinculación accesible
        const tabId = tab.id || `week-tab-${w}`;
        const panelId = panel.id || `week-panel-${w}`;
        tab.id = tabId;
        panel.id = panelId;
        tab.setAttribute('aria-controls', panelId);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabId);
      }

      tab.addEventListener('click', () => {
        const week = safeId(tab.getAttribute('data-week'));
        if (week) activateWeek(week, { persist: true });
      });

      // Navegación por flechas en tabs
      tab.addEventListener('keydown', (e) => {
        const currentIndex = weekTabs.indexOf(tab);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          let nextIndex = (currentIndex + dir + weekTabs.length) % weekTabs.length;
          weekTabs[nextIndex].focus();
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const week = safeId(tab.getAttribute('data-week'));
          if (week) activateWeek(week, { persist: true });
        }
      });
    });

    // Semana por defecto: saved > 1
    let savedWeek = '';
    try { savedWeek = safeId(localStorage.getItem(STORAGE.week)); } catch (_) {}
    if (savedWeek && weekPanels.some((p) => safeId(p.getAttribute('data-week-panel')) === savedWeek)) {
      activateWeek(savedWeek, { persist: false });
    } else {
      activateWeek('1', { persist: true });
    }
  }

  // ---------------------------
  // 3) Acordeones por actividad
  // ---------------------------
  const activityToggles = $$('.activity-toggle');

  // Configura ARIA en acordeones
  activityToggles.forEach((toggle, idx) => {
    const content = toggle.nextElementSibling;
    if (!content) return;

    toggle.setAttribute('role', 'button');
    toggle.setAttribute('tabindex', '0');

    const toggleId = toggle.id || `acc-toggle-${idx + 1}`;
    const contentId = content.id || `acc-content-${idx + 1}`;
    toggle.id = toggleId;
    content.id = contentId;

    toggle.setAttribute('aria-controls', contentId);
    toggle.setAttribute('aria-expanded', toggle.classList.contains('is-open') ? 'true' : 'false');
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', toggleId);

    // Estado inicial
    if (toggle.classList.contains('is-open') || content.classList.contains('is-open')) {
      openAccordion(toggle, content, false);
    } else {
      closeAccordion(toggle, content, false);
    }

    const onToggle = () => {
      const isOpen = toggle.classList.contains('is-open');
      if (isOpen) closeAccordion(toggle, content, true);
      else openAccordion(toggle, content, true);
    };

    toggle.addEventListener('click', onToggle);
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    });
  });

  function openAccordion(toggle, content, animate = true) {
    toggle.classList.add('is-open');
    content.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');

    // Reset para medir bien
    content.style.maxHeight = 'none';
    const target = content.scrollHeight;

    // Para animación suave (si CSS usa transición en max-height)
    if (!animate || prefersReducedMotion()) {
      content.style.maxHeight = 'none';
      return;
    }

    content.style.maxHeight = '0px';
    requestAnimationFrame(() => {
      content.style.maxHeight = `${target}px`;
    });

    // Una vez termine la transición, dejamos "none" para que responda a contenido dinámico
    const onEnd = (e) => {
      if (e.propertyName !== 'max-height') return;
      content.style.maxHeight = 'none';
      content.removeEventListener('transitionend', onEnd);
    };
    content.addEventListener('transitionend', onEnd);
  }

  function closeAccordion(toggle, content, animate = true) {
    toggle.classList.remove('is-open');
    content.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');

    if (!animate || prefersReducedMotion()) {
      content.style.maxHeight = null;
      return;
    }

    // Si estaba en none, primero medimos altura real para poder animar hacia 0
    const currentHeight = content.scrollHeight;
    content.style.maxHeight = `${currentHeight}px`;

    requestAnimationFrame(() => {
      content.style.maxHeight = '0px';
    });

    const onEnd = (e) => {
      if (e.propertyName !== 'max-height') return;
      content.style.maxHeight = null;
      content.removeEventListener('transitionend', onEnd);
    };
    content.addEventListener('transitionend', onEnd);
  }

  // Recalcula maxHeight de acordeones abiertos dentro de un contenedor (panel/sección)
  function refreshOpenAccordions(container = document) {
    const openToggles = $$('.activity-toggle.is-open', container);
    openToggles.forEach((toggle) => {
      const content = toggle.nextElementSibling;
      if (!content) return;
      // Si está abierto, dejamos maxHeight en none para que el contenido se ajuste
      content.style.maxHeight = 'none';
    });
  }

  // ---------------------------
  // 4) Extras: clicks en anchors internos que apunten a secciones del brochure
  // ---------------------------
  // Si alguien hace click en <a href="#cronograma">, activa la sección de una
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;

    const target = safeId(a.getAttribute('href'));
    if (!target) return;

    // Si la sección existe, interceptamos para usar nuestro activador
    if (sectionById(target)) {
      e.preventDefault();
      setActiveSection(target, { scroll: true, updateHash: true, persist: true, focus: false });
    }
  });
});
