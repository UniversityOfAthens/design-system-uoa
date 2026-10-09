<?php
/**
 * Badge — packages/core/src/components/badge/badge.html.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Badge;

defined( 'ABSPATH' ) || exit;

/**
 * The core markup. Also used by the Card block for the badge in its meta row.
 *
 * @param string $text    Visible text; the words carry the meaning, never the colour.
 * @param string $variant neutral (default) | info | success | warning | danger.
 */
function markup( string $text, string $variant = 'neutral' ): string {
	if ( '' === $text ) {
		return '';
	}

	return sprintf(
		'<span class="uoa-badge%s">%s</span>',
		'neutral' === $variant ? '' : ' uoa-badge--' . esc_attr( $variant ),
		esc_html( $text )
	);
}

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 */
function render( array $attributes ): string {
	return markup( (string) ( $attributes['text'] ?? '' ), (string) ( $attributes['variant'] ?? 'neutral' ) );
}
