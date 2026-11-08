#!/usr/bin/env bash
# Keeps spacing on the 8-point scale (see _sass/_tokens.scss and _layout.scss).
# Fails on any padding, margin, gap or max-width line in _sass that holds a raw
# px value without an inline `// geometry: <reason>` or
# `// rhythm-exception: <reason>` comment on the same line. Legacy $space-*
# tokens need no check here: they are undefined, so the Sass build fails on them.
# The check is line-based and px-only: keep each declaration on one line.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d _sass ]; then
  echo "::error::Spacing check could not find _sass."
  exit 2
fi

status=0
matches=$(grep -rnE --include='*.scss' --exclude='_tokens.scss' \
  '(padding|margin|gap|max-width)[a-z-]*:[^;]*[0-9]+px' _sass) || status=$?
if [ "$status" -gt 1 ]; then
  echo "::error::Spacing check could not read _sass."
  exit "$status"
fi

raw=$(printf '%s\n' "$matches" \
  | grep -v '@media' \
  | grep -vE 'geometry:|rhythm-exception:' \
  | grep -v '^$' || true)

if [ -n "$raw" ]; then
  echo "::error::Raw px spacing in _sass. Use a \$grid-* step or a rhythm role, or add an inline // geometry: or // rhythm-exception: comment (with a reason) on the same line."
  echo "$raw"
  exit 1
fi
echo "Spacing check passed."
