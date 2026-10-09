<?php
/**
 * UOA theme setup.
 *
 * The theme owns the page-level half of @uoa/core (reset, typography, layout,
 * utilities) and the fonts. Component styles come with the blocks, from the UOA
 * Blocks plugin, so they work on any theme (ADR 0003).
 *
 * @package uoa
 */

declare( strict_types = 1 );

namespace UOA\Theme;

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/inc/recommended-plugin.php';

/**
 * Cache-bust on the built CSS, so a core update reaches installed sites.
 */
function asset_version(): string {
	$file = get_theme_file_path( 'assets/uoa/uoa-base.css' );

	return is_readable( $file ) ? (string) filemtime( $file ) : (string) wp_get_theme()->get( 'Version' );
}

/**
 * Same base styles in the editor canvas as on the site.
 */
function setup(): void {
	add_theme_support( 'editor-styles' );
	add_editor_style( array( 'assets/uoa/fonts/fonts.css', 'assets/uoa/uoa-base.css' ) );
}
add_action( 'after_setup_theme', __NAMESPACE__ . '\\setup' );

/**
 * Base styles and fonts on the front end. The fonts handle is shared with the plugin,
 * which registers it only when the theme hasn't, so they download once.
 */
function enqueue_assets(): void {
	$version = asset_version();

	wp_register_style( 'uoa-fonts', get_theme_file_uri( 'assets/uoa/fonts/fonts.css' ), array(), $version );
	wp_enqueue_style( 'uoa-base', get_theme_file_uri( 'assets/uoa/uoa-base.css' ), array( 'uoa-fonts' ), $version );
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_assets' );
