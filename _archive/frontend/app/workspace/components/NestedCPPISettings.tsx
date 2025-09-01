"use client";
import React from "react";

export default function NestedCPPISettings({
  use, onUse,
  emaHalfLife, onEmaHalfLife,
  floorAlpha, onFloorAlpha,
  freezeCushionMin, onFreezeCushionMin,
}: {
  use: boolean; onUse: (b:boolean)=>void;
  emaHalfLife: number; onEmaHalfLife: (n:number)=>void;
  floorAlpha: number; onFloorAlpha: (n:number)=>void;              // décimal (0.10)
  freezeCushionMin: number; onFreezeCushionMin: (n:number)=>void;  // décimal (0.05)
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={use} onChange={e=>onUse(e.target.checked)} />
        <span className="font-medium">NestedCPPI</span>
      </label>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-gray-500">EMA halflife</div>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={emaHalfLife}
            onChange={(e)=>onEmaHalfLife(Number(e.target.value)||0)}
          />
        </div>
        <div>
          <div className="text-xs text-gray-500">Floor α</div>
          <input
            type="number"
            step="0.01"
            className="border rounded px-2 py-1 w-full"
            value={floorAlpha}
            onChange={(e)=>onFloorAlpha(Number(e.target.value)||0)}
          />
        </div>
        <div>
          <div className="text-xs text-gray-500">Freeze cushion</div>
          <input
            type="number"
            step="0.01"
            className="border rounded px-2 py-1 w-full"
            value={freezeCushionMin}
            onChange={(e)=>onFreezeCushionMin(Number(e.target.value)||0)}
          />
        </div>
      </div>
    </div>
  );
}
