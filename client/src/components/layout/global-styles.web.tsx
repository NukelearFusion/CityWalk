import { useEffect } from 'react';
import { colors } from '@/theme';

const STYLE_ID = 'trasa-global-styles';

/**
 * Document-level CSS that no component can express: page background behind
 * overscroll, a scrollbar in the brand colours, a visible keyboard focus ring,
 * and the reduced-motion switch — the same set the Apex site keeps globally.
 */
const CSS = `
html, body { background: ${colors.background}; }
::selection { background: ${colors.accentSoft}; }
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-track { background: ${colors.background}; }
::-webkit-scrollbar-thumb {
  background: ${colors.border};
  border-radius: 999px;
  border: 3px solid ${colors.background};
}
::-webkit-scrollbar-thumb:hover { background: ${colors.accent}; }
:focus-visible { outline: 2px solid ${colors.accent}; outline-offset: 3px; border-radius: 6px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;

export function GlobalStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const element = document.createElement('style');
    element.id = STYLE_ID;
    element.textContent = CSS;
    document.head.appendChild(element);
  }, []);

  return null;
}
