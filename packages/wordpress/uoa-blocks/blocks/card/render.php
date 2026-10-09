<?php
/**
 * Card — packages/core/src/components/card/card.html.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Card;

defined( 'ABSPATH' ) || exit;

// The meta row reuses the Badge block's markup.
require_once dirname( __DIR__ ) . '/badge/render.php';

/**
 * The core markup.
 *
 * Keys of $card, all optional except the title: media {src, alt, width, height},
 * eyebrow, title, url, level (heading 2–6), date {datetime, text}, meta (strings),
 * badge {text, variant}, text, footer {text, url}, horizontal.
 *
 * @param array<string, mixed> $card The card's parts.
 */
function markup( array $card ): string {
	$title = (string) ( $card['title'] ?? '' );

	if ( '' === $title ) {
		return '';
	}

	$level = (int) ( $card['level'] ?? 3 );
	$level = $level >= 2 && $level <= 6 ? $level : 3;
	$url   = (string) ( $card['url'] ?? '' );
	$html  = sprintf( '<article class="uoa-card%s">', empty( $card['horizontal'] ) ? '' : ' uoa-card--horizontal' );

	if ( ! empty( $card['media'] ) ) {
		$media = $card['media'];
		$html .= sprintf(
			'<p class="uoa-card__media"><img src="%s" alt="%s"%s></p>',
			esc_url( $media['src'] ),
			esc_attr( $media['alt'] ),
			$media['width'] > 0 && $media['height'] > 0 ? sprintf( ' width="%d" height="%d"', $media['width'], $media['height'] ) : ''
		);
	}

	$html .= '<div class="uoa-card__body">';

	if ( '' !== (string) ( $card['eyebrow'] ?? '' ) ) {
		$html .= '<p class="uoa-card__eyebrow">' . esc_html( $card['eyebrow'] ) . '</p>';
	}

	$html .= sprintf(
		'<h%1$d class="uoa-card__title">%2$s</h%1$d>',
		$level,
		'' !== $url ? sprintf( '<a href="%s">%s</a>', esc_url( $url ), esc_html( $title ) ) : esc_html( $title )
	);

	$meta = '';
	if ( ! empty( $card['date'] ) ) {
		$meta .= sprintf( '<time datetime="%s">%s</time>', esc_attr( $card['date']['datetime'] ), esc_html( $card['date']['text'] ) );
	}
	foreach ( $card['meta'] ?? array() as $item ) {
		if ( '' !== trim( (string) $item ) ) {
			$meta .= '<span>' . esc_html( trim( (string) $item ) ) . '</span>';
		}
	}
	if ( ! empty( $card['badge'] ) ) {
		$meta .= \UOA\Blocks\Badge\markup( $card['badge']['text'], $card['badge']['variant'] );
	}
	if ( '' !== $meta ) {
		$html .= '<p class="uoa-card__meta">' . $meta . '</p>';
	}

	if ( '' !== (string) ( $card['text'] ?? '' ) ) {
		$html .= '<p class="uoa-card__text">' . esc_html( $card['text'] ) . '</p>';
	}

	if ( ! empty( $card['footer'] ) ) {
		$html .= sprintf(
			'<p class="uoa-card__footer"><a href="%s">%s</a></p>',
			esc_url( $card['footer']['url'] ),
			esc_html( $card['footer']['text'] )
		);
	}

	return $html . '</div></article>';
}

/**
 * The image from the media library, at a size that suits a card.
 *
 * @param int    $id  Attachment ID.
 * @param string $alt Alternative text; empty uses the media library's.
 * @return ?array{src: string, alt: string, width: int, height: int}
 */
function media( int $id, string $alt ): ?array {
	$image = $id > 0 ? wp_get_attachment_image_src( $id, 'large' ) : false;

	if ( ! $image ) {
		return null;
	}

	return array(
		'src'    => (string) $image[0],
		'alt'    => '' !== $alt ? $alt : (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
		'width'  => (int) $image[1],
		'height' => (int) $image[2],
	);
}

/**
 * <time> parts for a stored local date ("2026-02-09" or "2026-03-13T19:00:00"):
 * the machine-readable value and the site's own date (and time) format.
 *
 * @param string $value The stored date.
 * @return ?array{datetime: string, text: string}
 */
function date_parts( string $value ): ?array {
	$date = '' !== $value ? date_create_immutable( $value, wp_timezone() ) : false;

	if ( ! $date ) {
		return null;
	}

	$has_time = '00:00' !== $date->format( 'H:i' );
	$format   = (string) get_option( 'date_format' ) . ( $has_time ? ', ' . (string) get_option( 'time_format' ) : '' );

	return array(
		'datetime' => $date->format( $has_time ? 'Y-m-d\TH:i' : 'Y-m-d' ),
		'text'     => (string) wp_date( $format, $date->getTimestamp() ),
	);
}

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes.
 */
function render( array $attributes ): string {
	$badge       = (string) ( $attributes['badge'] ?? '' );
	$footer_text = (string) ( $attributes['footerText'] ?? '' );
	$footer_url  = (string) ( $attributes['footerUrl'] ?? '' );

	return markup(
		array(
			'media'      => media( (int) ( $attributes['mediaId'] ?? 0 ), (string) ( $attributes['mediaAlt'] ?? '' ) ),
			'eyebrow'    => (string) ( $attributes['eyebrow'] ?? '' ),
			'title'      => (string) ( $attributes['title'] ?? '' ),
			'url'        => (string) ( $attributes['url'] ?? '' ),
			'level'      => (int) ( $attributes['headingLevel'] ?? 3 ),
			'date'       => date_parts( (string) ( $attributes['date'] ?? '' ) ),
			'meta'       => array_map( 'strval', (array) ( $attributes['meta'] ?? array() ) ),
			'badge'      => '' !== $badge ? array(
				'text'    => $badge,
				'variant' => (string) ( $attributes['badgeVariant'] ?? 'neutral' ),
			) : null,
			'text'       => (string) ( $attributes['text'] ?? '' ),
			'footer'     => '' !== $footer_text && '' !== $footer_url ? array(
				'text' => $footer_text,
				'url'  => $footer_url,
			) : null,
			'horizontal' => ! empty( $attributes['horizontal'] ),
		)
	);
}
