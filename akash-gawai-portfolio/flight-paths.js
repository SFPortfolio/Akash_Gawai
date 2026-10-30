// Load the renderer only when the section is approaching the viewport.
const section = document.querySelector('#relocation');
const events = new AbortController();
let journey, loading = false, disposed = false;
const buttons = [...section.querySelectorAll('[data-city]')];
const names = buttons.map(b => b.childNodes[0].textContent);
let selected = 4;
buttons.forEach((button, index) => button.addEventListener('click', () => {
  selected = index;
  buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
  section.querySelector('#route-caption').textContent = index === 4 ? 'Hyderabad · Open to opportunities' : `Hyderabad \u2192 ${names[index]}`;
  journey?.select(index);
}, { signal: events.signal }));
const observer = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting || loading) return;
  loading = true;
  try {
    const { createJourney } = await import('./flight-globe.js');
    if (disposed) return;
    journey = await createJourney(section, selected);
    if (disposed) journey.destroy();
    else if (selected !== 4) journey.select(selected);
  } catch (error) {
    section.querySelector('#journey-status').textContent = 'Globe unavailable. Explore all six destinations using the city buttons.';
    console.warn('Flight Paths fallback:', error);
  }
}, { rootMargin: '150px' });
observer.observe(section);
function destroy() { disposed = true; events.abort(); observer.disconnect(); removal.disconnect(); journey?.destroy(); }
window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal: events.signal });
// Also release resources if this section is removed by a future client-side router.
const removal = new MutationObserver(() => { if (!section.isConnected) { destroy(); removal.disconnect(); } });
removal.observe(document.body, { childList: true, subtree: true });

