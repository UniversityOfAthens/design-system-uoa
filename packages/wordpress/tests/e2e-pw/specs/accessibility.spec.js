import { test } from '@playwright/test';
import { routes, gotoReady, expectAccessible, otherTheme, withTheme } from './helpers';

/**
 * axe-core scans (WCAG 2.2 AA + best practices): whole pages under the UOA theme,
 * and only the blocks under another theme (its own markup isn't ours).
 */
test.describe( 'Accessibility (axe)', () => {
	for ( const [ name, path ] of Object.entries( routes ) ) {
		test( `${ name } — UOA theme`, async ( { page } ) => {
			await gotoReady( page, path );
			await expectAccessible( page, name );
		} );
	}

	test( `components — ${ otherTheme }, blocks only`, async ( { page } ) => {
		await gotoReady( page, withTheme( routes.components, otherTheme ) );
		await expectAccessible( page, `components (${ otherTheme })`, { include: '.entry-content, .wp-block-post-content' } );
	} );

	test( 'components with the second tab and the second accordion item open', async ( { page } ) => {
		await gotoReady( page, routes.components );
		await page.locator( '.uoa-tabs__tab' ).nth( 1 ).click();
		await page.locator( '[data-uoa-accordion="single"] summary' ).nth( 1 ).click();
		await expectAccessible( page, 'components (interacted)' );
	} );
} );
