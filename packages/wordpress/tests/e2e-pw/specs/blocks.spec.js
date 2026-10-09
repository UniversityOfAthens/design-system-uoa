import { test, expect } from '@playwright/test';
import { routes, gotoReady, otherTheme, withTheme } from './helpers';

/**
 * The blocks on the front end: the core markup, the core styles, the core behaviour —
 * under the UOA theme and under a theme that knows nothing about the design system.
 */
for ( const [ label, path ] of [
	[ 'UOA theme', routes.components ],
	[ otherTheme, withTheme( routes.components, otherTheme ) ],
] ) {
	test.describe( `Blocks — ${ label }`, () => {
		test.beforeEach( async ( { page } ) => {
			await gotoReady( page, path );
		} );

		test( 'every block outputs the core markup, with no wrapper classes', async ( { page } ) => {
			for ( const selector of [ '.uoa-badge', '.uoa-button', '.uoa-icon', '.uoa-alert', '.uoa-accordion', '.uoa-tabs', '.uoa-card' ] ) {
				await expect( page.locator( selector ).first(), selector ).toBeVisible();
			}
			await expect( page.locator( '[class*="wp-block-uoa-"]' ) ).toHaveCount( 0 );
		} );

		test( 'component styles load (and only those, from the plugin)', async ( { page } ) => {
			const badge = page.locator( '.uoa-badge--success' ).first();
			// Styled: a pill with padding, not bare inline text.
			expect( await badge.evaluate( ( el ) => parseFloat( getComputedStyle( el ).paddingInlineStart ) ) ).toBeGreaterThan( 0 );
			await expect( page.locator( 'link[href*="uoa-components.css"]' ) ).toHaveCount( 1 );
		} );

		test( 'tabs switch with the mouse and the arrow keys', async ( { page } ) => {
			const tabs = page.locator( '.uoa-tabs__tab' );
			await expect( tabs.first() ).toHaveAttribute( 'aria-selected', 'true' );
			await expect( page.locator( '.uoa-tabs__panel' ).nth( 1 ) ).toBeHidden();

			await tabs.nth( 1 ).click();
			await expect( tabs.nth( 1 ) ).toHaveAttribute( 'aria-selected', 'true' );
			await expect( page.locator( '.uoa-tabs__panel' ).nth( 1 ) ).toBeVisible();

			await page.keyboard.press( 'ArrowRight' );
			await expect( tabs.nth( 2 ) ).toBeFocused();
			await expect( tabs.nth( 2 ) ).toHaveAttribute( 'aria-selected', 'true' );
		} );

		test( 'single-open accordion closes the other item', async ( { page } ) => {
			const items = page.locator( '[data-uoa-accordion="single"] .uoa-accordion__item' );
			await expect( items.first() ).toHaveAttribute( 'open', '' );

			await items.nth( 1 ).locator( 'summary' ).click();
			await expect( items.nth( 1 ) ).toHaveAttribute( 'open', '' );
			await expect( items.first() ).not.toHaveAttribute( 'open', '' );
		} );

		test( 'a dismissible alert can be dismissed', async ( { page } ) => {
			const alert = page.locator( '[data-uoa-alert-dismissible]' );
			await expect( alert ).toHaveCount( 1 );
			await alert.locator( '[data-uoa-alert-close]' ).click();
			await expect( alert ).toHaveCount( 0 );
		} );
	} );
}

test.describe( 'Breadcrumb (UOA theme templates)', () => {
	test( 'shows the trail from home to a deep page', async ( { page } ) => {
		await gotoReady( page, routes.deep );
		const nav = page.locator( 'nav.uoa-breadcrumb' );
		await expect( nav.locator( '.uoa-breadcrumb__link' ) ).toHaveText( [ 'Αρχική', 'Σπουδές', 'Προπτυχιακές σπουδές' ] );
		await expect( nav.locator( '[aria-current="page"]' ) ).toHaveText( 'Τμήμα Φιλολογίας' );
	} );

	test( 'is absent on the front page', async ( { page } ) => {
		await gotoReady( page, routes.home );
		await expect( page.locator( '.uoa-breadcrumb' ) ).toHaveCount( 0 );
	} );
} );

test.describe( 'UOA theme', () => {
	test( 'loads the base styles; another theme does not get them', async ( { page } ) => {
		await gotoReady( page, routes.components );
		await expect( page.locator( 'link[href*="uoa-base.css"]' ) ).toHaveCount( 1 );

		await gotoReady( page, withTheme( routes.components, otherTheme ) );
		await expect( page.locator( 'link[href*="uoa-base.css"]' ) ).toHaveCount( 0 );
	} );
} );
