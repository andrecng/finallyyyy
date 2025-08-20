"use client";
import React from "react";
import Kpi from "@/components/ui/Kpi";
import { KPI_SUBS } from "@/lib/kpiDict";

export default function ResultsPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi label="CAGR" value="—" subtitle={KPI_SUBS["CAGR"]} />
      <Kpi label="Max DD" value="—" subtitle={KPI_SUBS["Max DD"]} />
      <Kpi label="Sortino" value="—" subtitle={KPI_SUBS["Sortino"]} />
      <Kpi label="Omega" value="—" subtitle={KPI_SUBS["Omega"]} />
      <Kpi label="Pass% FTMO" value="—" subtitle={KPI_SUBS["Pass% FTMO"]} />
      <Kpi label="Jours-cible" value="—" subtitle={KPI_SUBS["Jours-cible"]} />
      <Kpi label="Daily Violations" value="—" subtitle={KPI_SUBS["Daily Violations"]} />
      <Kpi label="Binder% (modules)" value="—" subtitle={KPI_SUBS["Binder% (modules)"]} />
    </div>
  );
}
