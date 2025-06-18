function convertTimeToMilliseconds(input) {
  const parts = input.match(/[a-zA-Z]+|[0-9]+/g);
  if (!parts || parts.length < 2)
    return void 0;
  const [numStr, unit] = parts;
  const n = Number(numStr);
  if (Number.isNaN(n))
    return void 0;
  switch (unit.toLowerCase()) {
    case "s":
    case "sec":
    case "seconds":
      return n * 1e3;
    case "min":
    case "mins":
    case "minutes":
      return n * 6e4;
    case "h":
    case "hr":
    case "hrs":
    case "hour":
    case "hours":
      return n * 36e5;
    case "d":
    case "day":
    case "days":
      return n * 864e5;
    case "w":
    case "wk":
    case "week":
    case "weeks":
      return n * 6048e5;
    case "m":
    case "mnth":
    case "month":
    case "months":
      return n * 26298e5;
    default:
      return void 0;
  }
}
export {
  convertTimeToMilliseconds
};
