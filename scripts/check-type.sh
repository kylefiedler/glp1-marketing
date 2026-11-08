#!/usr/bin/env bash
# Keeps type on the roles in _sass/_type.scss. Fails on any font-size,
# font-family, font-weight, font-style, line-height, letter-spacing,
# text-transform or font shorthand line in _sass (outside _tokens.scss and
# _type.scss) without a trailing `// type-exception: <reason>` comment. Text
# styles belong in an `@include type-*` role; only ornament, UI and layout
# type is an exception.
# The check is line-based: keep each declaration on one line.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d _sass ]; then
  echo "::error::Type check could not find _sass."
  exit 2
fi

status=0
matches=$(grep -rnE --include='*.scss' --exclude='_tokens.scss' --exclude='_type.scss' \
  '(^|[{;[:space:]])(font-size|font-family|font-weight|font-style|line-height|letter-spacing|text-transform|font)[[:space:]]*:' \
  _sass) || status=$?
if [ "$status" -gt 1 ]; then
  echo "::error::Type check could not read _sass."
  exit "$status"
fi

raw=$(printf '%s\n' "$matches" \
  | grep -vE '^[^:]+:[0-9]+:[[:space:]]*(//|/\*)' \
  | grep -vE '//[[:space:]]*type-exception:[[:space:]]*[^[:space:]]' \
  | grep -v '^$' || true)

if [ -n "$raw" ]; then
  echo "::error::Raw type in _sass. Use an @include type-* role from _sass/_type.scss, or add a trailing // type-exception: <reason> comment on the same line."
  echo "$raw"
  exit 1
fi
echo "Type check passed."
