// Tabs (WAI-ARIA tabs pattern, automatic activation) — progressive enhancement.
// Without JS the buttons are inert and every panel stays visible, so content is
// never lost. With JS: roving tabindex, Arrow/Home/End keys, click activation.
//
// Markup: <div class="uoa-tabs" data-uoa-tabs>
//           <div class="uoa-tabs__list" aria-label="…">
//             <button type="button" class="uoa-tabs__tab" id="tab-1" aria-controls="panel-1">…</button>
//           <section class="uoa-tabs__panel" id="panel-1" aria-labelledby="tab-1" tabindex="0">…
// IDs and aria-controls/aria-labelledby live in the markup (adapters output them);
// this module only adds roles, selection state and behaviour.

export function init(root = document) {
  const scope = root.matches?.('[data-uoa-tabs]') && root.dataset ? [root] : [];
  const groups = [...scope, ...(root.querySelectorAll?.('[data-uoa-tabs]') ?? [])];
  for (const group of groups) {
    if (group.dataset.uoaInit === 'tabs') continue;
    group.dataset.uoaInit = 'tabs';
    const list = group.querySelector(':scope > .uoa-tabs__list');
    const tabs = [...group.querySelectorAll(':scope > .uoa-tabs__list > .uoa-tabs__tab')];
    if (!list || tabs.length === 0) continue;
    list.setAttribute('role', 'tablist');
    for (const tab of tabs) {
      tab.setAttribute('role', 'tab');
      const panel = panelFor(tab);
      panel?.setAttribute('role', 'tabpanel');
    }
    select(group, tabs[0], false);

    list.addEventListener('click', (event) => {
      const tab = event.target.closest?.('.uoa-tabs__tab');
      if (!tab || tab.closest('[data-uoa-tabs]') !== group) return;
      select(group, tab, false);
      tab.focus();
    });
    list.addEventListener('keydown', (event) => {
      const tab = event.target.closest?.('.uoa-tabs__tab');
      if (!tab || tab.closest('[data-uoa-tabs]') !== group) return;
      const current = tabs.indexOf(tab);
      const rtl = getComputedStyle(group).direction === 'rtl';
      let next = null;
      if (event.key === 'ArrowRight') next = rtl ? current - 1 : current + 1;
      else if (event.key === 'ArrowLeft') next = rtl ? current + 1 : current - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      // Automatic activation: moving focus selects (WAI-ARIA recommended default).
      select(group, tabs[(next + tabs.length) % tabs.length], true);
    });
  }
}

function panelFor(tab) {
  const id = tab.getAttribute('aria-controls');
  return id ? tab.ownerDocument.getElementById(id) : null;
}

export function select(group, active, focus) {
  const tabs = [...group.querySelectorAll(':scope > .uoa-tabs__list > .uoa-tabs__tab')];
  for (const tab of tabs) {
    const selected = tab === active;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = panelFor(tab);
    if (panel) panel.hidden = !selected;
  }
  if (focus) active.focus();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  } else {
    init();
  }
}
