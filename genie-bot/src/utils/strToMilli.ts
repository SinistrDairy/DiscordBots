// src/utils/convertTimeToMilliseconds.ts
export function convertTimeToMilliseconds(input: string): number | undefined {
  const parts = input.match(/[a-zA-Z]+|[0-9]+/g);
  if (!parts || parts.length < 2) return undefined;

  const [numStr, unit] = parts;
  const n = Number(numStr);
  if (Number.isNaN(n)) return undefined;

  switch (unit.toLowerCase()) {
    case "s":
    case "sec":
    case "seconds":
      return n * 1_000;
    case "min":
    case "mins":
    case "minutes":
      return n * 60_000;
    case "h":
    case "hr":
    case "hrs":
    case "hour":
    case "hours":
      return n * 3_600_000;
    case "d":
    case "day":
    case "days":
      return n * 86_400_000;
    case "w":
    case "wk":
    case "week":
    case "weeks":
      return n * 604_800_000;
    case "m":
    case "mnth":
    case "month":
    case "months":
      return n * 2_629_800_000;
    default:
      return undefined;
  }
}
