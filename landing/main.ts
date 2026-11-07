// Hero counter: ticks 0 → 100 once, like a full set; static for reduced-motion users.
const counter = document.querySelector<HTMLElement>('[data-count]');
if (!counter) throw new Error('landing: [data-count] element missing');

const TARGET = 100;
const DURATION_MS = 2400;

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  counter.textContent = String(TARGET);
} else {
  const start = performance.now();
  const tick = (now: number): void => {
    const p = Math.min(1, (now - start) / DURATION_MS);
    counter.textContent = String(Math.round(TARGET * (1 - (1 - p) ** 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
