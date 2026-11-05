import { definePluginApp } from "@get-bb/plugin-sdk/app";
import { register as registerBrowser } from "./features/browser/app";
import { register as registerCommands } from "./features/commands/app";
import { register as registerIncognito } from "./features/incognito/app";
import { register as registerOverview } from "./features/overview/app";
import { register as registerSidebar } from "./features/sidebar/app";
import { register as registerSuggest } from "./features/suggest/app";
import { register as registerTodo } from "./features/todo/app";

export default definePluginApp((app) => {
  registerOverview(app);
  registerBrowser(app);
  registerCommands(app);
  registerIncognito(app);
  registerSidebar(app);
  registerSuggest(app);
  registerTodo(app);
});
