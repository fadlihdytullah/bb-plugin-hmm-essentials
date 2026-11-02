import type { BbPluginApi } from "@get-bb/plugin-sdk";
import commands from "./features/commands/server";
import incognito from "./features/incognito/server";
import sidebar from "./features/sidebar/server";
import suggest, { SUGGEST_INSTRUCTIONS } from "./features/suggest/server";
import { migrations } from "./migrations";

const TODO_INSTRUCTIONS = `Task tracking: before starting any request that needs work (running tools, reading or editing files), create a todo list with your built-in todo or plan tool (TodoWrite, or TaskCreate and TaskUpdate, or update_plan), even for a single step. Write short step titles a non-technical reader understands, in the user's language, and keep statuses updated as you work. Do not create a todo list for greetings, messages like "test", or conversation you can answer without tools.`;

export default async function plugin(bb: BbPluginApi) {
  bb.storage.migrate(bb.storage.database(), migrations);
  bb.agents.contributeInstructions(() => `${TODO_INSTRUCTIONS}\n\n${SUGGEST_INSTRUCTIONS}`);
  await commands(bb);
  await incognito(bb);
  await sidebar(bb);
  await suggest(bb);
}
