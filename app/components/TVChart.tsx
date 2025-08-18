"use client";
import { useEffect, useRef } from "react";
import { createChart, IChartApi, ColorType, Time } from "lightweight-charts";

type Point = { time: Time; value: number };
type Props = {
  data: Point[];
  height?: number;
  title?: string;
};

export default function TVChart({ data, height = 320, title }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // init chart
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' }, // slate-900-ish
        textColor: '#e5e7eb',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,   // pan with wheel + SHIFT
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,   // zoom wheel
        pinch: true,        // pinch zoom
      },
    });

    // API v4: addLineSeries fonctionne
    const line = chart.addLineSeries({
      color: '#60a5fa',
      lineWidth: 2,
    });
    
    // Garder une référence à la série
    seriesRef.current = line;
    line.setData(data);

    // autoresize
    const observer = new ResizeObserver(() => {
      if (!containerRef.current) return;
      chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    observer.observe(containerRef.current);

    chartRef.current = chart;
    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    // Utiliser la référence directe à la série
    if (seriesRef.current && data.length > 0) {
      seriesRef.current.setData(data);
    }
  }, [data]);

  return (
    <div className="w-full">
      {title ? <div className="text-sm mb-2 opacity-80">{title}</div> : null}
      <div ref={containerRef} className="w-full rounded-2xl border border-white/10 bg-white/[0.05]" style={{ height }} />
      <div className="text-xs mt-2 opacity-60">
        Astuces: molette = zoom, SHIFT+molette = pan, click+drag = scroll, pinch = zoom tactile
      </div>
    </div>
  );
}
