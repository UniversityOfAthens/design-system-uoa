<?php
/**
 * Recommend the UOA Blocks plugin, which provides the design system's components.
 *
 * A theme can't require a plugin, and mustn't register blocks itself; without the
 * plugin the theme still works, with core blocks only. The notice shows on the
 * Dashboard, Themes and Plugins screens and is dismissible per user.
 *
 * @package uoa
 */

declare( strict_types = 1 );

namespace UOA\Theme;

defined( 'ABSPATH' ) || exit;

const DISMISSED = 'uoa_blocks_notice_dismissed';

/**
 * Show the notice to users who can install plugins, until they dismiss it.
 */
function recommended_plugin_notice(): void {
	if ( defined( 'UOA\\Blocks\\VERSION' ) || ! current_user_can( 'install_plugins' ) || get_user_meta( get_current_user_id(), DISMISSED, true ) ) {
		return;
	}

	$screen = get_current_screen();
	if ( ! $screen || ! in_array( $screen->id, array( 'dashboard', 'themes', 'plugins' ), true ) ) {
		return;
	}

	$dismiss = wp_nonce_url( add_query_arg( 'uoa-dismiss-notice', '1' ), 'uoa-dismiss-notice' );

	printf(
		'<div class="notice notice-info"><p>%s</p><p><a href="%s">%s</a></p></div>',
		esc_html__( 'Το θέμα UOA είναι σχεδιασμένο για το πρόσθετο UOA Blocks, που προσθέτει τα στοιχεία του συστήματος σχεδίασης (ειδοποιήσεις, καρτέλες, κάρτες κ.ά.) ως μπλοκ.', 'uoa' ),
		esc_url( $dismiss ),
		esc_html__( 'Απόκρυψη μηνύματος', 'uoa' )
	);
}
add_action( 'admin_notices', __NAMESPACE__ . '\\recommended_plugin_notice' );

/**
 * Remember the dismissal.
 */
function dismiss_recommended_plugin_notice(): void {
	if ( ! isset( $_GET['uoa-dismiss-notice'] ) || ! check_admin_referer( 'uoa-dismiss-notice' ) ) {
		return;
	}

	update_user_meta( get_current_user_id(), DISMISSED, 1 );
	wp_safe_redirect( remove_query_arg( array( 'uoa-dismiss-notice', '_wpnonce' ) ) );
	exit;
}
add_action( 'admin_init', __NAMESPACE__ . '\\dismiss_recommended_plugin_notice' );
