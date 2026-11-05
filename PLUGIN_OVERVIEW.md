Hmm Essentials bundles the BB features used every day into one plugin.

## Project organizer

Hmm Essentials adds a calm, compact project organizer to BB's left sidebar. The
Chat/Code view toggle sits inline with BB's New thread button, with a filter box
below for narrowing threads by title or project. Threads that need you sit in
their own section above Collections, and projects that have not been filed remain in the
same flat list shape as BB's native sidebar.

Create, rename, reorder, collapse, and delete Collections without changing BB
projects themselves. Each Collection can be toggled individually, and every
titled section (Pinned, Collections, Chats) can be hidden or shown by clicking
its header. Drag a project onto a Collection to move it. Project action menus,
also opened by right-clicking a Collection or project row,
keep Rename project and Delete project, plus Clear threads for removing
inactive threads while preserving running, attention, and error threads.
The personal Chats header also provides Clear chats with the same protection. Both clear
dialogs offer Bulk deletions to pick specific threads or chats to delete.
Deleting a Collection simply returns its projects to the ungrouped list. The
personal Threads project is protected and remains outside every Collection.
Pin project in a project's action menu adds it to a Pinned section that stays
fixed above Collections, just below the sidebar header, for the projects in
focus right now. Pinned projects also stay in their usual place.

When the active thread changes, the sidebar opens its Collection, project, and
section if collapsed, highlights the row, and scrolls it into view.

Thread rows continue to use BB's own navigation and actions: unread state,
BB's own thread menu (pin, rename, archive, notification muting, and any action
BB adds later), delete confirmation, keyboard shortcuts, and split view
gestures. A header toggle separates project threads from non-project chats. Rows use a
loose layout like BB's default list, and
empty projects show only their header. The list stays muted: idle threads are
dimmed, while the open thread and threads that are running or need attention
stand out. Projects and Chats show up to five threads and Collections up to five
projects, with a faded **Show N more** toggle that never hides anything open,
running, or needing attention. Clicking a Collection or project name toggles it,
and section header actions appear on hover. Collection data is stored in the plugin's namespaced SQLite
database and updates are broadcast to other open clients.

The Activity view is available as a floating palette with **Cmd+E**;
search matches thread titles and project names, All / Unread / Pinned / Running
filters and a Recent or A–Z order narrow the results, arrow keys move through the
results, **Enter** opens the selected thread, and **Cmd+Enter** opens a split.
Recents lists the five most recently active threads, and each row shows a status dot, the
title, and the project name, which a split button replaces on hover.
The palette is centered horizontally at 15% from the top of BB's main chat
container, and stays a centered dialog on narrow windows instead of becoming a
bottom drawer. The new-thread-in-split dialog behaves the same way.

**New thread in split** in the command palette (**Cmd+Shift+P**)
opens BB's full new-thread composer in a dialog and opens the started thread in
a split, only in the window that ran the command. **Delete current thread** (**Cmd+Shift+Backspace**) opens BB's delete confirmation for the
current thread or the focused split pane.

**Zen mode current thread** in the command palette (**Cmd+Shift+Enter**) opens the current thread, or the focused split
pane, in a bottom-placed dialog over a blurred glass overlay, stacked with two card layers and a
pixel "zen" wordmark below, with the thread name centered in a compact header and Esc or a dimmed
close button on the right to dismiss. A context ring beside the permission label shows estimated
context usage, with used and left tokens on hover.

**Check me later** in the command palette covers the current thread, or the focused split pane,
with a blurred glass overlay showing a pixel "check me" wordmark (incognito-style pixel font) and the thread title. Clicking
the cover reveals the thread again. Covers only show on thread routes, so Settings and other pages stay usable.

Because BB's thread-list replacement slot is exclusive, selecting Hmm Sidebar uses
one composed list.

## Prompt library

Commands is a small prompt library for BB agents. It places a Commands
action in the agent composer, so reusable
instructions are available before and after a thread starts.

The manager opens from the Command action or with `Cmd+Shift+J` (`Ctrl+Shift+J`
on Windows and Linux), which toggles it open and closed from the composer
or the Command Palette (`Toggle commands`, shortcut shown on the
right). With split threads it targets the focused pane, so inserts land in
the active thread's composer. The header carries the title, command count, List/Stats tabs, and close.
Search and a compact `New` button share one row; the new-command form is
collapsed until requested, and saved commands appear as compact rows. Search is
focused on open and matches names and prompt text: every word must match, accents are ignored, names also match fuzzily, and results are ranked best first; Enter with a non-empty query
inserts the first match, and ArrowUp/ArrowDown move a wrapping highlight so Enter inserts the highlighted row. Each row reveals inline actions on hover or keyboard
focus; they stay visible on touch screens. The manager is centered 15% from
the top of BB’s main chat container.

Save a command with a short name and a prompt body. The manager keeps each
saved prompt in the plugin's own SQLite database, refreshes open BB clients
through a realtime signal, and provides four direct actions:

- Copy the prompt to the system clipboard.
- Insert it into the active agent composer, preserving any draft text.
- Edit its name and prompt in the same form used to create it.
- Delete it after an inline confirmation.

Every insert increments the command's use count. The **Statistics** tab shows
the top 5 most used commands and the top 5 least used ones, each with its
count; copying does not count as a use.

Insertion only edits the draft, closes the manager, and returns focus to the
prompt input. It never
submits the agent turn. The dialog stays centered on narrow windows instead of becoming a
drawer, and list actions use larger touch targets on coarse-pointer screens.

## Reply suggestions

Suggested replies turn the answers you type over and over into one-tap buttons.

At the end of a response that expects an answer, the agent proposes 2-4 short
replies written the way you would type them. They appear as buttons under the
message; tap one and it is sent to the thread immediately, or queued if the
agent is still working. Want to tweak one first? Drag it into the prompt
input and edit before sending.

Suggestions start appearing in new threads after the plugin is enabled.

## Incognito chats

Incognito chats give bb a short-lived private workspace for conversations that
should not remain in the normal thread list.

Click the **Eye off** CTA in the New Thread or an existing thread's composer, press
**Cmd+Option+N**, or choose **Incognito chat** from the side panel launcher. The chat
opens as a side panel tab next to your work, and falls back to an overlay on screens
without a side panel. It keeps the
same project, provider, model, environment, and permission settings available
in bb's normal composer—including provider-managed environment and machine
inputs—then creates a hidden thread and renders bb's standard `ThreadChat`
surface so streaming, tools, approvals, and provider controls behave normally.

Set a default model under **Incognito chats** on the plugin's settings page to choose the provider,
model, reasoning level, and service tier every new incognito chat starts with.
The picker reads bb's live provider catalog; **Use BB default** returns
incognito chats to bb's own defaults. You can still change the model per chat
in the composer.

The chat uses a title-only header and a small centered pixel "incognito" wordmark
until the first message is sent. Its composer keeps equal horizontal padding and
stays anchored to the bottom of the view. Long drafts scroll inside the editor, so
the composer actions stay visible.

Pressing the shortcut again hides the side panel and keeps the chat. Closing the
Incognito chat tab or switching to another chat stops any active turn and deletes
the temporary thread immediately. Chats left open after a disconnect or
crash are deleted within about 5 minutes. Reloading the plugin keeps open chats.

The regular New Thread composer remains unchanged: a message sent there is a
normal visible bb thread. Only sessions opened through the Eye off CTA or the
Incognito chat panel action receive the hidden-list behavior.

Incognito does not make provider traffic disappear, and it cannot roll back
workspace changes or commands an agent already ran. It is designed for
conversation retention, not for undoing agent work.

## Task checklist

Agents get an `hmm_todo` tool and are asked to use it instead of their built-in
todo or plan tools. When an agent starts work that needs tools, a checklist card
appears above the thread's composer and updates as each step starts and
finishes, with the same look for every provider. When every step is done, the
card shows every step checked, shrinks to a one-line summary when the agent
stops, and disappears once you send the next message. When the agent finishes with
only the last step in progress, that step is checked for it; any other
unfinished list hides when the agent stops. Writing the final reply is never a
step. The card only shows progress; reply through the composer as usual.

The tool reaches new sessions only, and an agent can still skip it. A thread's
checklist is deleted with the thread, including incognito chats.
