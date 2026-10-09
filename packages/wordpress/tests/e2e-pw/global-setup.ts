import { request } from '@playwright/test';
import type { FullConfig } from '@playwright/test';

/** Where the logged-in admin session is saved; specs that need wp-admin reuse it. */
export const adminState = new URL( './.auth/admin.json', import.meta.url ).pathname;

/**
 * Log in once, before any spec. WordPress keeps a user's sessions in one user-meta
 * row, so parallel logins overwrite each other's tokens; one shared session doesn't.
 * The form is posted directly: wp-login.php clears the username field shortly after
 * load, which races typing.
 */
export default async function globalSetup( config: FullConfig ) {
	const baseURL = config.projects[ 0 ].use.baseURL;
	const context = await request.newContext( { baseURL } );
	const response = await context.post( '/wp-login.php', {
		form: { log: 'admin', pwd: 'password', 'wp-submit': 'Log In', redirect_to: '/wp-admin/' },
	} );
	if ( ! response.url().includes( '/wp-admin/' ) ) {
		throw new Error( `Logging in to ${ baseURL } failed: ended at ${ response.url() }` );
	}
	await context.storageState( { path: adminState } );
	await context.dispose();
}
