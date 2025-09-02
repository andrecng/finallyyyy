export default function Sparkline({ data, height=80 }: { data: number[]; height?: number }) {
  if (!data || data.length < 2) return null;
  const w = 600;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const y = (v:number)=> {
    if (max === min) return height/2;
    return height - ( (v - min) / (max - min) ) * height;
  };
  const x = (i:number)=> (i/(data.length-1))*w;
  const d = data.map((v,i)=> `${i===0?"M":"L"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-[80px]">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
