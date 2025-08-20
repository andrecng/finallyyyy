import { useEffect, useRef } from "react";
// import { createChart } from "lightweight-charts"; // si tu l'utilises

export default function ChartPane({ id = "risk-chart" }: { id?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!wrapRef.current || didInit.current) return;
    didInit.current = true;

    // const chart = createChart(wrapRef.current, { width: 600, height: 420, ... });
    // chartRef.current = chart;

    // 🔒 Empêche les auto-fit qui bougent les bords
    // chart.applyOptions({
    //   timeScale: {
    //     fixLeftEdge: true,
    //     fixRightEdge: true,
    //     shiftVisibleRangeOnNewBar: false,
    //     allowShiftVisibleRangeOnWhitespaceReplacement: false,
    //     lockVisibleTimeRangeOnResize: true,
    //     rightOffset: 0,
    //     leftOffset: 0,
    //   },
    // });

    // 🧭 ResizeObserver = on ajuste la taille au conteneur, pas l'inverse
    const ro = new ResizeObserver(() => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (chartRef.current?.resize) {
        chartRef.current.resize(w, h);
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="chartParent">
      <div ref={wrapRef} className="chartPane" id={id} />
    </div>
  );
}
