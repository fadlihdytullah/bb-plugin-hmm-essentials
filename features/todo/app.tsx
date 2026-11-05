import { useCallback, useEffect, useState } from "react";
import { definePluginApp, useComposer, useRealtime, useRpc } from "@get-bb/plugin-sdk/app";
import type { PluginAppBuilder } from "@get-bb/plugin-sdk/app";
import { CircleCheck, CircleDashed, LoaderCircle } from "lucide-react";
import { rpcContract, TODO_CHANGED, type TodoItem } from "./contract";

const STATUS_LABEL: Record<TodoItem["status"], string> = {
  completed: "Done",
  in_progress: "In progress",
  pending: "Not started",
};

function StatusIcon({ status }: { status: TodoItem["status"] }) {
  if (status === "completed") return <CircleCheck className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
  if (status === "in_progress") {
    return <LoaderCircle className="size-4 shrink-0 animate-spin text-foreground motion-reduce:animate-none" aria-hidden />;
  }
  return <CircleDashed className="size-4 shrink-0 text-muted-foreground" aria-hidden />;
}

function TodoBanner() {
  const composer = useComposer();
  const rpc = useRpc<typeof rpcContract>();
  const threadId = composer.scope.kind === "thread" ? composer.scope.threadId : null;
  const [items, setItems] = useState<readonly TodoItem[]>([]);

  const load = useCallback(() => {
    if (threadId === null) {
      setItems([]);
      return;
    }
    void rpc.call("todo_get", { threadId }).then(
      (result) => setItems(result.items),
      () => undefined,
    );
  }, [rpc, threadId]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtime(TODO_CHANGED, (payload) => {
    if ((payload as { threadId?: unknown } | null)?.threadId === threadId) load();
  });

  if (items.length === 0) return null;
  const finished = items.every((item) => item.status === "completed");
  if (!finished && !composer.isRunning) return null;

  if (finished && !composer.isRunning) {
    return (
      <p data-hmm="todo" className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
        <CircleCheck className="size-4 shrink-0" aria-hidden />
        All {items.length} tasks done
      </p>
    );
  }

  return (
    <ul data-hmm="todo" aria-label="Tasks" className="flex flex-col gap-2 px-3 py-2.5">
      {items.map((item, index) => (
        <li key={`${index}-${item.title}`} className="flex items-center gap-2 text-sm">
          <StatusIcon status={item.status} />
          <span className="sr-only">{STATUS_LABEL[item.status]}: </span>
          <span
            className={
              item.status === "completed"
                ? "min-w-0 truncate text-muted-foreground line-through"
                : item.status === "in_progress"
                  ? "min-w-0 truncate font-medium text-foreground"
                  : "min-w-0 truncate text-foreground"
            }
          >
            {item.title}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function register(app: PluginAppBuilder) {
  app.composer.customize({
    id: "todo",
    scopes: ["thread"],
    banners: [{ id: "todo", component: TodoBanner }],
  });
}

export default definePluginApp(register);
