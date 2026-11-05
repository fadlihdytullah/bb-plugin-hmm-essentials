import type { BbPluginApi } from "@get-bb/plugin-sdk";
import { z } from "zod";
import { rpcContract, TODO_CHANGED, todoItemSchema, type TodoItem } from "./contract";

const INSTRUCTIONS = `Track multi-step work with hmm_todo instead of any built-in todo or plan tool (TodoWrite, TaskCreate, update_plan). For a request that needs tools, make hmm_todo your very first tool call, before reading, searching or running anything; if you must look around first, make that the first step and mark it in_progress. Call it again right after each step finishes, marking that step completed and the next one in_progress, before you start the next step. Mark one step completed per call, send at most one hmm_todo call per message and never in parallel with another hmm_todo call, and never save several updates for the end. Only mark a step completed once its work is really done. Writing your final reply is not a step: do not add steps like "Summarize" or "Report". Never call hmm_todo after you start writing the final reply; leave the last step in_progress and it completes when you finish. Always send the full list and keep exactly one step in_progress while working. Write short step titles a non-technical reader understands, in the user's language. Skip it for greetings, messages like "test", and answers that need no tools.`;

export default async function plugin(bb: BbPluginApi) {
  const db = bb.storage.database();

  const readChecklist = (threadId: string): { items: TodoItem[] } => {
    const row = db.prepare("SELECT items FROM todos WHERE thread_id = ?").get(threadId) as
      | { items: string }
      | undefined;
    if (row === undefined) return { items: [] };
    const parsed = z.array(todoItemSchema).safeParse(JSON.parse(row.items));
    return { items: parsed.success ? parsed.data : [] };
  };

  const saveChecklist = (threadId: string, items: TodoItem[]): void => {
    db.prepare(
      "INSERT INTO todos (thread_id, items, updated_at) VALUES (?, ?, ?) ON CONFLICT(thread_id) DO UPDATE SET items = excluded.items, updated_at = excluded.updated_at",
    ).run(threadId, JSON.stringify(items), Date.now());
    bb.realtime.publish(TODO_CHANGED, { threadId });
  };

  bb.agents.registerTool({
    name: "hmm_todo",
    description:
      "Show the user a live checklist of the steps for the current request. Send the full list on every call.",
    instructions: INSTRUCTIONS,
    presentation: {
      label: { pending: "Updating tasks", completed: "Updated tasks" },
      suppress: true,
    },
    parameters: z.object({ items: z.array(todoItemSchema).min(1).max(20) }),
    execute({ items }, { threadId }) {
      saveChecklist(threadId, items);
      const done = items.filter((item) => item.status === "completed").length;
      return `Checklist updated: ${done}/${items.length} done.`;
    },
  });

  const removeChecklist = (threadId: string): void => {
    db.prepare("DELETE FROM todos WHERE thread_id = ?").run(threadId);
  };

  const removeOrphans = async (): Promise<void> => {
    const rows = db.prepare("SELECT thread_id FROM todos").all() as Array<{ thread_id: string }>;
    for (const { thread_id: threadId } of rows) {
      try {
        const thread = await bb.sdk.threads.get({ threadId });
        if (thread.deletedAt !== null) removeChecklist(threadId);
      } catch (error) {
        if (/not.?found/i.test(String(error))) removeChecklist(threadId);
      }
    }
  };

  bb.events.on("thread.active", ({ thread }) => {
    removeChecklist(thread.id);
    bb.realtime.publish(TODO_CHANGED, { threadId: thread.id });
  });
  bb.events.on("thread.idle", ({ thread }) => {
    const { items } = readChecklist(thread.id);
    const open = items.filter((item) => item.status !== "completed");
    if (open.length !== 1 || open[0] !== items.at(-1) || open[0].status !== "in_progress") return;
    saveChecklist(thread.id, items.map((item) => ({ ...item, status: "completed" })));
  });
  bb.events.on("thread.deleted", ({ thread }) => removeChecklist(thread.id));
  void removeOrphans().catch((error: unknown) => bb.log.warn(`todo cleanup failed: ${String(error)}`));

  bb.rpc.register(rpcContract, {
    todo_get: ({ threadId }) => readChecklist(threadId),
  });
}
