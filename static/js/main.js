// ========= YourName.dev — Unified JS (Bootstrap 5 bundle required) =========
document.addEventListener('DOMContentLoaded', () => {
  // --- Utils ---------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Tooltip helper
  function tip(el, msg){
    const t = bootstrap.Tooltip.getInstance(el) || new bootstrap.Tooltip(el, {trigger:'manual'});
    el.setAttribute('data-bs-title', msg);
    if (typeof t.setContent === 'function') t.setContent({'.tooltip-inner': msg});
    t.show(); setTimeout(() => t.hide(), 1200);
  }

  // De-dupe helper (by normalized text OR by data-key)
  // Usage:
  //   add data-dedupe="text" on a container => checks its direct children by text
  //   OR add data-dedupe="text" data-dedupe-target=".child-selector"
  //   OR per-item data-key="unique-key" to dedupe same keys
  function removeDuplicates(container){
    const mode = container.getAttribute('data-dedupe') || 'text';
    const targetSel = container.getAttribute('data-dedupe-target');
    const items = targetSel ? $$(targetSel, container) : Array.from(container.children);
    const seen = new Set();
    items.forEach(node => {
      const keyAttr = node.getAttribute && node.getAttribute('data-key');
      const rawKey = keyAttr || (mode === 'html' ? node.innerHTML : node.textContent || '');
      const key = (rawKey || '').replace(/\s+/g,' ').trim().toLowerCase() + '|' + node.tagName + '|' + node.className;
      if (seen.has(key)) node.remove();
      else seen.add(key);
    });
  }

  function autoDedupe(){
    $$('[data-dedupe]').forEach(removeDuplicates);
  }

  // Run once on load and again whenever DOM mutates (optional)
  autoDedupe();
  const mo = new MutationObserver(() => autoDedupe());
  mo.observe(document.documentElement, {childList:true, subtree:true});

  // --- 1) Bootstrap tooltips ----------------------------------------------
  $$( '[data-bs-toggle="tooltip"]' ).forEach(el => new bootstrap.Tooltip(el));

  // --- 2) Year in footer ---------------------------------------------------
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- 3) Active nav (by data-page or URL hint) ---------------------------
  (function(){
    const page = document.body.getAttribute('data-page') || '';
    if (!page) return;
    $$('.navbar .nav-link').forEach(a => {
      const href = a.getAttribute('href') || '';
      if ((page === 'home' && /index/i.test(href)) || href.includes(page)) a.classList.add('active');
    });
  })();

  // --- 4) Reveal on scroll (with reduced-motion) --------------------------
  (function(){
    const els = $$('.reveal');
    if (els.length === 0) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els.forEach(el => {
      const type = el.dataset.anim || 'fade-up';
      el.classList.add(type);
      const delay = parseInt(el.dataset.delay || '0', 10);
      if (delay) el.style.transitionDelay = `${delay}ms`;
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('active'));
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('active');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
  })();

  // --- 5) Newsletter demo --------------------------------------------------
  $('#newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault();
    $('#newsletterSuccess')?.classList.remove('d-none');
  });

  // --- 6) Portfolio filters ------------------------------------------------
  $$('.pf-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter || 'all';
      $$('#portfolioGrid .project-card').forEach(card => {
        const type = card.dataset.type || '';
        const wrap = card.parentElement || card;
        wrap.classList.toggle('d-none', !(filter === 'all' || type === filter));
      });
      tip(btn, `Showing: ${filter}`);
    });
  });

  // --- 7) Contact form (mailto + WhatsApp) --------------------------------
  (function(){
    const form = $('#contactForm');
    if (!form) return;
    const status = $('#formStatus');
    const waLink = $('#waLink');
    const copyEmailBtn = $('#copyEmail');
    const receiver = form.getAttribute('data-receiver') || 'you@example.com';
    const waNumber = form.getAttribute('data-wa') || '0000000000';

    if (waLink) waLink.setAttribute('href', `https://wa.me/${waNumber}`);

    copyEmailBtn?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(receiver); tip(copyEmailBtn, 'Copied!'); } catch {}
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
      const name = ($('#name')?.value || '').trim();
      const email = ($('#email')?.value || '').trim();
      const phone = ($('#phone')?.value || '').trim();
      const message = ($('#message')?.value || '').trim();
      const subject = encodeURIComponent('New inquiry from portfolio site');
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`);
      window.location.href = `mailto:${receiver}?subject=${subject}&body=${body}`;
      status?.classList.remove('d-none');
    });
  })();

  // --- 8) Live API demo (GitHub Zen) --------------------------------------
  (function(){
    const result = $('#apiResult');
    const loading = $('#apiLoading');
    const copyBtn = $('#apiCopy');
    const refresh = $('#apiRefresh');
    if (!result || !loading) return;

    async function loadZen(){
      loading.classList.remove('d-none');
      result.classList.add('d-none');
      try{
        const res = await fetch('https://api.github.com/zen', { headers:{ 'Accept':'text/plain' }});
        const text = await res.text();
        result.textContent = text;
        result.classList.remove('d-none');
        result.classList.add('accent-pop');
        setTimeout(()=>result.classList.remove('accent-pop'), 600);
      }catch(e){
        result.textContent = 'Failed to load. Try again.';
        result.classList.remove('d-none');
      }finally{
        loading.classList.add('d-none');
      }
    }
    loadZen();
    refresh?.addEventListener('click', loadZen);
    copyBtn?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(result.textContent || ''); tip(copyBtn, 'Copied!'); } catch {}
    });
  })();

  // --- 9) Smooth-scroll for in-page anchors -------------------------------
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // --- 10) Carousel with progress bar -------------------------------------
  (function () {
    const el = $('#feedbackCarousel');
    if (!el) return;
    const carousel = bootstrap.Carousel.getOrCreateInstance(el);
    const progress = $('#fb-progress .bar');
    const hasProgress = !!progress;
    const interval = parseInt(el.getAttribute('data-bs-interval') || '5500', 10);

    function animateProgress() {
      if (!hasProgress) return;
      progress.style.transition = 'none';
      progress.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progress.style.transition = `width ${interval}ms linear`;
          progress.style.width = '100%';
        });
      });
    }

    el.addEventListener('slide.bs.carousel', () => {
      if (hasProgress) { progress.style.transition = 'none'; progress.style.width = '0%'; }
    });
    el.addEventListener('slid.bs.carousel', animateProgress);

    el.addEventListener('mouseenter', () => { carousel.pause(); if (hasProgress) progress.style.transition = 'none'; });
    el.addEventListener('mouseleave', () => { carousel.cycle(); animateProgress(); });

    animateProgress();
  })();

  // --- Optional: call de-dupe on known sections ---------------------------
  // Examples (uncomment or add data-dedupe on containers in HTML):
  // removeDuplicates(document.querySelector('#portfolioGrid'));  // assumes data-dedupe attr present
  // removeDuplicates(document.querySelector('#services'));       // assumes data-dedupe attr present
});
