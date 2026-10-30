import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ArrowRight, Box, CheckCircle2, Download, X } from 'lucide-react';

export function InterfaceButton({ variant = 'secondary', className = '', children, ...props }) {
  return <button type="button" {...props} className={`ng-button ng-button--${variant} ${className}`}>{children}</button>;
}

export function EmptyState({ icon, title, description, action, compact = false }) {
  return <div className={`ng-empty ${compact ? 'ng-empty--compact' : ''}`}>
    <span className="ng-empty__icon" aria-hidden="true">{icon || <Box size={24} />}</span>
    <h3>{title}</h3><p>{description}</p>
    {action && <InterfaceButton onClick={action.onClick}>{action.label}<ArrowRight size={15} /></InterfaceButton>}
  </div>;
}

export function PanelSkeleton({ label = 'Carregando esta área…', className = '' }) {
  return <div className={`ng-panel ng-skeleton-panel ${className}`} role="status" aria-label={label} data-loading-panel>
    <div aria-hidden="true"><span className="ng-skeleton ng-skeleton--eyebrow" /><span className="ng-skeleton ng-skeleton--title" />
      <div className="ng-skeleton-grid">{[0, 1, 2].map((id) => <div key={id} className="ng-skeleton-card"><span className="ng-skeleton" /><span className="ng-skeleton ng-skeleton--number" /><span className="ng-skeleton" /></div>)}</div>
    </div><p>{label}</p>
  </div>;
}

// A single dialog contract for keyboard focus, background isolation and dismissal.
export function DialogSurface({ children, onClose, label = 'Detalhes', titleId, className = '', closeButton = false, initialFocusRef, dismissOnBackdrop = false, priority = false }) {
  const dialog = useRef(null);
  const [returnFocus] = useState(() => document.activeElement);
  const generatedTitle = useId();
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const panel = dialog.current;
    const heading = panel.querySelector('h1,h2,h3');
    if (!titleId && heading) {
      if (!heading.id) heading.id = generatedTitle;
      panel.setAttribute('aria-labelledby', heading.id); panel.removeAttribute('aria-label');
    }
    panel.querySelectorAll('label').forEach((element, index) => {
      if (element.control || element.htmlFor) return;
      const sibling = element.nextElementSibling;
      const control = sibling?.matches('input,select,textarea') ? sibling : null;
      if (!control) return;
      if (!control.id) control.id = `${generatedTitle}-field-${index}`;
      element.htmlFor = control.id;
    });
  }, [children, generatedTitle, titleId]);
  useEffect(() => {
    const panel = dialog.current;
    const overlay = panel.parentElement;
    const previous = returnFocus;
    const overflow = document.body.style.overflow;
    const background = [...document.body.children].filter((element) => element !== overlay && !element.classList.contains('ng-toast') && !['SCRIPT', 'STYLE'].includes(element.tagName));
    const states = background.map((element) => [element, element.inert]);
    background.forEach((element) => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => {
      if (!panel.contains(document.activeElement)) (initialFocusRef?.current || panel.querySelector('input:not([type="hidden"]):not(:disabled),textarea:not(:disabled),select:not(:disabled)') || panel).focus({ preventScroll: true });
    });
    const keydown = (event) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (panel.closest('[inert]') || document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') { event.preventDefault(); close.current?.(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...panel.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter((node) => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
      if (!controls.length) { event.preventDefault(); panel.focus(); return; }
      if (event.shiftKey && (document.activeElement === controls[0] || !controls.includes(document.activeElement))) { event.preventDefault(); controls.at(-1).focus(); }
      else if (!event.shiftKey && (document.activeElement === controls.at(-1) || !controls.includes(document.activeElement))) { event.preventDefault(); controls[0].focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      cancelAnimationFrame(frame); document.removeEventListener('keydown', keydown);
      document.body.style.overflow = overflow;
      states.forEach(([element, inert]) => { if (element.isConnected) element.inert = inert; });
      if (previous?.isConnected && previous.getClientRects().length) previous.focus({ preventScroll: true });
    };
  }, [initialFocusRef, returnFocus]);
  return createPortal(<div className={`ng-modal-backdrop ${priority ? 'ng-modal-backdrop--priority' : ''}`} onClick={(event) => { if (dismissOnBackdrop && event.target === event.currentTarget) onClose?.(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-label={titleId ? undefined : label} tabIndex={-1} className={`ng-dialog ${className}`}>
      {closeButton && <button type="button" className="ng-dialog-close" aria-label="Fechar janela" onClick={onClose}><X size={19} /></button>}
      {children}
    </div>
  </div>, document.body);
}

export function NotificationToast({ notification, onAction, onDismiss }) {
  const error = notification.type === 'error';
  return createPortal(<div className="newgears-toast ng-toast" data-tone={notification.type} role={error ? 'alert' : 'status'} aria-atomic="true">
    <div>{error ? <AlertCircle size={21} /> : notification.type === 'download' ? <Download size={21} /> : <CheckCircle2 size={21} />}
      <span className="ng-toast__message">{notification.msg}</span>
      {notification.action && <InterfaceButton onClick={onAction}>{notification.action.label || 'Desfazer'}</InterfaceButton>}
      <button type="button" data-dismiss aria-label="Fechar notificação" onClick={onDismiss}><X size={17} /></button>
    </div>
  </div>, document.body);
}

export function SectionDisclosure({ title, description, children, defaultOpen = false }) {
  const id = useId();
  return <details className="ng-disclosure" open={defaultOpen || undefined}>
    <summary aria-controls={id}><span><strong>{title}</strong>{description && <small>{description}</small>}</span><span className="ng-disclosure__indicator" aria-hidden="true">+</span></summary>
    <div id={id} className="ng-disclosure__content">{children}</div>
  </details>;
}
