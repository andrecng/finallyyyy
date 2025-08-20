// Composant de graphique personnalisé inspiré du style TradingView
// - Codé entièrement par nous, pas de dépendance externe
// - Style professionnel et moderne avec axes
// - Contrôles de zoom et pan personnalisés

import { useEffect, useRef, useState, useCallback } from "react";

type SeriePoint = { time: number; value: number };
type Props = {
  data: SeriePoint[];
  height?: number;
  label?: string;
  color?: string;
  showAxes?: boolean;
};

export default function CustomChart({ 
  data, 
  height = 260, 
  label, 
  color = "#7c8cff",
  showAxes = true
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [viewPort, setViewPort] = useState({
    offsetX: 0,
    scaleX: 1,
    minY: 0,
    maxY: 1
  });

  // Calcul des bornes Y avec padding intelligent
  const calculateYBounds = useCallback((data: SeriePoint[]) => {
    if (!data.length) return { min: 0, max: 1 };
    const values = data.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * 0.15; // Padding plus généreux
    return { min: min - padding, max: max + padding };
  }, []);

  // Conversion coordonnées avec marges pour axes
  const dataToScreen = useCallback((point: SeriePoint) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const marginLeft = showAxes ? 60 : 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = showAxes ? 40 : 20;
    
    const chartWidth = canvas.width - marginLeft - marginRight;
    const chartHeight = canvas.height - marginTop - marginBottom;
    
    const x = marginLeft + ((point.time - viewPort.offsetX) * viewPort.scaleX);
    const y = marginTop + (chartHeight - ((point.value - viewPort.minY) / (viewPort.maxY - viewPort.minY)) * chartHeight);
    
    return { x, y };
  }, [viewPort, showAxes]);

  // Formatage des valeurs pour les axes
  const formatValue = useCallback((value: number) => {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(value) >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    } else if (Math.abs(value) < 0.01) {
      return value.toFixed(4);
    } else {
      return value.toFixed(2);
    }
  }, []);

  // Rendu du graphique amélioré
  const renderChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const marginLeft = showAxes ? 60 : 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = showAxes ? 40 : 20;
    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background avec dégradé subtil
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0f1020");
    gradient.addColorStop(1, "#0b0c1e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Grille améliorée
    ctx.strokeStyle = "rgba(197,203,206,0.08)";
    ctx.lineWidth = 1;
    
    // Lignes verticales
    for (let i = 0; i <= 8; i++) {
      const x = marginLeft + (chartWidth / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + chartHeight);
      ctx.stroke();
    }
    
    // Lignes horizontales
    for (let i = 0; i <= 6; i++) {
      const y = marginTop + (chartHeight / 6) * i;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + chartWidth, y);
      ctx.stroke();
    }

    // Axes si activés
    if (showAxes) {
      // Axe Y (ordonnées)
      ctx.strokeStyle = "rgba(197,203,206,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(marginLeft, marginTop);
      ctx.lineTo(marginLeft, marginTop + chartHeight);
      ctx.stroke();

      // Axe X (abscisses)
      ctx.beginPath();
      ctx.moveTo(marginLeft, marginTop + chartHeight);
      ctx.lineTo(marginLeft + chartWidth, marginTop + chartHeight);
      ctx.stroke();

      // Labels axe Y
      ctx.fillStyle = "rgba(197,203,206,0.7)";
      ctx.font = "11px 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      
      for (let i = 0; i <= 6; i++) {
        const y = marginTop + (chartHeight / 6) * i;
        const value = viewPort.maxY - (i / 6) * (viewPort.maxY - viewPort.minY);
        const label = formatValue(value);
        ctx.fillText(label, marginLeft - 8, y);
      }

      // Labels axe X
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      
      for (let i = 0; i <= 8; i++) {
        const x = marginLeft + (chartWidth / 8) * i;
        const timeIndex = Math.floor((i / 8) * data.length);
        if (timeIndex < data.length) {
          const label = timeIndex.toString();
          ctx.fillText(label, x, marginTop + chartHeight + 8);
        }
      }
    }

    // Ligne de données avec ombre
    if (data.length > 1) {
      // Ombre de la ligne
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.beginPath();
      const firstPoint = dataToScreen(data[0]);
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < data.length; i++) {
        const point = dataToScreen(data[i]);
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // Points de données avec effet de lueur
    ctx.fillStyle = color;
    data.forEach((point, index) => {
      const screenPoint = dataToScreen(point);
      
      // Lueur externe
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(screenPoint.x, screenPoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Point central
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(screenPoint.x, screenPoint.y, 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // Reset color
      ctx.fillStyle = color;
    });

    // Indicateur de performance en haut à droite
    if (data.length > 1) {
      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      const change = lastValue - firstValue;
      const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
      
      const isPositive = change >= 0;
      const indicatorColor = isPositive ? "#00c878" : "#ff6384";
      
      ctx.fillStyle = "rgba(11,12,30,0.9)";
      ctx.fillRect(width - 120, 8, 112, 32);
      
      ctx.strokeStyle = indicatorColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(width - 120, 8, 112, 32);
      
      ctx.fillStyle = indicatorColor;
      ctx.font = "bold 12px 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${isPositive ? '+' : ''}${formatValue(change)}`, width - 64, 20);
      ctx.fillText(`${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`, width - 64, 36);
    }
  }, [data, viewPort, dataToScreen, color, showAxes, formatValue]);

  // Gestion des événements améliorée
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    
    setViewPort(prev => ({
      ...prev,
      offsetX: prev.offsetX - deltaX / prev.scaleX
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    
    setViewPort(prev => ({
      ...prev,
      scaleX: Math.max(0.1, Math.min(10, prev.scaleX * zoomFactor))
    }));
  }, []);

  // Initialisation et mise à jour
  useEffect(() => {
    if (data.length) {
      const bounds = calculateYBounds(data);
      setViewPort(prev => ({
        ...prev,
        minY: bounds.min,
        maxY: bounds.max,
        offsetX: 0,
        scaleX: 1
      }));
    }
  }, [data, calculateYBounds]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Gestion du redimensionnement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      
      renderChart();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [renderChart]);

  return (
    <div>
      {label && (
        <div style={{ 
          fontSize: 13, 
          fontWeight: 600,
          opacity: 0.9, 
          marginBottom: 8,
          color: "#eaeaff",
          letterSpacing: "0.5px"
        }}>
          {label}
        </div>
      )}
      <div style={{ 
        position: "relative",
        border: "1px solid rgba(118, 105, 255, 0.2)",
        borderRadius: 12,
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(15,16,32,0.8), rgba(11,12,30,0.9))",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}>
        <canvas
          ref={canvasRef}
          style={{ 
            width: "100%", 
            height,
            cursor: isDragging ? "grabbing" : "grab"
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        <div style={{
          position: "absolute",
          top: 8,
          left: 8,
          fontSize: 10,
          color: "rgba(197,203,206,0.6)",
          background: "rgba(11,12,30,0.8)",
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid rgba(197,203,206,0.2)"
        }}>
          {data.length} points
        </div>
      </div>
    </div>
  );
}
