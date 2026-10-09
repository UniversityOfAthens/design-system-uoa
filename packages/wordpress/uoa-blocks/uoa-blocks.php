<?php
/**
 * Plugin Name:       UOA Blocks
 * Plugin URI:        https://github.com/UniversityOfAthens/design-system-uoa
 * Description:       The NKUA design system's components as blocks.
 * Requires at least: 6.6
 * Requires PHP:      8.1
 * Version:           1.0.0
 * Author:            National and Kapodistrian University of Athens
 * Author URI:		  https://www.uoa.gr/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       uoa-blocks
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks;

defined( 'ABSPATH' ) || exit;

const VERSION = '1.0.0';

require_once __DIR__ . '/inc/icons.php';

/**
 * Cache-bust on the built CSS, so a core update reaches installed sites without a
 * version bump.
 */
function asset_version(): string {
	$file = __DIR__ . '/assets/uoa/uoa-components.css';

	return is_readable( $file ) ? (string) filemtime( $file ) : VERSION;
}

/**
 * The editor script (one file for every block, no build step) and @uoa/core's
 * behaviour modules. Registered before the blocks, because block.json refers to
 * them by handle.
 */
function register_scripts(): void {
	$base = plugin_dir_url( __FILE__ );

	wp_register_script(
		'uoa-blocks-editor',
		$base . 'editor/blocks.js',
		array( 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-data', 'wp-element', 'wp-i18n', 'wp-server-side-render' ),
		(string) filemtime( __DIR__ . '/editor/blocks.js' ),
		true
	);
	wp_set_script_translations( 'uoa-blocks-editor', 'uoa-blocks', __DIR__ . '/languages' );

	// The icon set, for the icon pickers and for drawing icons in the editor canvas.
	wp_add_inline_script(
		'uoa-blocks-editor',
		'window.uoaBlocks = ' . wp_json_encode( array( 'icons' => icon_bodies() ) ) . ';',
		'before'
	);

	// Unbundled ES modules that auto-init on load. block.json's viewScriptModule
	// loads each one only on pages that contain its block.
	foreach ( array( 'accordion', 'alert', 'tabs' ) as $name ) {
		wp_register_script_module(
			'@uoa/core/' . $name,
			$base . 'assets/uoa/components/' . $name . '/' . $name . '.js',
			array(),
			asset_version()
		);
	}
}
add_action( 'init', __NAMESPACE__ . '\\register_scripts', 5 );

/**
 * Register every block in blocks/<name>/. Adding a component means adding a
 * directory: block.json plus render.php defining UOA\Blocks\<Name>\render().
 *
 * The render callback is passed here rather than as block.json's "render" file,
 * because WordPress requires that file on every render — it must print, and could
 * not be called from the contract test.
 */
function register_blocks(): void {
	foreach ( (array) glob( __DIR__ . '/blocks/*', GLOB_ONLYDIR ) as $dir ) {
		if ( ! is_readable( $dir . '/block.json' ) ) {
			continue;
		}

		$args = array();

		if ( is_readable( $dir . '/render.php' ) ) {
			require_once $dir . '/render.php';

			$callback = __NAMESPACE__ . '\\' . str_replace( '-', '', ucwords( basename( $dir ), '-' ) ) . '\\render';
			if ( function_exists( $callback ) ) {
				$args['render_callback'] = $callback;
			}
		}

		register_block_type( $dir, $args );
	}
}
add_action( 'init', __NAMESPACE__ . '\\register_blocks' );

/**
 * One inserter category for every design-system block.
 *
 * @param array<int, array<string, mixed>> $categories Registered categories.
 * @return array<int, array<string, mixed>>
 */
function block_category( array $categories ): array {
	array_unshift(
		$categories,
		array(
			'slug'  => 'uoa',
			'title' => __( 'Σύστημα σχεδίασης ΕΚΠΑ', 'uoa-blocks' ),
			'icon'  => null,
		)
	);

	return $categories;
}
add_filter( 'block_categories_all', __NAMESPACE__ . '\\block_category' );

/**
 * Load the component styles on the front end and inside the block editor canvas.
 *
 * Only uoa-components.css: every rule in it is scoped to a .uoa-* class, so it can't
 * restyle the host theme. The page-level half (reset, typography, layout) belongs to
 * the UOA theme. The fonts are shared with the theme under one handle, so a site
 * running both downloads them once.
 */
function enqueue_assets(): void {
	$base    = plugin_dir_url( __FILE__ ) . 'assets/uoa/';
	$version = asset_version();

	if ( ! wp_style_is( 'uoa-fonts', 'registered' ) ) {
		wp_register_style( 'uoa-fonts', $base . 'fonts/fonts.css', array(), $version );
	}

	wp_enqueue_style( 'uoa-components', $base . 'uoa-components.css', array( 'uoa-fonts' ), $version );
}
add_action( 'enqueue_block_assets', __NAMESPACE__ . '\\enqueue_assets', 20 );

/**
 * Feed the design tokens to the editor (palette, font sizes, spacing) when the
 * active theme isn't the UOA theme, which ships the same generated theme.json.
 *
 * A plugin can't ship a theme.json file; this filter merges the same data into the
 * active theme's settings.
 *
 * @param \WP_Theme_JSON_Data $theme_json The active theme's theme.json data.
 * @return \WP_Theme_JSON_Data
 */
function filter_theme_json( \WP_Theme_JSON_Data $theme_json ): \WP_Theme_JSON_Data {
	$file = __DIR__ . '/assets/uoa/theme.json';

	if ( 'uoa' === get_template() || ! is_readable( $file ) ) {
		return $theme_json;
	}

	$data = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- a file inside the plugin.

	if ( ! is_array( $data ) ) {
		return $theme_json;
	}

	return $theme_json->update_with( $data );
}
add_filter( 'wp_theme_json_data_theme', __NAMESPACE__ . '\\filter_theme_json' );
