import userSchema from "../../models/profiles/user-schema.js";
import landsSchema from "../../models/profiles/lands-schema.js";

type AddPointsResult =
  | { ok: true; landName: string; newTotalPoints?: number }
  | { ok: false; reason: "User profile not found." | "Land not found." };

function titleCase(input: string): string {
  return String(input)
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Adds points to the user's land total (NOT the user).
 * - Looks up the user profile by (userID, serverID) with a fallback by userID only.
 * - Converts user's land name into title case to match land doc naming convention.
 * - Increments lands.totalPoints.
 */
export async function addPointsToUserLand(
  userID: string,
  serverID: string,
  points: number
): Promise<AddPointsResult> {
  if (!Number.isFinite(points) || points === 0) {
    // treating 0/NaN as no-op; if you prefer strict error, change this
    return { ok: false, reason: "Land not found." };
  }

  const user =
    (await userSchema.findOne({ userID, serverID })) ||
    (await userSchema.findOne({ userID }));

  if (!user) return { ok: false, reason: "User profile not found." };

  const landName = titleCase(user.land);

  const land = await landsSchema.findOneAndUpdate(
    { name: landName },
    { $inc: { totalPoints: points } },
    { new: true }
  );

  if (!land) return { ok: false, reason: "Land not found." };

  return {
    ok: true,
    landName,
    newTotalPoints: land.totalPoints,
  };
}
