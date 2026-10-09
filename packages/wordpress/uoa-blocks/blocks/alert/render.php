<?php
/**
 * Alert — packages/core/src/components/alert/alert.html.
 *
 * No role: an alert placed in content is there when the page loads, and the core only
 * adds role="status"/"alert" to messages inserted later.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Alert;

use function UOA\Blocks\icon;

defined( 'ABSPATH' ) || exit;

/** Variant → its icon in @uoa/icons. */
const ICONS = array(
	'info'    => 'info',
	'success' => 'check-circle',
	'warning' => 'warning',
	'danger'  => 'error',
);

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param string               $content    Rendered inner blocks: the message.
 */
function render( array $attributes, string $content = '' ): string {
	$variant     = (string) ( $attributes['variant'] ?? 'info' );
	$title       = (string) ( $attributes['title'] ?? '' );
	$dismissible = ! empty( $attributes['dismissible'] );
	$variant     = isset( ICONS[ $variant ] ) ? $variant : 'info';

	if ( '' === trim( $content ) && '' === $title ) {
		return '';
	}

	$html  = sprintf(
		'<div class="uoa-alert%s"%s>',
		'info' === $variant ? '' : ' uoa-alert--' . $variant,
		$dismissible ? ' data-uoa-alert-dismissible' : ''
	);
	$html .= icon( ICONS[ $variant ], 'uoa-alert__icon' );
	$html .= '<div class="uoa-alert__content">';
	if ( '' !== $title ) {
		$html .= '<h2 class="uoa-alert__title">' . esc_html( $title ) . '</h2>';
	}
	$html .= trim( $content ) . '</div>';

	if ( $dismissible ) {
		$html .= sprintf(
			'<button class="uoa-alert__close" type="button" data-uoa-alert-close aria-label="%s">%s</button>',
			esc_attr__( 'Απόρριψη ειδοποίησης', 'uoa-blocks' ),
			icon( 'close' )
		);
	}

	return $html . '</div>';
}
