export function validatePayload(p: any) {
  const warns: string[] = [];
  
  const dec = (x: any) => typeof x === "number" && x <= 1 && x >= 0;
  
  if (!dec(p.daily_limit)) warns.push("daily_limit doit être décimal (ex: 0.05)");
  if (!dec(p.total_limit)) warns.push("total_limit doit être décimal (ex: 0.10)");
  if (!dec(p.target_profit)) warns.push("target_profit doit être décimal (ex: 0.10)");
  
  return warns;
}
