<?php
/**
 * Tab — the content of one panel. The parent uoa/tabs block outputs the buttons, the
 * <section> and the ID pairs, because they need every tab at once.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Tab;

defined( 'ABSPATH' ) || exit;

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param string               $content    Rendered inner blocks: the panel content.
 */
function render( array $attributes, string $content = '' ): string {
	return trim( $content );
}
