<?php
/**
 * Breadcrumb — packages/core/src/components/breadcrumb/breadcrumb.html.
 *
 * The trail is built from the site's own hierarchy: home → (posts page) → ancestors →
 * current. On the front page there's nothing to go back to, so it renders nothing.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

namespace UOA\Blocks\Breadcrumb;

use function UOA\Blocks\icon;

defined( 'ABSPATH' ) || exit;

/**
 * The core markup.
 *
 * @param string                                         $label  Accessible name of the <nav>.
 * @param array<int, array{label: string, url: ?string}> $crumbs Root first; the last one is the current page.
 */
function markup( string $label, array $crumbs ): string {
	if ( array() === $crumbs ) {
		return '';
	}

	$last  = count( $crumbs ) - 1;
	$items = '';

	foreach ( array_values( $crumbs ) as $i => $crumb ) {
		$items .= $i === $last
			? sprintf( '<li class="uoa-breadcrumb__item"><span class="uoa-breadcrumb__current" aria-current="page">%s</span></li>', esc_html( $crumb['label'] ) )
			: sprintf(
				'<li class="uoa-breadcrumb__item"><a class="uoa-breadcrumb__link" href="%s">%s</a>%s</li>',
				esc_url( (string) $crumb['url'] ),
				esc_html( $crumb['label'] ),
				icon( 'chevron-right', 'uoa-breadcrumb__separator' )
			);
	}

	return sprintf(
		'<nav class="uoa-breadcrumb" aria-label="%s"><ol class="uoa-breadcrumb__list">%s</ol></nav>',
		esc_attr( $label ),
		$items
	);
}

/**
 * The trail for a post: home → posts page (for blog posts) → ancestors → the post.
 *
 * @param int $post_id The post.
 * @return array<int, array{label: string, url: ?string}>
 */
function post_trail( int $post_id ): array {
	$crumbs = array();

	$posts_page = (int) get_option( 'page_for_posts' );
	if ( 'post' === get_post_type( $post_id ) && $posts_page > 0 ) {
		$crumbs[] = array(
			'label' => get_the_title( $posts_page ),
			'url'   => (string) get_permalink( $posts_page ),
		);
	}

	foreach ( array_reverse( get_post_ancestors( $post_id ) ) as $ancestor ) {
		$crumbs[] = array(
			'label' => get_the_title( $ancestor ),
			'url'   => (string) get_permalink( $ancestor ),
		);
	}

	$crumbs[] = array(
		'label' => get_the_title( $post_id ),
		'url'   => null,
	);

	return $crumbs;
}

/**
 * The trail for the current request, root first.
 *
 * @param int $post_id The post the block belongs to (block context), or 0 outside one.
 * @return array<int, array{label: string, url: ?string}>
 */
function trail( int $post_id ): array {
	if ( is_front_page() || ( $post_id > 0 && (int) get_option( 'page_on_front' ) === $post_id ) ) {
		return array();
	}

	$home = array(
		'label' => __( 'Αρχική', 'uoa-blocks' ),
		'url'   => home_url( '/' ),
	);

	if ( $post_id > 0 ) {
		$rest = post_trail( $post_id );
	} elseif ( is_home() ) {
		$rest = array(
			array(
				'label' => single_post_title( '', false ),
				'url'   => null,
			),
		);
	} elseif ( is_search() ) {
		$rest = array(
			array(
				/* translators: %s: the search terms. */
				'label' => sprintf( __( 'Αναζήτηση: %s', 'uoa-blocks' ), get_search_query( false ) ),
				'url'   => null,
			),
		);
	} elseif ( is_404() ) {
		$rest = array(
			array(
				'label' => __( 'Η σελίδα δεν βρέθηκε', 'uoa-blocks' ),
				'url'   => null,
			),
		);
	} else {
		$rest = array(
			array(
				'label' => wp_strip_all_tags( get_the_archive_title() ),
				'url'   => null,
			),
		);
	}

	return array_merge( array( $home ), $rest );
}

/**
 * Block render callback.
 *
 * @param array<string, mixed> $attributes Block attributes (none).
 * @param string               $content    Inner content (none).
 * @param \WP_Block|null       $block      This block, for the postId context.
 */
function render( array $attributes, string $content = '', ?\WP_Block $block = null ): string {
	$post_id = (int) ( $block->context['postId'] ?? 0 );

	// Singular views, and the editor preview (the block renderer sets up the edited post).
	if ( 0 === $post_id && ( is_singular() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) ) {
		$post_id = (int) get_the_ID();
	}

	return markup( __( 'Διαδρομή πλοήγησης', 'uoa-blocks' ), trail( $post_id ) );
}
