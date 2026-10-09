<?php
/**
 * Inline SVG icons from @uoa/icons (Material Symbols).
 *
 * The set is assets/uoa/icons.json, copied from @uoa/icons/dist at build time. Every
 * icon is decorative — the accessible name always sits on the control around it.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Arrows and chevrons that point along the reading direction; they get
 * .uoa-icon--directional so they flip in right-to-left text.
 */
const DIRECTIONAL_ICONS = array( 'arrow-back', 'arrow-forward', 'chevron-left', 'chevron-right', 'first-page', 'last-page' );

/**
 * Icon name → SVG body (the shapes inside <svg>).
 *
 * @return array<string, string>
 */
function icon_bodies(): array {
	static $bodies = null;

	if ( null === $bodies ) {
		$file   = defined( 'UOA_BLOCKS_ICONS' ) ? UOA_BLOCKS_ICONS : dirname( __DIR__ ) . '/assets/uoa/icons.json';
		$icons  = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- a file inside the plugin.
		$bodies = array();

		foreach ( is_array( $icons ) ? $icons : array() as $name => $icon ) {
			$bodies[ (string) $name ] = (string) ( $icon['body'] ?? '' );
		}
	}

	return $bodies;
}

/**
 * One icon as the core's inline <svg>, or '' for an unknown name.
 *
 * @param string $name  Icon name, as in @uoa/icons (e.g. "chevron-right").
 * @param string $class_name Class attribute; empty for none (the alert's close button).
 */
function icon( string $name, string $class_name = '' ): string {
	$body = icon_bodies()[ $name ] ?? '';

	if ( '' === $body ) {
		return '';
	}

	return sprintf(
		'<svg%s aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor">%s</svg>',
		'' !== $class_name ? ' class="' . esc_attr( $class_name ) . '"' : '',
		$body // Trusted: generated from the icon set at build time.
	);
}
