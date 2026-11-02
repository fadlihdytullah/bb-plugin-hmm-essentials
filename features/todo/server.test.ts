import { afterEach, describe, expect, it } from "vitest";
import { createFakePluginHost } from "@get-bb/plugin-sdk/testing";
import plugin from "../../server";

const hosts: Array<ReturnType<typeof createFakePluginHost>> = [];

afterEach(async () => {
  await Promise.all(hosts.splice(0).map((host) => host.harness.lifecycle.dispose()));
});

describe("hmm_todo", () => {
  it("stores the latest checklist per thread", async () => {
    const host = createFakePluginHost({ pluginId: "hmm-essentials" });
    hosts.push(host);
    await plugin(host.bb);
    const tool = host.harness.registrations.agentTools.find((entry) => entry.name === "hmm_todo")!;
    const context = { threadId: "thread-1", projectId: "project-1", signal: new AbortController().signal };

    await tool.execute(
      { items: [{ title: "Read files", status: "in_progress" }, { title: "Summarize", status: "pending" }] },
      context as never,
    );
    expect(
      await tool.execute({ items: [{ title: "Read files", status: "completed" }] }, context as never),
    ).toBe("Checklist updated: 1/1 done.");

    await expect(host.harness.callRpc("todo_get", { threadId: "thread-1" })).resolves.toMatchObject({
      items: [{ title: "Read files", status: "completed" }],
    });
    await expect(host.harness.callRpc("todo_get", { threadId: "thread-2" })).resolves.toEqual({
      items: [],
      updatedAt: 0,
    });
  });
});
