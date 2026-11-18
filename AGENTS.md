# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- `fmd-server-ctl listusers --raw` prints the usernames with Go's builtin `print`, which writes to stderr; parse the stdout table instead.
- `fmd-server-ctl deleteusers` reads a literal `delete` confirmation from stdin.
