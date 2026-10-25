(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero video: portrait cut on tall screens, pause control, respect reduced motion.
  const video = document.getElementById('heroVideo');
  const pauseBtn = document.getElementById('heroPause');
  const PLAY_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4 L16 10 L6 16 Z"/></svg>';
  const PAUSE_ICON = pauseBtn.querySelector('svg').outerHTML;

  const pickSource = () => {
    const portrait = window.innerWidth / window.innerHeight < 0.8;
    const src = portrait ? video.dataset.portrait : video.dataset.landscape;
    if (!video.currentSrc.endsWith(src)) {
      video.poster = portrait ? video.dataset.posterPortrait : 'assets/img/hero-poster.jpg';
      video.src = src;
      if (!video.dataset.paused) video.play().catch(() => {});
    }
  };
  pickSource();
  window.addEventListener('resize', () => {
    clearTimeout(pickSource.t);
    pickSource.t = setTimeout(pickSource, 250);
  });

  const setPaused = (paused) => {
    video.dataset.paused = paused ? '1' : '';
    if (paused) video.pause();
    else video.play().catch(() => {});
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.querySelector('svg').outerHTML = paused ? PLAY_ICON : PAUSE_ICON;
  };
  pauseBtn.addEventListener('click', () => setPaused(!video.dataset.paused));
  if (reduceMotion) setPaused(true);

  // Solid nav once the hero is behind us.
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  new IntersectionObserver(([e]) => nav.classList.toggle('is-solid', !e.isIntersecting), {rootMargin: '-80px 0px 0px 0px'}).observe(hero);

  // Hand-drawn strokes: measure each path so it can draw itself.
  document.querySelectorAll('.doodle path').forEach((p) => {
    p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 2);
  });

  // Count-up numbers.
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion || !target) return;
    const start = performance.now();
    const dur = 1400;
    const fmt = new Intl.NumberFormat('en-US');
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Reveal on scroll.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('is-in');
        el.querySelectorAll('[data-count]').forEach(countUp);
        if (el.matches('[data-count]')) countUp(el);
        io.unobserve(el);
      });
    },
    {threshold: 0.18, rootMargin: '0px 0px -40px 0px'},
  );
  document.querySelectorAll('[data-reveal], .hero__note .doodle').forEach((el, i) => {
    // Small stagger for siblings that enter together.
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')) : [];
    const idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 5) * 80}ms`;
    io.observe(el);
  });
  // The hero doodle draws right away.
  requestAnimationFrame(() => document.querySelector('.hero__note .doodle')?.classList.add('is-in'));
})();
