function convertTimeToMilliseconds(input) {
  const ar = input.match(/[a-zA-Z]+|[0-9]+/g);
  if (!ar || ar.length < 2) {
    return void 0;
  }
  if (ar[1] === "s" || ar[1] === "seconds") {
    return +ar[0] * 1e3;
  }
  if (ar[1] === "min" || ar[1] === "minutes" || ar[1] === "mins") {
    return +ar[0] * 6e4;
  }
  if (ar[1] === "h" || ar[1] === "hour" || ar[1] === "hours") {
    return +ar[0] * 36e5;
  }
  if (ar[1] === "d" || ar[1] === "day" || ar[1] === "days") {
    return +ar[0] * 864e5;
  }
  if (ar[1] === "w" || ar[1] === "week" || ar[1] === "weeks") {
    return +ar[0] * 6048e5;
  }
  if (ar[1] === "m" || ar[1] === "month" || ar[1] === "months") {
    return +ar[0] * 2628e6;
  }
  return void 0;
}
export {
  convertTimeToMilliseconds
};
