<?php
/**
 * Accordion item — one <details> of packages/core/src/components/accordion/accordion.html.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\AccordionItem;

use function UOA\Blocks\icon;

defined( 'ABSPATH' ) || exit;

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param string               $content    Rendered inner blocks: the panel content.
 */
function render( array $attributes, string $content = '' ): string {
	$title = (string) ( $attributes['title'] ?? '' );

	if ( '' === $title ) {
		return '';
	}

	return sprintf(
		'<details class="uoa-accordion__item"%s><summary class="uoa-accordion__trigger"><span class="uoa-accordion__title">%s</span>%s</summary><div class="uoa-accordion__panel"><div class="uoa-accordion__content">%s</div></div></details>',
		empty( $attributes['open'] ) ? '' : ' open',
		esc_html( $title ),
		icon( 'expand-more', 'uoa-accordion__icon' ),
		trim( $content )
	);
}
