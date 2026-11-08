#!/usr/bin/env bash
# Keeps spacing on the 8-point scale (see _sass/_tokens.scss and _layout.scss).
# Fails on any padding, margin, gap or max-width line in _sass that holds a raw
# px value without an inline `// geometry: <reason>` or
# `// rhythm-exception: <reason>` comment on the same line. Legacy $space-*
# tokens need no check here: they are undefined, so the Sass build fails on them.
# The check is line-based and px-only: keep each declaration on one line.
set -euo pipefail
cd "$(dirname "$0")/.."

raw=$(grep -nE '(padding|margin|gap|max-width)[a-z-]*:[^;]*[0-9]+px' _sass/*.scss \
  | grep -v '_sass/_tokens.scss' \
  | grep -v '@media' \
  | grep -vE 'geometry:|rhythm-exception:' || true)

if [ -n "$raw" ]; then
  echo "::error::Raw px spacing in _sass. Use a \$grid-* step or a rhythm role, or add an inline // geometry: or // rhythm-exception: comment (with a reason) on the same line."
  echo "$raw"
  exit 1
fi
echo "Spacing check passed."
