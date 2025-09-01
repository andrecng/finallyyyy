"use client";
import React from "react";

export default function SessionGateSettings({
  use, onUse,
  preMin, onPreMin,
  postMin, onPostMin,
  ddFreezeThresh, onDdFreezeThresh,
}: {
  use:boolean; onUse:(b:boolean)=>void;
  preMin:number; onPreMin:(n:number)=>void;
  postMin:number; onPostMin:(n:number)=>void;
  ddFreezeThresh:number; onDdFreezeThresh:(n:number)=>void; // fraction du daily limit (ex 0.8)
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={use} onChange={e=>onUse(e.target.checked)} />
        <span className="font-medium">Session / News Gate</span>
      </label>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-gray-500">News pre (min)</div>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={preMin}
            onChange={(e)=>onPreMin(Number(e.target.value)||0)}
          />
        </div>
        <div>
          <div className="text-xs text-gray-500">News post (min)</div>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={postMin}
            onChange={(e)=>onPostMin(Number(e.target.value)||0)}
          />
        </div>
        <div>
          <div className="text-xs text-gray-500">Daily DD freeze ×limit</div>
          <input
            type="number"
            step="0.05"
            className="border rounded px-2 py-1 w-full"
            value={ddFreezeThresh}
            onChange={(e)=>onDdFreezeThresh(Number(e.target.value)||0)}
          />
        </div>
      </div>
      {/* (sessions & symbols pourront être ajoutés plus tard) */}
    </div>
  );
}
