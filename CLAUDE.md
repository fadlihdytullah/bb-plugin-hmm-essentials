# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A single BB plugin (`hmm-essentials`) that bundles several features: sidebar collections, prompt library (commands), suggested replies, incognito chats, todo checklists, and a browser opener. Built on `@get-bb/plugin-sdk`.

## Commands

```sh
npm install
npm test                                   # vitest (needs NODE_OPTIONS=--no-webstorage, set in the script)
npx vitest run features/todo               # single feature / file
npx vitest run -t "test name"              # single test by name
npm run typecheck                          # tsc --noEmit
bb plugin build                            # build to dist/
bb plugin install .                        # install locally into BB
bb plugin reload hmm-essentials            # reload the installed plugin
```

**After every change, always run `bb plugin build && bb plugin reload hmm-essentials`** so the running BB picks it up.

## Architecture

- Root `server.ts` runs the migrations, then calls each feature's default `plugin(bb)` server entry. Root `app.tsx` calls each feature's `register(app)`. A new feature must be wired into both (if it has both sides).
- Each feature lives in `features/<name>/` with `server.ts` (RPC, agent instructions/tools, event hooks) and `app.tsx` (UI slots, commands). Server files export their `rpcContract`; the app imports the type to call `useRpc`. Some features keep shared schemas in `contract.ts`.
- All features share one plugin id and one SQLite DB (`data.db`). `migrations.ts` is a single append-only list: `bb.storage.migrate` tracks statements by index, so only append, never edit or reorder shipped entries.
- RPC method names share one namespace across all features — pick unique names.
- Commands (`app.commands.register`) only receive `{ threadId, projectId, experimental_panel }`, no navigation or React hooks. Pattern used throughout: the command dispatches a `window` `CustomEvent`, and an `app.slots.experimental_appOverlay` component listens for it and does the work (dialogs, `useBbNavigate()`, etc.).
- Dialogs rendered from inside composer slots get clipped (the promptbox is a container-query containing block), so floating UI lives in app overlays instead.
- Theming/DOM targeting uses `data-hmm="<feature>"`, not `data-bb-plugin`, since every feature has the same plugin id. Never identify a feature's threads by `originPluginId` either.
- Shared UI: `components/ui` (shadcn-style, `components.json`), `lib/portal-scope.ts` (props to keep portaled content inside the plugin's styling scope), `@/` path alias maps to the repo root.
- Tests use `createFakePluginHost` from `@get-bb/plugin-sdk/testing` for servers and the SDK's slot renderer for app tests (see `features/sidebar/app.test.tsx`).

## Feature notes

- Incognito: chats are cleaned up by a heartbeat sweep after 5 minutes without a heartbeat, not on unload. Its global shortcut is a capture-phase keydown listener so BB's own shortcuts can't swallow it.
- Todo: `hmm_todo` is an agent tool; tool names are unique across plugins and tool changes only reach new sessions. The checklist is deleted on `thread.active`; on `thread.idle` a lone trailing `in_progress` step is auto-checked so agents never call the tool after their final reply.
- Sidebar: replaces BB's thread list (exclusive slot), so everything composes into one list. Active-thread reveal is driven by effects keyed on `activeThreadId`, so manual collapses stick until it changes.

## Docs

`README.md` (dev notes) and `PLUGIN_OVERVIEW.md` (user-facing feature description) should be updated when feature behavior changes; `features/overview/app.tsx` holds the "What's inside" list shown on the plugin settings page.
