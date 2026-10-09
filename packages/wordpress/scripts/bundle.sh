#!/usr/bin/env sh
# Build the distributable zips: dist/uoa-blocks.zip (plugin) and dist/uoa.zip (theme).
# Run via `bun run bundle`, after `bun run build` at the repo root.
set -eu

cd "$(dirname "$0")/.."

rm -rf dist
mkdir -p dist/stage

# Allowlist: only what WordPress reads at runtime.
bundle() { # bundle <slug> <files…>
	slug="$1"
	shift
	[ -d "$slug/assets/uoa" ] || { echo "$slug/assets/ is missing — run bun run build first" >&2; exit 1; }
	mkdir -p "dist/stage/$slug"
	for path in "$@"; do
		[ -e "$slug/$path" ] && cp -r "$slug/$path" "dist/stage/$slug/"
	done
	(cd dist/stage && zip -rq "../$slug.zip" "$slug")
	echo "Wrote dist/$slug.zip ($(du -h "dist/$slug.zip" | cut -f1))"
}

bundle uoa-blocks uoa-blocks.php inc blocks editor assets languages
bundle uoa style.css functions.php theme.json inc templates parts patterns assets languages

rm -rf dist/stage
