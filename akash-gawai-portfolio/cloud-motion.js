(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('.motion-control');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.hero');
  let userPreference = null;
  let enabled = false;
  let frame = 0;
  let pointer = {x: 0, y: 0};

  try { userPreference = localStorage.getItem('akash-cloud-motion'); } catch { /* Storage is optional. */ }

  function resetPosition() {
    root.style.setProperty('--cloud-look-x', '0px');
    root.style.setProperty('--cloud-look-y', '0px');
    root.style.setProperty('--cloud-parallax-x', '0px');
    root.style.setProperty('--cloud-parallax-y', '0px');
  }

  function updateMotion() {
    // An OS request for reduced motion always takes priority.
    enabled = !reducedMotion.matches && userPreference !== 'off';
    root.dataset.cloudMotion = enabled ? 'on' : 'off';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.querySelector('span').textContent = enabled ? 'Motion on' : 'Motion off';
    toggle.title = reducedMotion.matches ? 'Motion follows your reduced-motion setting' : (enabled ? 'Pause cloud animations' : 'Resume cloud animations');
    toggle.disabled = reducedMotion.matches;
    if (!enabled) {
      cancelAnimationFrame(frame);
      frame = 0;
      resetPosition();
    }
  }

  toggle.hidden = false;
  updateMotion();
  toggle.addEventListener('click', () => {
    userPreference = enabled ? 'off' : 'on';
    try { localStorage.setItem('akash-cloud-motion', userPreference); } catch { /* No persistence needed to use the control. */ }
    updateMotion();
  });
  reducedMotion.addEventListener('change', updateMotion);

  hero.addEventListener('pointermove', event => {
    if (!enabled || !finePointer.matches || event.pointerType === 'touch') return;
    const box = hero.getBoundingClientRect();
    pointer = {
      x: Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - .5) * 2)),
      y: Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - .5) * 2))
    };
    if (!frame) frame = requestAnimationFrame(() => {
      root.style.setProperty('--cloud-look-x', `${(pointer.x * 2.5).toFixed(2)}px`);
      root.style.setProperty('--cloud-look-y', `${(pointer.y * 1.8).toFixed(2)}px`);
      root.style.setProperty('--cloud-parallax-x', `${(pointer.x * 6).toFixed(2)}px`);
      root.style.setProperty('--cloud-parallax-y', `${(pointer.y * 4).toFixed(2)}px`);
      frame = 0;
    });
  }, {passive: true});
  hero.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    resetPosition();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('cloud-offscreen', !entry.isIntersecting));
    }, {rootMargin: '80px'});
    document.querySelectorAll('.cloud-doodle, .cloud-hero-scene').forEach(element => observer.observe(element));
  }
})();
