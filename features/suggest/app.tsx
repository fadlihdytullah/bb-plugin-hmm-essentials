import type { PluginAppBuilder } from "@get-bb/plugin-sdk/app";
import { useState } from "react";
import { definePluginApp, useComposer, useRpc } from "@get-bb/plugin-sdk/app";
import type { PluginMessageDirectiveProps } from "@get-bb/plugin-sdk/app";
import type { rpcContract } from "./server";

const KEYS = ["a", "b", "c", "d"];
const PROMPTBOX = "form[data-promptbox]";

function Suggestions({ attributes, message }: PluginMessageDirectiveProps) {
  const rpc = useRpc<typeof rpcContract>();
  const composer = useComposer();
  const [sent, setSent] = useState<string | null>(null);
  const replies = KEYS.map((key) => attributes[key]?.trim().slice(0, 500)).filter(
    (text): text is string => Boolean(text),
  );
  if (replies.length === 0) return null;

  const send = async (text: string) => {
    if (sent) return;
    setSent(text);
    try {
      await rpc.call("send", { threadId: message.threadId, text });
    } catch {
      setSent(null);
    }
  };

  const startDrag = (text: string) => {
    const inPromptbox = (event: DragEvent) =>
      event.target instanceof Element && event.target.closest(PROMPTBOX) !== null;
    const over = (event: DragEvent) => {
      if (!inPromptbox(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    const drop = (event: DragEvent) => {
      if (!inPromptbox(event)) return;
      event.preventDefault();
      event.stopPropagation();
      composer.replace((draft) => ({ ...draft, text: draft.text.trim() ? `${draft.text} ${text}` : text }));
      composer.focus();
    };
    const end = () => {
      document.removeEventListener("dragover", over, true);
      document.removeEventListener("drop", drop, true);
      document.removeEventListener("dragend", end, true);
    };
    document.addEventListener("dragover", over, true);
    document.addEventListener("drop", drop, true);
    document.addEventListener("dragend", end, true);
  };

  return (
    <div data-hmm="suggest">
    <div className="my-2 flex w-fit max-w-full flex-col" style={{ gap: 8, marginTop: 16 }}>
      <span className="px-1 text-xs font-medium text-muted-foreground" style={{ lineHeight: 1, margin: 0 }}>Suggested replies</span>
      <div className="flex flex-wrap rounded-[28px] border border-border bg-card shadow-sm" style={{ margin: 0, padding: 10, gap: 10 }}>
      {replies.map((text) => (
        <button
          key={text}
          type="button"
          disabled={sent !== null}
          draggable={sent === null}
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", text);
            event.dataTransfer.effectAllowed = "copy";
            startDrag(text);
          }}
          onClick={() => void send(text)}
          className={`min-h-9 cursor-grab rounded-full border border-border px-3 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent disabled:cursor-default ${
            sent === text ? "bg-accent" : "bg-card disabled:opacity-50"
          }`}
        >
          {text}
        </button>
      ))}
      </div>
    </div>
    </div>
  );
}

export function register(app: PluginAppBuilder) {
  app.slots.messageDirective({ id: "suggest", component: Suggestions });
}

export default definePluginApp(register);
