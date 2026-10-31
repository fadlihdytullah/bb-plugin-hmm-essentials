import type { PluginAppBuilder } from "@get-bb/plugin-sdk/app";
import { Command, EyeOff, Folder, MessageSquareReply } from "lucide-react";

const FEATURES = [
  {
    icon: Folder,
    name: "Collections",
    summary: "Group projects and keep threads that need you in view.",
    location: "Sidebar",
  },
  {
    icon: Command,
    name: "Commands",
    summary: "Save prompts you reuse and add them to any chat.",
    location: "Composer",
  },
  {
    icon: MessageSquareReply,
    name: "Suggested replies",
    summary: "Tap a suggestion to reply without typing.",
    location: "Agent responses",
  },
  {
    icon: EyeOff,
    name: "Incognito chats",
    summary: "Start a hidden chat that's deleted when you close it.",
    location: "Composer",
  },
];

function WhatsInside() {
  return (
    <ul data-hmm="overview" className="divide-y divide-border rounded-xl border border-border bg-card">
      {FEATURES.map((feature) => (
        <li key={feature.name} className="flex items-center gap-3 px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <feature.icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{feature.name}</p>
            <p className="text-xs text-muted-foreground">{feature.summary}</p>
          </div>
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{feature.location}</span>
        </li>
      ))}
    </ul>
  );
}

export function register(app: PluginAppBuilder) {
  app.slots.settingsSection({
    id: "whats-inside",
    title: "What's inside",
    description: "Four everyday tools, on as soon as the plugin is.",
    component: WhatsInside,
  });
}
