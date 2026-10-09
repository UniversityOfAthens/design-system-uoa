<?php
/**
 * The markup contract (ADR 0003): every block outputs @uoa/core's reference markup.
 *
 * Each case renders a block and asserts its output is one of the examples in
 * packages/core/src/components/<name>/<name>.html. Whitespace next to tags and image
 * URLs (the reference uses placeholder data URIs) don't count; everything else —
 * elements, classes, attributes and their order, nesting, text — must match.
 *
 * @package uoa-blocks
 */

declare( strict_types = 1 );

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class MarkupTest extends TestCase {

	private const CORE   = __DIR__ . '/../../../core/src/components/';
	private const BLOCKS = __DIR__ . '/../../uoa-blocks/blocks/';

	/**
	 * Comparable form of a piece of HTML.
	 */
	private static function normalize( string $html ): string {
		$html = (string) preg_replace( '/<!--.*?-->/s', '', $html );
		$html = (string) preg_replace( '/\bsrc="[^"]*"/', 'src=""', $html );
		$html = (string) preg_replace( '/\s*(<[^>]+>)\s*/', '$1', $html );

		return trim( (string) preg_replace( '/\s+/', ' ', $html ) );
	}

	private static function assertInReference( string $component, string $actual ): void {
		self::assertNotSame( '', $actual, 'the block rendered nothing' );
		self::assertStringContainsString(
			self::normalize( $actual ),
			self::normalize( (string) file_get_contents( self::CORE . "$component/$component.html" ) ),
			"output isn't one of the examples in $component.html"
		);
	}

	public static function badges(): iterable {
		yield 'neutral' => array( 'neutral', 'Νέο πρόγραμμα' );
		yield 'info' => array( 'info', 'Προθεσμία: 12 Οκτ' );
		yield 'success' => array( 'success', 'Εγκρίθηκε' );
		yield 'warning' => array( 'warning', 'Θέσεις περιορισμένες' );
		yield 'danger' => array( 'danger', 'Ακυρώθηκε' );
	}

	#[DataProvider( 'badges' )]
	public function test_badge( string $variant, string $text ): void {
		self::assertInReference( 'badge', UOA\Blocks\Badge\render( array( 'text' => $text, 'variant' => $variant ) ) );
	}

	public static function buttons(): iterable {
		yield 'primary' => array( array( 'text' => 'Υποβολή αίτησης' ) );
		yield 'secondary' => array( array( 'text' => 'Αποθήκευση', 'variant' => 'secondary' ) );
		yield 'tertiary' => array( array( 'text' => 'Ακύρωση', 'variant' => 'tertiary' ) );
		yield 'small' => array( array( 'text' => 'Φίλτρα', 'size' => 'sm' ) );
		yield 'link' => array( array( 'text' => 'Εισαγωγή στο Τμήμα', 'url' => '/admissions' ) );
		yield 'with icon' => array( array( 'text' => 'Λήψη προγράμματος', 'icon' => 'download' ) );
		yield 'icon only' => array( array( 'icon' => 'search', 'label' => 'Αναζήτηση', 'variant' => 'secondary' ) );
		yield 'disabled' => array( array( 'text' => 'Υποβολή αίτησης', 'disabled' => true ) );
		yield 'disabled link' => array( array( 'text' => 'Εισαγωγή στο Τμήμα', 'url' => '/admissions', 'disabled' => true ) );
	}

	#[DataProvider( 'buttons' )]
	public function test_button( array $attributes ): void {
		self::assertInReference( 'button', UOA\Blocks\Button\render( $attributes ) );
	}

	public function test_button_needs_a_name(): void {
		self::assertSame( '', UOA\Blocks\Button\render( array( 'icon' => 'search' ) ), 'icon-only without a label' );
		self::assertSame( '', UOA\Blocks\Button\render( array() ), 'no text, no icon' );
	}

	public function test_full_width_button(): void {
		// The reference shows a submit button, which a content block never is.
		self::assertSame(
			'<button class="uoa-button uoa-button--block" type="button">Σύνδεση</button>',
			UOA\Blocks\Button\render( array( 'text' => 'Σύνδεση', 'fullWidth' => true ) )
		);
	}

	public static function alerts(): iterable {
		yield 'info, message only' => array(
			array(),
			'<p>Οι εγγραφές για το χειμερινό εξάμηνο ανοίγουν στις 5 Οκτωβρίου.</p>',
		);
		yield 'warning with title' => array(
			array( 'variant' => 'warning', 'title' => 'Η προθεσμία λήγει αύριο' ),
			'<p>Υποβάλετε τη δήλωση μαθημάτων έως τις 23:59.</p>',
		);
		yield 'dismissible' => array(
			array( 'variant' => 'warning', 'dismissible' => true ),
			'<p>Η βιβλιοθήκη θα είναι κλειστή το Σάββατο λόγω συντήρησης.</p>',
		);
	}

	#[DataProvider( 'alerts' )]
	public function test_alert( array $attributes, string $content ): void {
		self::assertInReference( 'alert', UOA\Blocks\Alert\render( $attributes, $content ) );
	}

	public function test_empty_alert_renders_nothing(): void {
		self::assertSame( '', UOA\Blocks\Alert\render( array(), "\n" ) );
	}

	public function test_accordion(): void {
		$items = UOA\Blocks\AccordionItem\render(
			array( 'title' => 'Πτυχιακή εργασία', 'open' => true ),
			'<p>Δηλώνεται στο 7ο εξάμηνο με αίτηση προς τη Γραμματεία.</p>'
		) . UOA\Blocks\AccordionItem\render(
			array( 'title' => 'Πρακτική άσκηση' ),
			'<p>Διαρκεί δύο μήνες και μοριοδοτείται με 5 ECTS.</p>'
		);

		self::assertInReference( 'accordion', UOA\Blocks\Accordion\render( array( 'single' => true ), $items ) );
	}

	public function test_accordion_item_with_inline_content(): void {
		self::assertInReference(
			'accordion',
			UOA\Blocks\AccordionItem\render(
				array( 'title' => 'Πώς δηλώνω μαθήματα;' ),
				'<p>Από τη φοιτητική πύλη, <em>Δηλώσεις → Δήλωση μαθημάτων</em>, έως την καταληκτική ημερομηνία.</p>'
			)
		);
	}

	public function test_tabs(): void {
		self::assertInReference(
			'tabs',
			UOA\Blocks\Tabs\markup(
				'Σπουδές',
				array(
					array( 'id' => 'programme', 'title' => 'Πρόγραμμα', 'html' => '<p>Το πρόγραμμα σπουδών περιλαμβάνει 8 εξάμηνα και πτυχιακή εργασία.</p>' ),
					array( 'id' => 'enrolment', 'title' => 'Εγγραφές', 'html' => '<p>Οι εγγραφές γίνονται ηλεκτρονικά από τις 5 Οκτωβρίου.</p>' ),
					array( 'id' => 'grants', 'title' => 'Υποτροφίες', 'html' => '<p>Υποτροφίες αριστείας για το 10% των εισακτέων.</p>' ),
				)
			)
		);
	}

	public static function breadcrumbs(): iterable {
		$current = static fn ( string $label ): array => array( 'label' => $label, 'url' => null );
		$link    = static fn ( string $label, string $url ): array => array( 'label' => $label, 'url' => $url );

		yield 'standard' => array(
			array( $link( 'Αρχική', '/' ), $link( 'Σπουδές', '/studies' ), $link( 'Προπτυχιακές σπουδές', '/studies/undergraduate' ), $current( 'Τμήμα Φιλολογίας' ) ),
		);
		yield 'shallow' => array( array( $link( 'Αρχική', '/' ), $current( 'Εκδηλώσεις' ) ) );
		yield 'single crumb' => array( array( $current( 'Επικοινωνία' ) ) );
	}

	#[DataProvider( 'breadcrumbs' )]
	public function test_breadcrumb( array $crumbs ): void {
		self::assertInReference( 'breadcrumb', UOA\Blocks\Breadcrumb\markup( 'Διαδρομή πλοήγησης', $crumbs ) );
	}

	public static function cards(): iterable {
		yield 'news' => array(
			array(
				'media'   => array( 'src' => '/news.jpg', 'alt' => 'Φοιτητές στο αμφιθέατρο κατά την τελετή έναρξης', 'width' => 800, 'height' => 450 ),
				'eyebrow' => 'Νέα',
				'title'   => 'Έναρξη εγγραφών εαρινού εξαμήνου',
				'url'     => '#anakoinosi',
				'date'    => array( 'datetime' => '2026-02-09', 'text' => '9 Φεβρουαρίου 2026' ),
				'text'    => 'Οι εγγραφές γίνονται ηλεκτρονικά μέσω της θυρίδας φοιτητή έως τις 27 Φεβρουαρίου.',
			),
		);
		yield 'event' => array(
			array(
				'media'   => array( 'src' => '/library.jpg', 'alt' => 'Η κεντρική βιβλιοθήκη τη νύχτα', 'width' => 800, 'height' => 450 ),
				'eyebrow' => 'Εκδήλωση',
				'title'   => 'Βραδιά ερευνητή: ανοιχτές πόρτες στα εργαστήρια',
				'url'     => '#ekdilosi',
				'date'    => array( 'datetime' => '2026-03-13T19:00', 'text' => '13 Μαρτίου, 19:00' ),
				'meta'    => array( 'Κεντρικό κτήριο, Μεγάλη Αίθουσα' ),
				'text'    => 'Ερευνητές παρουσιάζουν το έργο τους με πειράματα για μικρούς και μεγάλους. Είσοδος ελεύθερη.',
			),
		);
		yield 'person' => array(
			array(
				'horizontal' => true,
				'media'      => array( 'src' => '/portrait.jpg', 'alt' => 'Πορτρέτο της διδάσκουσας', 'width' => 400, 'height' => 400 ),
				'title'      => 'Μαρία Παπαδοπούλου',
				'url'        => '#profil',
				'meta'       => array( 'Καθηγήτρια Γλωσσολογίας', 'Τμήμα Φιλολογίας' ),
				'footer'     => array( 'text' => 'mpapadopoulou@uoa.gr', 'url' => 'mailto:mpapadopoulou@uoa.gr' ),
			),
		);
		yield 'course' => array(
			array(
				'eyebrow' => 'Προπτυχιακό μάθημα',
				'title'   => 'Εισαγωγή στη Γλωσσολογία',
				'url'     => '#mathima',
				'meta'    => array( 'ΓΛΩ 101', '6 ECTS' ),
				'badge'   => array( 'text' => 'Εαρινό εξάμηνο', 'variant' => 'success' ),
				'text'    => 'Βασικές έννοιες φωνητικής, μορφολογίας και σύνταξης, με παραδείγματα από την ελληνική.',
				'footer'  => array( 'text' => 'Περίγραμμα μαθήματος (PDF)', 'url' => '#perigramma' ),
			),
		);
		yield 'static' => array(
			array(
				'eyebrow' => 'Ανακοίνωση',
				'title'   => 'Συντήρηση δικτύου το Σαββατοκύριακο',
				'text'    => 'Το Σάββατο 14 Μαρτίου, 08:00–12:00, θα υπάρξουν σύντομες διακοπές στην πρόσβαση στο VPN.',
			),
		);
	}

	#[DataProvider( 'cards' )]
	public function test_card( array $card ): void {
		self::assertInReference( 'card', UOA\Blocks\Card\markup( $card ) );
	}

	public static function icons(): iterable {
		yield 'small' => array( array( 'name' => 'mail-outline', 'size' => 'sm' ) );
		yield 'default' => array( array( 'name' => 'mail-outline' ) );
		yield 'large' => array( array( 'name' => 'mail-outline', 'size' => 'lg' ) );
		yield 'directional' => array( array( 'name' => 'arrow-forward', 'size' => 'sm' ) );
	}

	#[DataProvider( 'icons' )]
	public function test_icon( array $attributes ): void {
		self::assertInReference( 'icon', UOA\Blocks\Icon\render( $attributes ) );
	}

	public function test_text_is_escaped(): void {
		self::assertSame( '<span class="uoa-badge">&lt;b&gt;x&lt;/b&gt;</span>', UOA\Blocks\Badge\render( array( 'text' => '<b>x</b>' ) ) );
		// RichText stores entities already; they must not be encoded twice.
		self::assertStringContainsString( '>A &amp; B<', UOA\Blocks\AccordionItem\render( array( 'title' => 'A &amp; B' ) ) );
	}

	/** Every core component has a block. */
	public function test_every_component_is_ported(): void {
		foreach ( glob( self::CORE . '*', GLOB_ONLYDIR ) as $dir ) {
			self::assertFileExists( self::BLOCKS . basename( $dir ) . '/block.json', basename( $dir ) . ' has no block' );
		}
	}

	public static function blocks(): iterable {
		foreach ( glob( self::BLOCKS . '*/block.json' ) as $file ) {
			yield basename( dirname( $file ) ) => array( dirname( $file ) );
		}
	}

	/** What uoa-blocks.php relies on when it registers the directory. */
	#[DataProvider( 'blocks' )]
	public function test_block_is_registrable( string $dir ): void {
		$json = json_decode( (string) file_get_contents( "$dir/block.json" ), true );
		$slug = basename( $dir );

		self::assertSame( "uoa/$slug", $json['name'] );
		self::assertSame( 'uoa-blocks', $json['textdomain'] );
		self::assertArrayNotHasKey( 'render', $json, 'render callbacks are passed by uoa-blocks.php, not block.json' );
		self::assertTrue( function_exists( 'UOA\\Blocks\\' . str_replace( '-', '', ucwords( $slug, '-' ) ) . '\\render' ) );
		self::assertFalse( $json['supports']['className'] ?? true, 'editors must not add classes the core lacks' );
	}

	/** Every variant a block offers is one the core styles. */
	#[DataProvider( 'blocks' )]
	public function test_variants_are_styled( string $dir ): void {
		$json    = json_decode( (string) file_get_contents( "$dir/block.json" ), true );
		$variant = $json['attributes']['variant'] ?? null;
		$slug    = basename( $dir );

		if ( null === $variant ) {
			$this->expectNotToPerformAssertions();
			return;
		}

		$css = (string) file_get_contents( self::CORE . "$slug/$slug.css" );
		foreach ( $variant['enum'] as $value ) {
			if ( $value !== $variant['default'] ) {
				self::assertStringContainsString( ".uoa-$slug--$value", $css );
			}
		}
	}
}
