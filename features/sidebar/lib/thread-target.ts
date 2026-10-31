import type {
  PluginSidebarThread,
  PluginThreadActionTarget,
} from "@get-bb/plugin-sdk/app";

export function toThreadActionTarget(
  thread: PluginSidebarThread,
): PluginThreadActionTarget {
  const environment = thread.environment;
  return {
    id: thread.id,
    projectId: thread.projectId,
    parentThreadId: thread.parentThreadId,
    parentNotifications: thread.parentNotifications,
    archivedAt: thread.archivedAt,
    pinnedAt: thread.pinnedAt,
    sectionId: thread.sectionId,
    isUnread: thread.isUnread,
    status: thread.status,
    environment:
      environment !== null && environment.id !== null
        ? { id: environment.id, path: environment.path }
        : null,
  };
}
