// Coalesce pointer events into one update per frame. Read all fixed geometry
// before writing one shared direction, so both pupils respond together.
export function createGazeTracker({
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = frame => cancelAnimationFrame(frame),
} = {}) {
  const pending = new WeakMap();

  function updateGaze(surface, { clientX, clientY }) {
    const queued = pending.get(surface);
    if (queued) {
      queued.clientX = clientX;
      queued.clientY = clientY;
      return;
    }
    const input = { clientX, clientY, frame: null };
    pending.set(surface, input);
    input.frame = requestFrame(() => {
      if (pending.get(surface) !== input) return;
      pending.delete(surface);
      const whites = [...surface.querySelectorAll('.eye-white')];
      if (!whites.length) return;
      const bounds = surface.getBoundingClientRect();
      const centres = whites.map(white => {
        const rect = white.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      });
      const x = centres.reduce((sum, eye) => sum + eye.x, 0) / centres.length;
      const y = centres.reduce((sum, eye) => sum + eye.y, 0) / centres.length;
      const lookX = 3 * Math.tanh((input.clientX - x) / Math.max(50, bounds.width * .22));
      const lookY = 2 * Math.tanh((input.clientY - y) / Math.max(50, bounds.height * .22));
      surface.style.setProperty('--look-x', `${lookX}px`);
      surface.style.setProperty('--look-y', `${lookY}px`);
    });
  }

  function resetGaze(surface) {
    const input = pending.get(surface);
    if (input) cancelFrame(input.frame);
    pending.delete(surface);
    surface.style.removeProperty('--look-x');
    surface.style.removeProperty('--look-y');
  }

  return { updateGaze, resetGaze };
}

export const { updateGaze, resetGaze } = createGazeTracker();
