# Powvy Code (Orca fork)

Powvy Code is a fork of [Orca](https://github.com/stablyai/orca) (MIT, © Lovecast Inc.; see `LICENSE`).
Everything Orca does is here; this folder holds what Powvy adds on top.

- `plugins/powvy-memory`: a panel showing Claude Mem memories for the focused workspace, memory search, and the Obsidian 关于我 profile (read-only).

Changes to Orca itself are kept small so `git pull upstream main` keeps working:
name, icons and app id; Chinese UI by default; telemetry and Orca's auto-update turned off.

Build: `export PATH=~/.local/share/node24/bin:$PATH && pnpm install && pnpm build:mac`
Update from Orca: `git fetch upstream && git merge upstream/main`, then rebuild.
