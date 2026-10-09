<?php
/**
 * Button — packages/core/src/components/button/button.html.
 *
 * With a URL it's a link styled as a button (navigation); without one, a <button>.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Button;

use function UOA\Blocks\icon;

defined( 'ABSPATH' ) || exit;

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 */
function render( array $attributes ): string {
	$text     = (string) ( $attributes['text'] ?? '' );
	$url      = (string) ( $attributes['url'] ?? '' );
	$variant  = (string) ( $attributes['variant'] ?? 'primary' );
	$label    = (string) ( $attributes['label'] ?? '' );
	$disabled = ! empty( $attributes['disabled'] );
	$svg      = icon( (string) ( $attributes['icon'] ?? '' ), 'uoa-button__icon' );

	// An icon-only button is named by its label; with neither text nor icon there's nothing to show.
	if ( '' === $text && ( '' === $svg || '' === $label ) ) {
		return '';
	}

	$class = 'uoa-button';
	if ( 'primary' !== $variant ) {
		$class .= ' uoa-button--' . $variant;
	}
	if ( 'sm' === ( $attributes['size'] ?? 'default' ) ) {
		$class .= ' uoa-button--sm';
	}
	if ( ! empty( $attributes['fullWidth'] ) ) {
		$class .= ' uoa-button--block';
	}

	$attrs = ' class="' . esc_attr( $class ) . '"';

	if ( '' !== $url ) {
		// A disabled link has no href: it can't be followed or focused.
		$tag    = 'a';
		$attrs .= $disabled ? ' aria-disabled="true"' : ' href="' . esc_url( $url ) . '"';
	} else {
		$tag    = 'button';
		$attrs .= ' type="button"';
	}

	if ( '' === $text ) {
		$attrs .= ' aria-label="' . esc_attr( $label ) . '"';
	}
	if ( $disabled && 'button' === $tag ) {
		$attrs .= ' disabled';
	}

	$inner = '' !== $svg && '' !== $text ? $svg . "\n" . esc_html( $text ) : ( '' !== $text ? esc_html( $text ) : $svg );

	return sprintf( '<%1$s%2$s>%3$s</%1$s>', $tag, $attrs, $inner );
}
