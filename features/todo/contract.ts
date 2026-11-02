import { defineRpcContract } from "@get-bb/plugin-sdk";
import { z } from "zod";

export const todoItemSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    status: z.enum(["pending", "in_progress", "completed"]),
  })
  .strict();

export type TodoItem = z.infer<typeof todoItemSchema>;

export const TODO_CHANGED = "todo-changed";

export const rpcContract = defineRpcContract({
  todo_get: {
    input: z.object({ threadId: z.string().trim().min(1).max(200) }).strict(),
    output: z.object({ items: z.array(todoItemSchema), updatedAt: z.number().int().nonnegative() }).strict(),
  },
});
