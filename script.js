document.addEventListener('DOMContentLoaded', () => {

  /* ================= Document progress rail ================= */
  const progressFill = document.getElementById('progressFill');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    progressFill.style.width = pct + '%';
  }

  /* ================= NAV: scroll state + mobile toggle ================= */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    updateProgress();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    });
  });

  /* ================= Hero "track changes" redline headline ================= */
  const delEl = document.getElementById('redlineDel');
  const insEl = document.getElementById('redlineIns');

  const phrases = [
    { del: 'raw datasets', ins: 'regulatory-ready documents.' },
    { del: 'protocols', ins: 'audit-proof CSRs.' },
    { del: 'literature', ins: 'submission-ready CERs.' },
    { del: 'findings', ins: 'clear scientific narratives.' }
  ];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let phraseIndex = 0;

  function typeText(el, text, speed){
    return new Promise(resolve => {
      el.textContent = '';
      let i = 0;
      if (prefersReducedMotion){ el.textContent = text; resolve(); return; }
      const timer = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length){ clearInterval(timer); resolve(); }
      }, speed);
    });
  }

  function eraseText(el, speed){
    return new Promise(resolve => {
      if (prefersReducedMotion){ el.textContent=''; resolve(); return; }
      const timer = setInterval(() => {
        const t = el.textContent;
        if (t.length === 0){ clearInterval(timer); resolve(); return; }
        el.textContent = t.slice(0, -1);
      }, speed);
    });
  }

  async function runRedlineCycle(){
    if (prefersReducedMotion){
      delEl.textContent = '';
      insEl.textContent = phrases[0].ins;
      return;
    }
    while(true){
      const { del, ins } = phrases[phraseIndex];

      // show strikethrough phrase
      await typeText(delEl, del, 32);
      await wait(650);

      // type insertion while deletion stays struck-through
      await typeText(insEl, ins, 26);
      await wait(2200);

      // clear both, move to next
      await eraseText(insEl, 14);
      await eraseText(delEl, 14);
      await wait(200);

      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  function wait(ms){ return new Promise(r => setTimeout(r, ms)); }
  runRedlineCycle();

  /* ================= Scroll reveal (IntersectionObserver) ================= */
  const revealTargets = document.querySelectorAll('.reveal, .tl-entry');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(t => io.observe(t));

  /* ================= Ticker count-up (Module 1.0) ================= */
  const tickerNums = document.querySelectorAll('.ticker-num');
  const tickerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animateCount(entry.target);
        tickerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  tickerNums.forEach(n => tickerObserver.observe(n));

  function animateCount(el){
    const target = parseInt(el.dataset.count, 10);
    if (prefersReducedMotion){ el.textContent = target; return; }
    const duration = 1100;
    const start = performance.now();
    function frame(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ================= Footer year ================= */
  document.getElementById('year').textContent = new Date().getFullYear();

});
