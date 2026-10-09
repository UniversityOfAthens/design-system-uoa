import { test, expect } from '@playwright/test';
import { routes, adminState } from './helpers';

/**
 * The blocks in the block editor: registered on the client, valid when loaded from
 * saved content, previewed with the core markup and styles inside the canvas.
 */
test.describe( 'Block editor', () => {
	test.skip( ( { isMobile } ) => isMobile, 'wp-admin editing is a desktop task' );
	test.use( { storageState: adminState } );

	/** @type {string[]} */
	let errors;

	test.beforeEach( async ( { page, request } ) => {
		errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );

		const [ { id } ] = await ( await request.get( `/wp-json/wp/v2/pages?slug=${ routes.components.replaceAll( '/', '' ) }` ) ).json();
		await page.goto( `/wp-admin/post.php?post=${ id }&action=edit` );
		await page.waitForFunction( () => window.wp?.data?.select( 'core/block-editor' )?.getBlocks().length > 0 );
	} );

	test( 'every block is registered in the UOA category', async ( { page } ) => {
		const names = await page.evaluate( () =>
			window.wp.blocks.getBlockTypes().filter( ( t ) => t.category === 'uoa' ).map( ( t ) => t.name ).sort()
		);
		expect( names ).toEqual( [
			'uoa/accordion', 'uoa/accordion-item', 'uoa/alert', 'uoa/badge', 'uoa/breadcrumb',
			'uoa/button', 'uoa/card', 'uoa/icon', 'uoa/tab', 'uoa/tabs',
		] );
	} );

	test( 'saved content loads without invalid blocks or errors', async ( { page } ) => {
		const invalid = await page.evaluate( () => {
			const all = ( blocks ) => blocks.flatMap( ( b ) => [ b, ...all( b.innerBlocks ) ] );
			return all( window.wp.data.select( 'core/block-editor' ).getBlocks() )
				.filter( ( b ) => ! b.isValid )
				.map( ( b ) => b.name );
		} );
		expect( invalid ).toEqual( [] );
		expect( errors ).toEqual( [] );
	} );

	test( 'the canvas shows the core markup, styled', async ( { page } ) => {
		const canvas = page.frameLocator( 'iframe[name="editor-canvas"]' );
		// Containers are drawn by the editor script; leaves come from the PHP render.
		await expect( canvas.locator( '.uoa-tabs .uoa-tabs__tab' ).first() ).toBeVisible();
		await expect( canvas.locator( '.uoa-accordion .uoa-accordion__item' ).first() ).toBeVisible();
		await expect( canvas.locator( '.uoa-alert .uoa-alert__icon' ).first() ).toBeVisible();
		await expect( canvas.locator( '.uoa-badge' ).first() ).toBeVisible();
		await expect( canvas.locator( '.uoa-card' ).first() ).toBeVisible();

		const padding = await canvas.locator( '.uoa-badge' ).first().evaluate( ( el ) => parseFloat( getComputedStyle( el ).paddingInlineStart ) );
		expect( padding ).toBeGreaterThan( 0 );
	} );

	test( 'a block inserted from the editor saves and renders', async ( { page } ) => {
		await page.evaluate( () => {
			const { createBlock } = window.wp.blocks;
			window.wp.data.dispatch( 'core/block-editor' ).insertBlocks(
				createBlock( 'uoa/alert', { variant: 'success', title: 'Δοκιμή' }, [ createBlock( 'core/paragraph', { content: 'Κείμενο' } ) ] )
			);
		} );
		const saved = await page.evaluate( () => window.wp.data.select( 'core/editor' ).getEditedPostContent() );
		expect( saved ).toContain( '<!-- wp:uoa/alert {"variant":"success","title":"Δοκιμή"} -->' );
		expect( saved ).toContain( '<p>Κείμενο</p>' );
	} );
} );
