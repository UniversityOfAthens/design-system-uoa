// Alert dismissal — progressive enhancement. Without JS the message stays readable;
// with JS the close button removes it. Strings live in the markup (i18n), never here.
//
// Markup: <div class="uoa-alert" data-uoa-alert-dismissible>
//           …
//           <button type="button" class="uoa-alert__close" data-uoa-alert-close
//             aria-label="Απόρριψη">…svg…</button>
//         </div>

export function init(root = document) {
  const scope = root.matches?.('[data-uoa-alert-dismissible]') && root.dataset ? [root] : [];
  const alerts = [...scope, ...root.querySelectorAll?.('[data-uoa-alert-dismissible]') ?? []];
  for (const alert of alerts) {
    if (alert.dataset.uoaInit === 'alert') continue;
    alert.dataset.uoaInit = 'alert';
    alert.querySelector('[data-uoa-alert-close]')?.addEventListener('click', () => {
      alert.dispatchEvent(new CustomEvent('uoa:alert:dismiss', { bubbles: true }));
      alert.remove();
    });
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
}
