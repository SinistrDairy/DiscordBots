import mongoose, { Schema, Model } from "mongoose";

export interface IVaultLeaderboard {
  guildId: string;
  channelId: string;
  messageId: string;
}

const VaultLeaderboardSchema = new Schema<IVaultLeaderboard>(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
  },
  { timestamps: false }
);

const MODEL_NAME = "vault_leaderboards";

export const VaultLeaderboard: Model<IVaultLeaderboard> =
  (mongoose.models[MODEL_NAME] as Model<IVaultLeaderboard>) ||
  mongoose.model<IVaultLeaderboard>(MODEL_NAME, VaultLeaderboardSchema);

export default VaultLeaderboard;