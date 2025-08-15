// 📄 @fichier: components/RiskChart.tsx

"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useSimStore } from "@/stores/simStore";
import { useEffect, useState } from "react";

export function RiskChart() {
  const { equitySeries } = useSimStore();
  const [data, setData] = useState<{ day: number; value: number }[]>([]);

  useEffect(() => {
    if (!equitySeries || equitySeries.length === 0) return;
    setData(equitySeries.map((v, i) => ({ day: i + 1, value: v })));
  }, [equitySeries]);

  if (!data.length) return null;

  return (
    <div className="w-full max-w-2xl mt-6 p-4 bg-gray-800 rounded-xl">
      <h2 className="text-lg font-semibold mb-2">📈 Courbe d'Équity</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="day" tick={{ fill: "#ccc" }} />
          <YAxis tick={{ fill: "#ccc" }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#00bcd4" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
