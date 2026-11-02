import type { BbPluginApi } from "@get-bb/plugin-sdk";
import { z } from "zod";
import { rpcContract, TODO_CHANGED, todoItemSchema, type TodoItem } from "./contract";

const INSTRUCTIONS = `Track multi-step work with hmm_todo instead of any built-in todo or plan tool (TodoWrite, TaskCreate, update_plan). Call it before starting a request that needs tools. Call it again right after each step finishes, marking that step completed and the next one in_progress, before you start the next step; never save all updates for the end. Always send the full list and keep exactly one step in_progress while working. Write short step titles a non-technical reader understands, in the user's language. Skip it for greetings, messages like "test", and answers that need no tools.`;

export default async function plugin(bb: BbPluginApi) {
  const db = bb.storage.database();

  const readChecklist = (threadId: string): { items: TodoItem[]; updatedAt: number } => {
    const row = db.prepare("SELECT items, updated_at FROM todos WHERE thread_id = ?").get(threadId) as
      | { items: string; updated_at: number }
      | undefined;
    if (row === undefined) return { items: [], updatedAt: 0 };
    const parsed = z.array(todoItemSchema).safeParse(JSON.parse(row.items));
    return { items: parsed.success ? parsed.data : [], updatedAt: row.updated_at };
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
      db.prepare(
        "INSERT INTO todos (thread_id, items, updated_at) VALUES (?, ?, ?) ON CONFLICT(thread_id) DO UPDATE SET items = excluded.items, updated_at = excluded.updated_at",
      ).run(threadId, JSON.stringify(items), Date.now());
      bb.realtime.publish(TODO_CHANGED, { threadId });
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

  bb.events.on("thread.deleted", ({ thread }) => removeChecklist(thread.id));
  void removeOrphans().catch((error: unknown) => bb.log.warn(`todo cleanup failed: ${String(error)}`));

  bb.rpc.register(rpcContract, {
    todo_get: ({ threadId }) => readChecklist(threadId),
  });
}
