<?php
/**
 * Loads the plugin's render callbacks without WordPress.
 *
 * The callbacks only need WordPress's escaping and translation functions, so those are
 * stubbed here with the same output WordPress gives for plain text. Anything that
 * queries the database (the breadcrumb trail, card images and dates) stays out of
 * the tests; its pure markup() half is tested instead.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

define( 'ABSPATH', __DIR__ . '/' );

// The icon set straight from @uoa/icons (the plugin's copy is a build output).
define( 'UOA_BLOCKS_ICONS', dirname( __DIR__, 3 ) . '/icons/dist/icons.json' );

if ( ! is_readable( UOA_BLOCKS_ICONS ) ) {
	fwrite( STDERR, "Build @uoa/icons first: cd packages/icons && bun run build\n" );
	exit( 1 );
}

// Greek is the source language: translation returns the string as written.
function __( string $text, string $domain = 'default' ): string {
	return $text;
}

// WordPress's esc_* functions don't double-encode existing entities.
function esc_html( string $text ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8', false );
}

function esc_attr( string $text ): string {
	return esc_html( $text );
}

function esc_html__( string $text, string $domain = 'default' ): string {
	return esc_html( __( $text, $domain ) );
}

function esc_attr__( string $text, string $domain = 'default' ): string {
	return esc_attr( __( $text, $domain ) );
}

function esc_url( string $url ): string {
	return str_replace( '&', '&#038;', $url );
}

require_once dirname( __DIR__, 2 ) . '/uoa-blocks/inc/icons.php';

foreach ( glob( dirname( __DIR__, 2 ) . '/uoa-blocks/blocks/*/render.php' ) as $file ) {
	require_once $file;
}
