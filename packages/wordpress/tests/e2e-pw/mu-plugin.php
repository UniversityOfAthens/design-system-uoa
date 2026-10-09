<?php
/**
 * E2E helper, loaded only in wp-env (.wp-env.json maps it into mu-plugins).
 *
 * ?uoa-theme=<stylesheet> renders one request with another installed theme, so the
 * specs can prove the plugin's blocks work without the UOA theme, in parallel and
 * without switching the site's theme.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only, test-only switch.
$uoa_e2e_theme = isset( $_GET['uoa-theme'] ) ? sanitize_key( wp_unslash( $_GET['uoa-theme'] ) ) : '';

if ( '' !== $uoa_e2e_theme && wp_get_theme( $uoa_e2e_theme )->exists() ) {
	add_filter( 'stylesheet', static fn () => $uoa_e2e_theme );
	add_filter( 'template', static fn () => $uoa_e2e_theme );
}
