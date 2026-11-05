import type { PluginAppBuilder } from "@get-bb/plugin-sdk/app";
import { useEffect, useState, type KeyboardEvent } from "react";
import {
  definePluginApp,
  useBbNavigate,
  useComposer,
  useSidebarSplitLayout,
} from "@get-bb/plugin-sdk/app";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CompactViewportOverrideProvider } from "@/components/ui/hooks/use-compact-viewport";
import { Input } from "@/components/ui/input";

const OPEN_BROWSER_EVENT = "hmm-browser:open";
const OPEN_IN_APP_EVENT = "hmm-browser:open-in-app";

function openExternal(url: string) {
  const desktop = (window as { bbDesktop?: { openExternalUrl?: (url: string) => void } }).bbDesktop;
  if (desktop?.openExternalUrl) desktop.openExternalUrl(url);
  else window.open(url, "_blank", "noopener,noreferrer");
}

function InAppBrowserListener() {
  const navigate = useBbNavigate();
  const composer = useComposer();
  const splitLayout = useSidebarSplitLayout();
  const scopeThreadId = composer.scope.kind === "thread" ? composer.scope.threadId : null;
  const focusedThreadId = splitLayout?.panes.find((pane) => pane.isFocused)?.threadId;

  useEffect(() => {
    const onOpen = (event: Event) => {
      if (event.defaultPrevented) return;
      if (focusedThreadId !== undefined && focusedThreadId !== scopeThreadId) return;
      event.preventDefault();
      navigate.openUrl((event as CustomEvent<string>).detail);
    };
    window.addEventListener(OPEN_IN_APP_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_IN_APP_EVENT, onOpen);
  }, [navigate, focusedThreadId, scopeThreadId]);

  return null;
}

export function toBrowserUrl(input: string): string | null {
  const text = input.trim();
  if (text === "") return null;
  if (/^https?:\/\//i.test(text)) return text;
  if (!/\s/.test(text) && /^[^.]+\.[^.]/.test(text)) return `https://${text}`;
  if (/^localhost(:\d+)?(\/|$)/i.test(text)) return `http://${text}`;
  return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
}

function OpenBrowserDialog() {
  const navigate = useBbNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const onOpen = () => {
      setValue("");
      setOpen(true);
    };
    window.addEventListener(OPEN_BROWSER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_BROWSER_EVENT, onOpen);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const url = toBrowserUrl(value);
    if (url === null) return;
    setOpen(false);
    if (event.metaKey || event.ctrlKey) {
      openExternal(url);
      return;
    }
    const handled = !window.dispatchEvent(
      new CustomEvent(OPEN_IN_APP_EVENT, { detail: url, cancelable: true }),
    );
    if (!handled) navigate.openUrl(url);
  };

  return (
    <CompactViewportOverrideProvider isCompactViewport={false}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-testid="open-browser-dialog"
          hideCloseButton
          className="top-[15%] max-w-xl translate-y-0 gap-0 p-0"
        >
          <DialogTitle className="sr-only">Open browser</DialogTitle>
          <Input
            autoFocus
            aria-label="URL or search"
            placeholder="URL or search · Enter: BB browser · ⌘/Ctrl+Enter: external"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            className="h-11 border-0 shadow-none focus-visible:ring-0"
          />
        </DialogContent>
      </Dialog>
    </CompactViewportOverrideProvider>
  );
}

export function register(app: PluginAppBuilder) {
  app.composer.customize({
    id: "browser",
    scopes: ["thread"],
    actions: [{ id: "in-app-browser-listener", component: InAppBrowserListener }],
  });
  app.slots.experimental_appOverlay({
    id: "open-browser",
    component: OpenBrowserDialog,
  });
  app.commands.register({
    id: "open-browser",
    title: "Open browser",
    run: () => {
      window.dispatchEvent(new Event(OPEN_BROWSER_EVENT));
    },
  });
}

export default definePluginApp(register);
