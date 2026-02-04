// src/utils/time/tsET.ts
export function tsET() {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  )

  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const YYYY = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}`;
}