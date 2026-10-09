<?php
/**
 * Tabs — packages/core/src/components/tabs/tabs.html.
 *
 * Without @uoa/core's tabs module (block.json viewScriptModule) every panel stays
 * visible; the module adds roles, selection and keyboard support.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Tabs;

defined( 'ABSPATH' ) || exit;

/**
 * The core markup.
 *
 * @param string                                                     $label Accessible name of the tab list.
 * @param array<int, array{id: string, title: string, html: string}> $tabs  Each tab: an ID suffix unique on the page, its name, its panel HTML.
 */
function markup( string $label, array $tabs ): string {
	if ( array() === $tabs ) {
		return '';
	}

	$buttons = '';
	$panels  = '';

	foreach ( $tabs as $tab ) {
		$tab_id   = 'uoa-tab-' . $tab['id'];
		$panel_id = 'uoa-panel-' . $tab['id'];

		$buttons .= sprintf(
			'<button type="button" class="uoa-tabs__tab" id="%s" aria-controls="%s">%s</button>',
			esc_attr( $tab_id ),
			esc_attr( $panel_id ),
			esc_html( $tab['title'] )
		);
		$panels  .= sprintf(
			'<section class="uoa-tabs__panel" id="%s" aria-labelledby="%s" tabindex="0">%s</section>',
			esc_attr( $panel_id ),
			esc_attr( $tab_id ),
			$tab['html']
		);
	}

	return sprintf(
		'<div class="uoa-tabs" data-uoa-tabs><div class="uoa-tabs__list" aria-label="%s">%s</div>%s</div>',
		esc_attr( $label ),
		$buttons,
		$panels
	);
}

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param string               $content    Rendered inner blocks (unused: each tab is rendered on its own).
 * @param \WP_Block|null       $block      This block, for its uoa/tab children.
 */
function render( array $attributes, string $content = '', ?\WP_Block $block = null ): string {
	if ( null === $block ) {
		return '';
	}

	// Unique per request, so two tab groups on one page never share IDs.
	$group = wp_unique_id( 'g' );
	$tabs  = array();

	foreach ( $block->inner_blocks as $index => $inner ) {
		$title = (string) ( $inner->attributes['title'] ?? '' );

		if ( 'uoa/tab' !== $inner->name || '' === $title ) {
			continue;
		}

		$tabs[] = array(
			'id'    => $group . '-' . ( (int) $index + 1 ),
			'title' => $title,
			'html'  => $inner->render(),
		);
	}

	$label = (string) ( $attributes['label'] ?? '' );

	return markup( '' !== $label ? $label : __( 'Καρτέλες', 'uoa-blocks' ), $tabs );
}
