<?php
/**
 * Badge block render callback.
 *
 * The output must stay identical to packages/core/src/components/badge/badge.html —
 * tests/markup.php diffs every line of it against that file. Change the core markup
 * first (for every platform), then this.
 *
 * @package uoa-ds
 */

declare( strict_types = 1 );

namespace UOA\DS\Blocks\Badge;

defined( 'ABSPATH' ) || exit;

/**
 * Render the badge.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param string                $content    Inner content (none: the badge is a single span).
 * @param \WP_Block|null        $block      Block instance.
 * @return string Rendered markup, matching the core reference markup.
 */
function render( array $attributes, string $content = '', ?object $block = null ): string {
	$text    = (string) ( $attributes['text'] ?? '' );
	$variant = (string) ( $attributes['variant'] ?? 'neutral' );

	$classes = 'uoa-badge';
	if ( 'neutral' !== $variant ) {
		$classes .= ' uoa-badge--' . $variant;
	}

	if ( '' === $text ) {
		return '';
	}

	return sprintf(
		'<span class="%s">%s</span>',
		esc_attr( $classes ),
		esc_html__( $text, 'uoa-ds' )
	);
}