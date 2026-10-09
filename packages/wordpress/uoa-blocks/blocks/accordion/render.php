<?php
/**
 * Accordion — packages/core/src/components/accordion/accordion.html.
 *
 * The items are uoa/accordion-item inner blocks. Single-open needs @uoa/core's
 * accordion module (block.json viewScriptModule); without it every item still opens.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Accordion;

defined( 'ABSPATH' ) || exit;

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param string               $content    Rendered inner blocks: the <details> items.
 */
function render( array $attributes, string $content = '' ): string {
	if ( '' === trim( $content ) ) {
		return '';
	}

	return sprintf(
		'<div class="uoa-accordion" data-uoa-accordion%s>%s</div>',
		empty( $attributes['single'] ) ? '' : '="single"',
		trim( $content )
	);
}
