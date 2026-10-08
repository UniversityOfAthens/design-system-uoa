<?php
/**
 * Plugin Name:       UOA Design System blocks
 * Description:       Renders the NKUA design system's components as blocks. The markup comes from @uoa/core; this plugin adds no styles and no behaviour of its own (ADR 0003).
 * Requires at least: 6.6
 * Requires PHP:      8.1
 * Version:           0.0.0
 * Author:            National and Kapodistrian University of Athens
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       uoa-ds
 *
 * @package uoa-ds
 */

declare( strict_types = 1 );

namespace UOA\DS;

/**
 * Register every block in blocks/<name>/block.json. Adding a component to the adapter
 * means adding a directory here — nothing else to wire up.
 */
function register_blocks(): void {
	$blocks_dir = plugin_dir_path( __FILE__ ) . 'blocks/';

	foreach ( (array) glob( $blocks_dir . '*', GLOB_ONLYDIR ) as $dir ) {
		if ( is_readable( $dir . 'block.json' ) ) {
			register_block_type( $dir );
		}
	}
}
add_action( 'init', __NAMESPACE__ . '\\register_blocks' );

/**
 * Load @uoa/core on the front end *and* inside the block editor canvas.
 *
 * enqueue_block_assets fires in both contexts, which is what makes a block look the
 * same while editing and after saving. No wrapper markup or editor-only CSS is added:
 * the same file styles the site.
 */
function enqueue_core_assets(): void {
	$base = plugin_dir_url( __FILE__ ) . 'assets/uoa/';
	$path = plugin_dir_path( __FILE__ ) . 'assets/uoa/';

	// Cache-bust on the built file, so a core update reaches installed sites.
	$version = is_readable( $path . 'uoa.css' ) ? (string) filemtime( $path . 'uoa.css' ) : '0.0.0';

	wp_enqueue_style( 'uoa-core-fonts', $base . 'fonts/fonts.css', array(), $version );
	wp_enqueue_style( 'uoa-core', $base . 'uoa.css', array( 'uoa-core-fonts' ), $version );
}
add_action( 'enqueue_block_assets', __NAMESPACE__ . '\\enqueue_core_assets' );