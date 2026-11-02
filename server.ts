import type { BbPluginApi } from "@get-bb/plugin-sdk";
import commands from "./features/commands/server";
import incognito from "./features/incognito/server";
import sidebar from "./features/sidebar/server";
import suggest from "./features/suggest/server";
import todo from "./features/todo/server";
import { migrations } from "./migrations";

export default async function plugin(bb: BbPluginApi) {
  bb.storage.migrate(bb.storage.database(), migrations);
  await commands(bb);
  await incognito(bb);
  await sidebar(bb);
  await suggest(bb);
  await todo(bb);
}
