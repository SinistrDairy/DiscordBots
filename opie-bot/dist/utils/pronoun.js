const pronounMap = {
  "940349186661036043": { subject: "she", object: "her" },
  // she/her
  "940349234916503683": { subject: "he", object: "him" },
  // he/him
  "940349439267180586": { subject: "they", object: "them" }
  // they/them
};
function getPronoun(proID, opts) {
  const entry = proID && pronounMap[proID];
  let p = entry ? entry[opts.case] : opts.case === "subject" ? "they" : "them";
  if (opts.capitalize)
    p = p[0].toUpperCase() + p.slice(1);
  return p;
}
export {
  getPronoun,
  pronounMap
};
