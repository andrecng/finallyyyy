import React from "react";
import WorkspaceClient from "@/components/workspace/WorkspaceClient";

export const metadata = {
  title: "Workspace — Fond & FTMO",
  description: "Interface unifiée pour la simulation et la gestion de risque",
};

export default async function WorkspacePage() {
  // (Server-side: lecture presets, etc. — si besoin plus tard)
  return <WorkspaceClient />;
}
