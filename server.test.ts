import { describe, expect, it } from "vitest";
import { createFakePluginHost } from "@get-bb/plugin-sdk/testing";
import plugin from "./server";

describe("hmm-essentials server", () => {
  it("loads every feature on one database", async () => {
    const host = createFakePluginHost({ pluginId: "hmm-essentials" });
    await plugin(host.bb);
    const tables = host.bb.storage
      .database()
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as { name: string }[];
    expect(tables.map((table) => table.name)).toEqual(
      expect.arrayContaining(["commands", "collections", "collection_projects"]),
    );
  });
});
