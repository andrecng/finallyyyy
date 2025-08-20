export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

export async function runSimulation(payload: any) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/simulate`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });
  } catch (e:any) {
    throw new Error(`Network error: ${e?.message || "Failed to fetch"}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(()=> "");
    throw new Error(`Backend ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}
