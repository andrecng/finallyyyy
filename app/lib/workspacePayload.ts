const KEY = "mm_workspace_payload_v1";

export function setWorkspacePayload(payload: Record<string, any>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function getWorkspacePayload(): Record<string, any> | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}
