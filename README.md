# bb-plugin-hmm-essentials

Daily essentials for [bb](https://getbb.app) in one plugin: project collections, a prompt library, tap-to-send reply suggestions, and incognito chats.

## Layout

| Path | Contents |
| --- | --- |
| `features/sidebar` | Collections, Activity palette, Zen mode, split composer |
| `features/commands` | Prompt library in the composer |
| `features/suggest` | Quick replies under agent responses |
| `features/incognito` | Temporary hidden chats |
| `features/todo` | `hmm_todo` agent tool and the checklist card above the composer |
| `features/overview` | What's inside section on the plugin settings page |
| `components/ui`, `lib`, `hooks` | Shared UI and helpers |
| `migrations.ts` | The one append-only migration list for `data.db` |

Each feature exports its server `plugin(bb)` and app `register(app)`; the root `server.ts` and `app.tsx` call them all.

## Run

```sh
npm install
npm test
npx tsc --noEmit
bb plugin build
bb plugin install .
```

## Notes

- `bb.storage.migrate` tracks statements by index, so add new statements to the end of `migrations.ts` and never edit shipped ones.
- RPC method names share one namespace across features.
- Incognito chats are cleaned up by the heartbeat sweep after 5 minutes without a heartbeat, not on plugin unload. Features share one plugin id, so never hide threads by `originPluginId`.
- The incognito composer action handles the shortcut and opens the side panel tab; the app overlay is the fallback for surfaces without a panel, because overlays have no side panel of their own.
- `hmm_todo` replaces the old todo instruction. Tool names are unique across plugins, and tool changes reach new sessions only. The card compares the checklist `updatedAt` with the run start to hide a finished list from an earlier turn.
- Themes target `data-hmm="<feature>"`, not `data-bb-plugin`, because every feature shares one plugin id.
- Data moved from `hmm-sidebar`, `hmm-commands`, and `hmm-incognito` on install; a backup is in `~/.bb/plugin-backups/hmm-essentials-swap/`.
- Rebind a shortcut with `bb settings keyboard set plugin:hmm-essentials/zen Mod+Shift+Enter`.
