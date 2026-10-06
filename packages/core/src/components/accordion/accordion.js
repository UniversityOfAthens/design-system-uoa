// Accordion animation + single-open — progressive enhancement.
// Without JS: native <details> toggle (open animates via the CSS grid trick, close is instant).
// With JS: both directions animate smoothly (WAAPI height); single groups auto-collapse.
// Respects prefers-reduced-motion and old browsers (falls back to instant toggle).
//
// Markup: <div class="uoa-accordion" data-uoa-accordion> … </div>
//         <div class="uoa-accordion" data-uoa-accordion="single"> … </div>

const DURATION_FALLBACK = 200;
const EASING_FALLBACK = 'cubic-bezier(0.2, 0, 0, 1)';

function motion() {
  if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }
  let duration = DURATION_FALLBACK;
  let easing = EASING_FALLBACK;
  try {
    const styles = getComputedStyle(document.documentElement);
    duration = parseFloat(styles.getPropertyValue('--uoa-motion-duration-base')) || duration;
    easing = styles.getPropertyValue('--uoa-motion-easing-standard').trim() || easing;
  } catch {
    // Non-DOM env (tests): keep the fallbacks.
  }
  return { duration, easing };
}

function panelOf(item) {
  return item.querySelector(':scope > .uoa-accordion__panel');
}

function animateHeight(panel, from, to, done) {
  const timing = motion();
  panel._uoaAnim?.cancel();
  panel._uoaAnim = null;
  if (!timing || !panel.animate || from === to) return false;
  // Inline transition:none so the CSS grid animation doesn't fight WAAPI.
  panel.style.transition = 'none';
  panel.style.overflow = 'hidden';
  const anim = panel.animate([{ height: `${from}px` }, { height: `${to}px` }], timing);
  panel._uoaAnim = anim;
  const cleanup = () => {
    if (panel._uoaAnim !== anim) return;
    panel._uoaAnim = null;
    panel.style.transition = '';
    panel.style.overflow = '';
  };
  anim.onfinish = () => {
    cleanup();
    done?.();
  };
  anim.oncancel = cleanup;
  return true;
}

export function setOpen(item, open) {
  const panel = panelOf(item);
  if (!panel || item.open === open) {
    item.open = open;
    return;
  }
  if (open) {
    // Measure BEFORE setting open: a closed item hides its subtree (height 0).
    const from = panel.getBoundingClientRect().height;
    item.open = true;
    // scrollHeight is the full content height now that the item is open.
    animateHeight(panel, from, panel.scrollHeight);
  } else {
    const from = panel.getBoundingClientRect().height;
    if (!animateHeight(panel, from, 0)) {
      item.open = false;
      return;
    }
    // Remove `open` when the animation lands; until then the item stays
    // open so a mid-animation re-open reverses smoothly instead of snapping.
    const anim = panel._uoaAnim;
    const prevFinish = anim.onfinish;
    anim.onfinish = () => {
      item.open = false;
      prevFinish?.();
    };
  }
}

function ownItem(group, node) {
  const item = node?.closest?.('details');
  return item && item.closest('[data-uoa-accordion]') === group ? item : null;
}

export function init(root = document) {
  const scope = root.matches?.('[data-uoa-accordion]') && root.dataset ? [root] : [];
  const groups = [...scope, ...(root.querySelectorAll?.('[data-uoa-accordion]') ?? [])];
  for (const group of groups) {
    if (group.dataset.uoaInit === 'accordion') continue;
    group.dataset.uoaInit = 'accordion';
    const single = group.dataset.uoaAccordion === 'single';
    group.addEventListener('click', (event) => {
      // Content links keep working natively (no animation, no collapse change).
      if (event.target.closest?.('a[href]')) return;
      const item = ownItem(group, event.target.closest?.('summary'));
      if (!item) return;
      event.preventDefault();
      setOpen(item, !item.open);
    });
    if (!single) continue;
    group.addEventListener('toggle', (event) => {
      const item = event.target;
      // toggle also fires for popovers and nested groups — only direct <details>
      // children of this group auto-collapse here.
      if (item?.tagName !== 'DETAILS') return;
      if (item.closest('[data-uoa-accordion]') !== group) return;
      if (item.open) {
        for (const sibling of group.querySelectorAll(':scope > details[open]')) {
          if (sibling !== item) setOpen(sibling, false);
        }
      }
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
