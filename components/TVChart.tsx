// Explication :
// - Graphe stable, pas de scroll auto en temps réel
// - Zoom molette et pan au drag uniquement
// - Pas de logo externe ni d'iframe

import { useEffect, useRef } from "react";
import { createChart, ColorType, LineStyle } from "lightweight-charts";

type SeriePoint = { time: number; value: number };
type Props = {
  data: SeriePoint[];
  height?: number;
  label?: string;
  priceFormat?: "default" | "percent";
};

export default function TVChart({ data, height = 260, label, priceFormat = "default" }: Props) {
  const el = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!el.current) return;

    const chart = createChart(el.current, {
      height,
      layout: { background: { type: ColorType.Solid, color: "#0b0c1e" }, textColor: "#eaeaff" },
      rightPriceScale: { borderColor: "rgba(197,203,206,0.2)" },
      timeScale: {
        borderColor: "rgba(197,203,206,0.2)",
        // désactive scroll auto
        shiftVisibleRangeOnNewBar: false,
      },
      grid: {
        horzLines: { color: "rgba(197,203,206,0.1)", style: LineStyle.Solid },
        vertLines: { color: "rgba(197,203,206,0.1)", style: LineStyle.Solid },
      },
      crosshair: { mode: 1 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    const series = chart.addLineSeries({
      priceFormat: priceFormat === "percent" ? { type: "percent" } : { type: "price", precision: 2 },
      color: "#7c8cff",
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => chart.applyOptions({ width: el.current!.clientWidth }));
    ro.observe(el.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [height, priceFormat]);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;
    seriesRef.current.setData(data?.length ? data : [{ time: 0, value: 0 }]);
    chartRef.current.timeScale().fitContent(); // ajuste une seule fois
  }, [data]);

  return (
    <div>
      {label ? <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{label}</div> : null}
      <div ref={el} style={{ width: "100%", height }} />
    </div>
  );
}
