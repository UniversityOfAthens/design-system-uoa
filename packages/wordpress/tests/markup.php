<?php
/**
 * Markup contract test (ADR 0003).
 *
 * Renders each adapter block with stubbed WordPress functions and diffs the output
 * against the core reference markup. If the two ever drift, this fails — the core
 * markup is the contract, the adapter follows it.
 *
 * Run: php tests/markup.php
 *
 * @package uoa-ds
 */

declare( strict_types = 1 );

const CORE = __DIR__ . '/../../core/src/components/';

/** Minimal stand-ins for the WordPress escaping/translation functions. */
function __( string $text, string $domain = 'default' ): string {
	return $text;
}

function esc_html__( string $text, string $domain = 'default' ): string {
	return htmlspecialchars( __($text, $domain), ENT_QUOTES, 'UTF-8' );
}

function esc_attr( string $text ): string {
	return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
}

define( 'ABSPATH', __DIR__ );

require_once __DIR__ . '/../uoa-ds-blocks/blocks/badge/render.php';

$failures = 0;

/**
 * Report one check.
 *
 * @param bool   $ok      Whether the check passed.
 * @param string $message Description of the check.
 */
function check( bool $ok, string $message ): void {
	global $failures;

	if ( ! $ok ) {
		++$failures;
	}

	printf( "%s %s\n", $ok ? '  ok  ' : ' FAIL ', $message );
}

// The block's own attribute schema must cover every variant the core CSS styles.
$block_json = json_decode( (string) file_get_contents( __DIR__ . '/../uoa-ds-blocks/blocks/badge/block.json' ), true );
$badge_css  = (string) file_get_contents( CORE . 'badge/badge.css' );

foreach ( $block_json['attributes']['variant']['enum'] as $variant ) {
	$class = 'neutral' === $variant ? '.uoa-badge {' : '.uoa-badge--' . $variant . ' {';
	check(
		str_contains( $badge_css, $class ),
		sprintf( 'variant "%s" is styled in badge.css', $variant )
	);
}

// Every badge span in the reference markup, with the variant its class encodes.
$reference = (string) file_get_contents( CORE . 'badge/badge.html' );
preg_match_all( '/^<span class="uoa-badge(?: uoa-badge--([a-z]+))?">(.+)<\/span>$/m', $reference, $matches, PREG_SET_ORDER );

check( count( $matches ) > 0, 'badge.html contains badge spans to compare against' );

foreach ( $matches as $match ) {
	// The optional capture is '' (not absent) when the class carries no variant.
	$variant = '' !== ( $match[1] ?? '' ) ? $match[1] : 'neutral';
	$text    = html_entity_decode( $match[2], ENT_QUOTES, 'UTF-8' );

	$actual = UOA\DS\Blocks\Badge\render(
		array(
			'text'    => $text,
			'variant' => $variant,
		)
	);

	check(
		trim( $match[0] ) === $actual,
		sprintf(
			"renders \"%s\" (%s) exactly as the reference markup%s",
			$text,
			$variant,
			trim( $match[0] ) === $actual ? '' : sprintf( "\n        expected: %s\n        actual:   %s", trim( $match[0] ), $actual )
		)
	);
}

// Edge cases the reference markup can't show.
check( '' === UOA\DS\Blocks\Badge\render( array( 'text' => '' ) ), 'empty text renders nothing' );
check(
	'<span class="uoa-badge">&lt;b&gt;bold&lt;/b&gt;</span>' === UOA\DS\Blocks\Badge\render( array( 'text' => '<b>bold</b>' ) ),
	'text is escaped, not injected as HTML'
);

exit( $failures > 0 ? 1 : 0 );