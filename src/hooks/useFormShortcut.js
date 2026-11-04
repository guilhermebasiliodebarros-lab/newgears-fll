import { useEffect } from 'react';

export default function useFormShortcut(enabled, selector, onHandled) {
  useEffect(() => {
    if (!enabled) return undefined;
    let frame;
    const focus = () => {
      const input = document.querySelector(selector);
      if (!input) return false;
      frame = requestAnimationFrame(() => { input.focus({ preventScroll: true }); input.scrollIntoView({ block: 'center', behavior: 'instant' }); onHandled?.(); });
      return true;
    };
    const observer = new MutationObserver(() => { if (focus()) observer.disconnect(); });
    if (!focus()) observer.observe(document.getElementById('workspace-content') || document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [enabled, selector, onHandled]);
}
