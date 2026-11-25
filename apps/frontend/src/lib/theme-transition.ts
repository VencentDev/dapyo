type Theme = 'light' | 'dark';

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void) => { finished: Promise<void> };
};

export function changeThemeWithReveal(
  element: HTMLElement,
  nextTheme: Theme,
  applyTheme: () => void,
) {
  const root = document.documentElement;
  const bounds = element.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  root.style.setProperty('--theme-toggle-x', `${x}px`);
  root.style.setProperty('--theme-toggle-y', `${y}px`);
  root.style.setProperty('--theme-toggle-radius', `${radius}px`);

  const updateTheme = () => {
    applyTheme();
    root.classList.toggle('dark', nextTheme === 'dark');
    root.classList.toggle('light', nextTheme === 'light');
    root.style.colorScheme = nextTheme;
  };
  const clearOrigin = () => {
    root.style.removeProperty('--theme-toggle-x');
    root.style.removeProperty('--theme-toggle-y');
    root.style.removeProperty('--theme-toggle-radius');
  };
  const transitionDocument = document as DocumentWithViewTransition;

  if (
    !transitionDocument.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    updateTheme();
    clearOrigin();
    return;
  }

  const transition = transitionDocument.startViewTransition(updateTheme);
  void transition.finished.then(clearOrigin, clearOrigin);
}
