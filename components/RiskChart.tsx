import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { createChart, ColorType, LineStyle, TickMarkType } from "lightweight-charts";

type SeriePoint = { time: any; value: number }; // time = index virtuel mappé (voir page)
type Props = {
  data: SeriePoint[];
  height?: number;
  label?: string;
  priceFormat?: "default" | "percent";
  showIndexLabels?: boolean; // <-- NEW : t0, t1, ...
};

export type RiskChartHandle = { resetZoom: () => void };

const RiskChart = forwardRef<RiskChartHandle, Props>(function RiskChart(
  { data, height = 260, label, priceFormat = "default", showIndexLabels = true },
  ref
) {
  const el = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<any>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const didFrame = useRef(false); // évite les re-fit intempestifs

  useEffect(() => {
    if (!el.current) return;

    const chart = createChart(el.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#0b0c1e" },
        textColor: "#eaeaff",
        attributionLogo: false,
      },
      rightPriceScale: { borderColor: "rgba(197,203,206,0.2)" },
      timeScale: {
        borderColor: "rgba(197,203,206,0.2)",
        // 🔒 anti-drift complet
        shiftVisibleRangeOnNewBar: false,
        allowShiftVisibleRangeOnWhitespaceReplacement: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightOffset: 0,
        timeVisible: false,   // on n'affiche pas l'heure
        secondsVisible: false,
        ticksVisible: showIndexLabels, // on garde des ticks seulement si on affiche tN
        // ⬇️ Formatter pour afficher t0, t1, t2… à la place des dates
        tickMarkFormatter: showIndexLabels
          ? ((time: any, _type: TickMarkType, _locale: string) => {
              // time est maintenant un index numérique direct
              const i = Math.floor(time as number);
              return `t${i}`;
            })
          : undefined,
        visible: true, // ← passe à false si tu veux l'Option A (aucun axe)
      },
      grid: {
        horzLines: { color: "rgba(197,203,206,0.1)", style: LineStyle.Solid },
        vertLines: { color: "rgba(197,203,206,0.1)", style: LineStyle.Solid },
      },
      crosshair: { mode: 1 },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      kineticScroll: { mouse: true, touch: true },
    });

    const series = chart.addLineSeries({
      priceFormat: priceFormat === "percent"
        ? { type: "percent" }
        : { type: "price", precision: 2, minMove: 0.01 },
      lastValueVisible: true,
      priceLineVisible: true,
      color: "#7c8cff",
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    roRef.current = new ResizeObserver(() => {
      if (!el.current || !chartRef.current) return;
      chartRef.current.applyOptions({ width: el.current.clientWidth });
    });
    roRef.current.observe(el.current);

    return () => {
      roRef.current?.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      didFrame.current = false;
    };
  }, [height, priceFormat, showIndexLabels]);

  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    if (data && data.length > 0) {
      seriesRef.current.setData(data);
      if (!didFrame.current) {
        // cadrage initial UNE fois (pas de fitContent en boucle)
        chartRef.current.timeScale().setVisibleLogicalRange({ from: 0, to: Math.max(0, data.length - 1) });
        didFrame.current = true;
      }
    } else {
      seriesRef.current.setData([]);
      didFrame.current = false;
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    resetZoom: () => {
      if (!chartRef.current) return;
      chartRef.current.timeScale().resetTimeScale();
      chartRef.current.timeScale().setVisibleLogicalRange({ from: 0, to: Math.max(0, (data?.length || 1) - 1) });
    },
  }));

  return (
    <div>
      {label ? <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{label}</div> : null}
      <div ref={el} style={{ width: "100%", height }} />
    </div>
  );
});

export default RiskChart;
