// Editor side of every UOA block. Plain JS on the wp.* globals, no build step.
//
// The front end is always the PHP render callback (blocks/<name>/render.php), which
// outputs @uoa/core's reference markup. Here:
// - leaf blocks (badge, button, icon, card, breadcrumb) preview that same PHP output
//   through ServerSideRender and are edited in the sidebar;
// - container blocks (alert, accordion, tabs) draw the core classes around InnerBlocks
//   so the content is edited in place, and save only their inner blocks.
// The core's CSS styles the canvas; nothing here adds styles or behaviour.
(function (wp) {
  const { registerBlockType } = wp.blocks;
  const { createElement: el, Fragment } = wp.element;
  const {
    InspectorControls, InnerBlocks, RichText, MediaUpload, MediaUploadCheck,
    useBlockProps, useInnerBlocksProps,
  } = wp.blockEditor;
  const {
    PanelBody, TextControl, TextareaControl, SelectControl, ToggleControl, Button, Placeholder,
  } = wp.components;
  const { useSelect, useDispatch } = wp.data;
  const { __, sprintf } = wp.i18n;
  const ServerSideRender = wp.serverSideRender;

  const D = 'uoa-blocks';
  const icons = (window.uoaBlocks && window.uoaBlocks.icons) || {};

  // --- Shared pieces --------------------------------------------------------------

  const statusOptions = () => [
    { value: 'neutral', label: __('Ουδέτερο', D) },
    { value: 'info', label: __('Πληροφορία', D) },
    { value: 'success', label: __('Επιτυχία', D) },
    { value: 'warning', label: __('Προειδοποίηση', D) },
    { value: 'danger', label: __('Κίνδυνος', D) },
  ];

  const iconOptions = (none) =>
    [{ value: '', label: none }].concat(Object.keys(icons).map((name) => ({ value: name, label: name })));

  // The core's inline <svg>, drawn from the icon set the plugin passes in.
  const svg = (name, className) =>
    icons[name]
      ? el('svg', {
          className,
          'aria-hidden': true,
          focusable: false,
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          dangerouslySetInnerHTML: { __html: icons[name] },
        })
      : null;

  const set = (setAttributes, key) => (value) => setAttributes({ [key]: value });

  const inspector = (title, ...controls) =>
    el(InspectorControls, null, el(PanelBody, { title }, ...controls));

  // The PHP render output, so the canvas shows exactly what the site will.
  function Preview({ name, attributes, empty, urlQueryArgs }) {
    return el(
      'div',
      useBlockProps(),
      el(ServerSideRender, {
        block: name,
        attributes,
        urlQueryArgs,
        EmptyResponsePlaceholder: () => el(Placeholder, { label: empty }),
      }),
    );
  }

  // Content blocks allowed inside a panel or a message.
  const paragraph = (placeholder) => [['core/paragraph', { placeholder }]];

  // --- Badge ----------------------------------------------------------------------

  registerBlockType('uoa/badge', {
    edit({ attributes, setAttributes }) {
      return el(
        Fragment,
        null,
        inspector(
          __('Σήμα', D),
          el(TextControl, { label: __('Κείμενο', D), value: attributes.text, onChange: set(setAttributes, 'text') }),
          el(SelectControl, {
            label: __('Παραλλαγή', D),
            help: __('Το κείμενο λέει τι σημαίνει το σήμα· το χρώμα μόνο το συνοδεύει.', D),
            value: attributes.variant,
            options: statusOptions(),
            onChange: set(setAttributes, 'variant'),
          }),
        ),
        el(Preview, { name: 'uoa/badge', attributes, empty: __('Γράψτε το κείμενο του σήματος στις ρυθμίσεις.', D) }),
      );
    },
    save: () => null,
  });

  // --- Button ---------------------------------------------------------------------

  registerBlockType('uoa/button', {
    edit({ attributes, setAttributes }) {
      const iconOnly = !attributes.text && attributes.icon;
      return el(
        Fragment,
        null,
        inspector(
          __('Κουμπί', D),
          el(TextControl, { label: __('Κείμενο', D), value: attributes.text, onChange: set(setAttributes, 'text') }),
          el(TextControl, {
            label: __('Διεύθυνση (URL)', D),
            help: __('Με διεύθυνση γίνεται σύνδεσμος. Χρησιμοποιήστε τον όταν το κουμπί οδηγεί σε άλλη σελίδα.', D),
            type: 'url',
            value: attributes.url,
            onChange: set(setAttributes, 'url'),
          }),
          el(SelectControl, {
            label: __('Παραλλαγή', D),
            value: attributes.variant,
            options: [
              { value: 'primary', label: __('Κύριο', D) },
              { value: 'secondary', label: __('Δευτερεύον', D) },
              { value: 'tertiary', label: __('Τριτεύον', D) },
            ],
            onChange: set(setAttributes, 'variant'),
          }),
          el(SelectControl, {
            label: __('Μέγεθος', D),
            value: attributes.size,
            options: [
              { value: 'default', label: __('Κανονικό', D) },
              { value: 'sm', label: __('Μικρό', D) },
            ],
            onChange: set(setAttributes, 'size'),
          }),
          el(ToggleControl, {
            label: __('Πλήρες πλάτος', D),
            checked: attributes.fullWidth,
            onChange: set(setAttributes, 'fullWidth'),
          }),
          el(SelectControl, {
            label: __('Εικονίδιο', D),
            value: attributes.icon,
            options: iconOptions(__('Χωρίς εικονίδιο', D)),
            onChange: set(setAttributes, 'icon'),
          }),
          iconOnly &&
            el(TextControl, {
              label: __('Προσβάσιμο όνομα', D),
              help: __('Υποχρεωτικό όταν το κουμπί έχει μόνο εικονίδιο: το διαβάζουν οι αναγνώστες οθόνης.', D),
              value: attributes.label,
              onChange: set(setAttributes, 'label'),
            }),
          el(ToggleControl, {
            label: __('Ανενεργό', D),
            checked: attributes.disabled,
            onChange: set(setAttributes, 'disabled'),
          }),
        ),
        el(Preview, { name: 'uoa/button', attributes, empty: __('Γράψτε το κείμενο του κουμπιού στις ρυθμίσεις.', D) }),
      );
    },
    save: () => null,
  });

  // --- Icon -----------------------------------------------------------------------

  registerBlockType('uoa/icon', {
    edit({ attributes, setAttributes }) {
      return el(
        Fragment,
        null,
        inspector(
          __('Εικονίδιο', D),
          el(SelectControl, {
            label: __('Εικονίδιο', D),
            help: __('Διακοσμητικό: οι αναγνώστες οθόνης το παραλείπουν. Το νόημα το φέρει το κείμενο δίπλα του.', D),
            value: attributes.name,
            options: iconOptions(__('Επιλέξτε…', D)),
            onChange: set(setAttributes, 'name'),
          }),
          el(SelectControl, {
            label: __('Μέγεθος', D),
            value: attributes.size,
            options: [
              { value: 'sm', label: __('Μικρό', D) },
              { value: 'default', label: __('Κανονικό', D) },
              { value: 'lg', label: __('Μεγάλο', D) },
            ],
            onChange: set(setAttributes, 'size'),
          }),
        ),
        el(Preview, { name: 'uoa/icon', attributes, empty: __('Επιλέξτε εικονίδιο στις ρυθμίσεις.', D) }),
      );
    },
    save: () => null,
  });

  // --- Breadcrumb -----------------------------------------------------------------

  registerBlockType('uoa/breadcrumb', {
    edit({ attributes, context }) {
      const postId = useSelect(
        (select) => context.postId || (select('core/editor') && select('core/editor').getCurrentPostId()),
        [context.postId],
      );
      return el(Preview, {
        name: 'uoa/breadcrumb',
        attributes,
        urlQueryArgs: postId ? { post_id: postId } : undefined,
        empty: __('Η διαδρομή δεν εμφανίζεται στην αρχική σελίδα.', D),
      });
    },
    save: () => null,
  });

  // --- Card -----------------------------------------------------------------------

  registerBlockType('uoa/card', {
    edit({ attributes, setAttributes }) {
      const [day, time] = (attributes.date || '').split('T');
      const setDate = (d, t) => setAttributes({ date: d ? d + (t ? 'T' + t : '') : '' });

      return el(
        Fragment,
        null,
        el(
          InspectorControls,
          null,
          el(
            PanelBody,
            { title: __('Περιεχόμενο', D) },
            el(TextControl, { label: __('Επικεφαλίδα κατηγορίας', D), help: __('Π.χ. «Νέα», «Εκδήλωση».', D), value: attributes.eyebrow, onChange: set(setAttributes, 'eyebrow') }),
            el(TextControl, { label: __('Τίτλος', D), value: attributes.title, onChange: set(setAttributes, 'title') }),
            el(TextControl, {
              label: __('Σύνδεσμος τίτλου (URL)', D),
              help: __('Με σύνδεσμο, όλη η κάρτα γίνεται επιλέξιμη.', D),
              type: 'url',
              value: attributes.url,
              onChange: set(setAttributes, 'url'),
            }),
            el(SelectControl, {
              label: __('Επίπεδο τίτλου', D),
              help: __('Ακολουθεί τη δομή της σελίδας· το ύφος δεν αλλάζει.', D),
              value: String(attributes.headingLevel),
              options: [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: 'H' + n })),
              onChange: (value) => setAttributes({ headingLevel: Number(value) }),
            }),
            el(TextareaControl, { label: __('Κείμενο', D), value: attributes.text, onChange: set(setAttributes, 'text') }),
            el(ToggleControl, {
              label: __('Οριζόντια διάταξη', D),
              help: __('Για πρόσωπα: η φωτογραφία δίπλα στο κείμενο.', D),
              checked: attributes.horizontal,
              onChange: set(setAttributes, 'horizontal'),
            }),
          ),
          el(
            PanelBody,
            { title: __('Εικόνα', D), initialOpen: false },
            el(
              MediaUploadCheck,
              null,
              el(MediaUpload, {
                allowedTypes: ['image'],
                value: attributes.mediaId,
                onSelect: (media) => setAttributes({ mediaId: media.id }),
                render: ({ open }) =>
                  el(Button, { variant: 'secondary', onClick: open }, attributes.mediaId ? __('Αλλαγή εικόνας', D) : __('Επιλογή εικόνας', D)),
              }),
            ),
            attributes.mediaId > 0 &&
              el(Button, { variant: 'link', isDestructive: true, onClick: () => setAttributes({ mediaId: 0, mediaAlt: '' }) }, __('Αφαίρεση εικόνας', D)),
            el(TextControl, {
              label: __('Εναλλακτικό κείμενο', D),
              help: __('Κενό: χρησιμοποιείται το εναλλακτικό κείμενο της βιβλιοθήκης πολυμέσων.', D),
              value: attributes.mediaAlt,
              onChange: set(setAttributes, 'mediaAlt'),
            }),
          ),
          el(
            PanelBody,
            { title: __('Πληροφορίες', D), initialOpen: false },
            el(TextControl, { label: __('Ημερομηνία', D), type: 'date', value: day || '', onChange: (d) => setDate(d, time) }),
            el(TextControl, { label: __('Ώρα (προαιρετική)', D), type: 'time', value: (time || '').slice(0, 5), onChange: (t) => setDate(day, t) }),
            el(TextareaControl, {
              label: __('Λοιπές πληροφορίες', D),
              help: __('Μία ανά γραμμή — τόπος, κωδικός μαθήματος, ιδιότητα.', D),
              value: attributes.meta.join('\n'),
              onChange: (value) => setAttributes({ meta: value.split('\n') }),
            }),
            el(TextControl, { label: __('Σήμα', D), value: attributes.badge, onChange: set(setAttributes, 'badge') }),
            attributes.badge &&
              el(SelectControl, {
                label: __('Παραλλαγή σήματος', D),
                value: attributes.badgeVariant,
                options: statusOptions(),
                onChange: set(setAttributes, 'badgeVariant'),
              }),
          ),
          el(
            PanelBody,
            { title: __('Υποσέλιδο', D), initialOpen: false },
            el(TextControl, { label: __('Κείμενο συνδέσμου', D), value: attributes.footerText, onChange: set(setAttributes, 'footerText') }),
            el(TextControl, { label: __('Διεύθυνση (URL)', D), type: 'url', value: attributes.footerUrl, onChange: set(setAttributes, 'footerUrl') }),
          ),
        ),
        el(Preview, { name: 'uoa/card', attributes, empty: __('Γράψτε τον τίτλο της κάρτας στις ρυθμίσεις.', D) }),
      );
    },
    save: () => null,
  });

  // --- Alert ----------------------------------------------------------------------

  const alertIcons = { info: 'info', success: 'check-circle', warning: 'warning', danger: 'error' };

  registerBlockType('uoa/alert', {
    edit({ attributes, setAttributes }) {
      const { variant, title, dismissible } = attributes;
      const blockProps = useBlockProps({ className: 'uoa-alert' + (variant === 'info' ? '' : ' uoa-alert--' + variant) });
      const content = useInnerBlocksProps(
        { className: 'uoa-alert__content' },
        { allowedBlocks: ['core/paragraph', 'core/list'], template: paragraph(__('Το μήνυμα…', D)) },
      );

      return el(
        Fragment,
        null,
        inspector(
          __('Ειδοποίηση', D),
          el(SelectControl, {
            label: __('Παραλλαγή', D),
            help: __('Ο τίτλος ή το κείμενο πρέπει να λέει τι είδους μήνυμα είναι.', D),
            value: variant,
            options: [
              { value: 'info', label: __('Πληροφορία', D) },
              { value: 'success', label: __('Επιτυχία', D) },
              { value: 'warning', label: __('Προειδοποίηση', D) },
              { value: 'danger', label: __('Σφάλμα', D) },
            ],
            onChange: set(setAttributes, 'variant'),
          }),
          el(ToggleControl, {
            label: __('Δυνατότητα απόρριψης', D),
            help: __('Ο επισκέπτης μπορεί να κλείσει το μήνυμα.', D),
            checked: dismissible,
            onChange: set(setAttributes, 'dismissible'),
          }),
        ),
        el(
          'div',
          blockProps,
          svg(alertIcons[variant] || 'info', 'uoa-alert__icon'),
          el(
            'div',
            Object.assign({}, content, { children: undefined }),
            el(RichText, {
              tagName: 'h2',
              className: 'uoa-alert__title',
              value: title,
              onChange: set(setAttributes, 'title'),
              placeholder: __('Τίτλος (προαιρετικός)', D),
              allowedFormats: [],
            }),
            content.children,
          ),
          dismissible && el('span', { className: 'uoa-alert__close' }, svg('close')),
        ),
      );
    },
    save: () => el(InnerBlocks.Content),
  });

  // --- Accordion ------------------------------------------------------------------

  registerBlockType('uoa/accordion', {
    edit({ attributes, setAttributes }) {
      const props = useInnerBlocksProps(useBlockProps({ className: 'uoa-accordion' }), {
        allowedBlocks: ['uoa/accordion-item'],
        template: [['uoa/accordion-item'], ['uoa/accordion-item']],
        renderAppender: InnerBlocks.ButtonBlockAppender,
      });
      return el(
        Fragment,
        null,
        inspector(
          __('Ακορντεόν', D),
          el(ToggleControl, {
            label: __('Μία ανοιχτή ενότητα τη φορά', D),
            help: __('Όταν ανοίγει μια ενότητα, οι άλλες κλείνουν.', D),
            checked: attributes.single,
            onChange: set(setAttributes, 'single'),
          }),
        ),
        el('div', props),
      );
    },
    save: () => el(InnerBlocks.Content),
  });

  registerBlockType('uoa/accordion-item', {
    edit({ attributes, setAttributes }) {
      // Always open while editing; the toggle sets how it starts on the site.
      const blockProps = useBlockProps({ className: 'uoa-accordion__item', open: true });
      const content = useInnerBlocksProps({ className: 'uoa-accordion__content' }, { template: paragraph(__('Το περιεχόμενο της ενότητας…', D)) });

      return el(
        Fragment,
        null,
        inspector(
          __('Ενότητα ακορντεόν', D),
          el(ToggleControl, {
            label: __('Ανοιχτή αρχικά', D),
            checked: attributes.open,
            onChange: set(setAttributes, 'open'),
          }),
        ),
        el(
          'details',
          blockProps,
          el(
            'summary',
            {
              className: 'uoa-accordion__trigger',
              // Typing in the title must not toggle the <details>.
              onClick: (event) => event.preventDefault(),
              onKeyUp: (event) => event.preventDefault(),
            },
            el(RichText, {
              tagName: 'span',
              className: 'uoa-accordion__title',
              value: attributes.title,
              onChange: set(setAttributes, 'title'),
              placeholder: __('Τίτλος ενότητας', D),
              allowedFormats: [],
            }),
            svg('expand-more', 'uoa-accordion__icon'),
          ),
          el('div', { className: 'uoa-accordion__panel' }, el('div', content)),
        ),
      );
    },
    save: () => el(InnerBlocks.Content),
  });

  // --- Tabs -----------------------------------------------------------------------

  registerBlockType('uoa/tabs', {
    edit({ attributes, setAttributes, clientId }) {
      const tabs = useSelect((select) => select('core/block-editor').getBlocks(clientId), [clientId]);
      const { updateBlockAttributes } = useDispatch('core/block-editor');
      const blockProps = useBlockProps({ className: 'uoa-tabs' });
      const panels = useInnerBlocksProps(
        {},
        {
          allowedBlocks: ['uoa/tab'],
          template: [['uoa/tab'], ['uoa/tab']],
          renderAppender: InnerBlocks.ButtonBlockAppender,
        },
      );

      return el(
        Fragment,
        null,
        inspector(
          __('Καρτέλες', D),
          el(TextControl, {
            label: __('Όνομα ομάδας καρτελών', D),
            help: __('Το ακούν οι αναγνώστες οθόνης, π.χ. «Σπουδές».', D),
            value: attributes.label,
            onChange: set(setAttributes, 'label'),
          }),
        ),
        el(
          'div',
          blockProps,
          // Tab names are edited here; every panel stays visible below, as without JS.
          el(
            'div',
            { className: 'uoa-tabs__list' },
            tabs.map((tab, i) =>
              el(RichText, {
                key: tab.clientId,
                tagName: 'span',
                className: 'uoa-tabs__tab',
                value: tab.attributes.title,
                onChange: (title) => updateBlockAttributes(tab.clientId, { title }),
                /* translators: %d: the tab's position. */
                placeholder: sprintf(__('Καρτέλα %d', D), i + 1),
                allowedFormats: [],
              }),
            ),
          ),
          el('div', panels),
        ),
      );
    },
    save: () => el(InnerBlocks.Content),
  });

  registerBlockType('uoa/tab', {
    edit() {
      return el(
        'section',
        useInnerBlocksProps(useBlockProps({ className: 'uoa-tabs__panel' }), {
          template: paragraph(__('Το περιεχόμενο της καρτέλας…', D)),
        }),
      );
    },
    save: () => el(InnerBlocks.Content),
  });
})(window.wp);
