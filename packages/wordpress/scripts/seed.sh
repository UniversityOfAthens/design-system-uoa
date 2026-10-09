#!/usr/bin/env sh
# Seed the wp-env site so every block has something to render.
#
# Runs INSIDE the wp-env cli container (POSIX sh, wp-cli available):
#   bun run seed          # seed once (no-op if already seeded)
#   bun run seed:reset    # wipe all content and seed again
#
# Wired into .wp-env.json "afterStart", so `bun run start` seeds automatically.
#   /                                  front page (no breadcrumb)
#   /components/                       one of every block
#   /studies/undergraduate/philology/  a deep page, for the breadcrumb trail
set -eu

DIR="$(cd "$(dirname "$0")" && pwd)"
MARKER="uoa_seeded"

log() { printf '  %s\n' "$*"; }

if [ "${1:-}" = "--reset" ]; then
	log "Emptying site content..."
	wp site empty --yes
	wp option delete "$MARKER" >/dev/null 2>&1 || true
elif [ "$(wp option get "$MARKER" 2>/dev/null || true)" = "1" ]; then
	log "Already seeded (wp option $MARKER). Use --reset to reseed."
	exit 0
fi

page() { # page <slug> <title> [parent id] [content file]
	wp post create --post_type=page --post_status=publish --porcelain \
		--post_name="$1" --post_title="$2" --post_parent="${3:-0}" \
		--post_content="$(cat "${4:-/dev/null}")"
}

wp rewrite structure '/%postname%/' --hard >/dev/null

home="$(page home 'Αρχική')"
wp option update show_on_front page >/dev/null
wp option update page_on_front "$home" >/dev/null

page components 'Στοιχεία' 0 "$DIR/seed/components.html" >/dev/null
studies="$(page studies 'Σπουδές')"
undergraduate="$(page undergraduate 'Προπτυχιακές σπουδές' "$studies")"
page philology 'Τμήμα Φιλολογίας' "$undergraduate" >/dev/null

# A real menu for the header/footer Navigation blocks. Without one, WordPress falls back
# to a page list that nests <ul> in <ul> (a core bug axe reports as `list`).
link() { printf '<!-- wp:navigation-link {"label":"%s","type":"page","id":%s,"url":"%s","kind":"post-type"} /-->' "$1" "$2" "$(wp post url "$2")"; }
wp post create --post_type=wp_navigation --post_status=publish --post_title='Κύριο μενού' \
	--post_content="$(link 'Στοιχεία' "$(wp post list --post_type=page --name=components --field=ID)")$(link 'Σπουδές' "$studies")" >/dev/null

wp option update "$MARKER" 1 >/dev/null
log "Seeded: /, /components/, /studies/undergraduate/philology/"
