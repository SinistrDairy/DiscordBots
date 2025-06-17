// src/utils/pronouns.ts
export const pronounMap: Record<string, { subject: string; object: string }> = {
  "940349186661036043": { subject: "she",  object: "her"  },  // she/her
  "940349234916503683": { subject: "he",   object: "him"  },  // he/him
  "940349439267180586": { subject: "they", object: "them" },  // they/them
};

/**
 * Returns the correct pronoun form.
 * @param proID       The pronoun role ID
 * @param opts.case    "subject" | "object"
 * @param opts.capitalize If true, capitalizes the first letter
 */
export function getPronoun(
  proID: string | undefined,
  opts: { case: "subject" | "object"; capitalize?: boolean }
): string {
  const entry = proID && pronounMap[proID];
  let p = entry ? entry[opts.case] : opts.case === "subject" ? "they" : "them";
  if (opts.capitalize) p = p[0].toUpperCase() + p.slice(1);
  return p;
}
