import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import type { Result as AxeViolation } from 'axe-core';

/** Routes created by scripts/seed.sh. */
export const routes = {
	home: '/',
	components: '/components/',
	deep: '/studies/undergraduate/philology/',
} as const;

/** A theme other than UOA, to prove the plugin stands alone (tests/e2e-pw/mu-plugin.php). */
export const otherTheme = 'twentytwentyfive';

export const withTheme = ( path: string, theme: string ) => `${ path }?uoa-theme=${ theme }`;

/** WCAG 2.2 AA plus axe best practices. */
export const axeTags = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice' ];

export async function gotoReady( page: Page, path: string ) {
	await page.goto( path, { waitUntil: 'networkidle' } );
	await page.evaluate( () => document.fonts.ready );
}

function describeViolations( violations: AxeViolation[] ) {
	return violations
		.map( ( v ) => {
			const nodes = v.nodes.slice( 0, 5 ).map( ( n ) => `      - ${ n.target.join( ' ' ) }\n        ${ n.failureSummary?.split( '\n' ).join( '\n        ' ) }` ).join( '\n' );
			return `  [${ v.impact }] ${ v.id }: ${ v.help } (${ v.helpUrl })\n${ nodes }`;
		} )
		.join( '\n\n' );
}

/**
 * Run axe on the current page and fail with a readable report. `include` limits the
 * scan to our markup — a third-party theme's own issues aren't ours to fix.
 */
export async function expectAccessible( page: Page, label: string, options: { include?: string } = {} ) {
	let builder = new AxeBuilder( { page } ).withTags( axeTags );
	if ( options.include ) {
		builder = builder.include( options.include );
	}
	const results = await builder.analyze();
	expect( results.violations, `axe violations on ${ label }:\n${ describeViolations( results.violations ) }` ).toEqual( [] );
}

export { adminState } from '../global-setup';
