<?php
/**
 * Icon — packages/core/src/components/icon/icon.html. Always decorative.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Icon;

use function UOA\Blocks\icon;

use const UOA\Blocks\DIRECTIONAL_ICONS;

defined( 'ABSPATH' ) || exit;

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 */
function render( array $attributes ): string {
	$name = (string) ( $attributes['name'] ?? '' );
	$size = (string) ( $attributes['size'] ?? 'default' );

	$class = 'uoa-icon';
	if ( 'default' !== $size ) {
		$class .= ' uoa-icon--' . $size;
	}
	if ( in_array( $name, DIRECTIONAL_ICONS, true ) ) {
		$class .= ' uoa-icon--directional';
	}

	return icon( $name, $class );
}
