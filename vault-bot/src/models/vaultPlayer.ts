import mongoose, { Schema, Model } from "mongoose";

export interface IVaultPlayer {
  guildId: string;
  userId: string;
  displayName: string;
  gold: number;
  active: boolean;
}

const VaultPlayerSchema = new Schema<IVaultPlayer>(
  {
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    displayName: { type: String, required: true },
    gold: { type: Number, required: true, default: 0 },
    active: { type: Boolean, required: true, default: false },
  },
  { timestamps: false }
);

VaultPlayerSchema.index({ guildId: 1, userId: 1 }, { unique: true });
VaultPlayerSchema.index({ guildId: 1, gold: -1 });

const MODEL_NAME = "vault_players";

export const VaultPlayer: Model<IVaultPlayer> =
  (mongoose.models[MODEL_NAME] as Model<IVaultPlayer>) ||
  mongoose.model<IVaultPlayer>(MODEL_NAME, VaultPlayerSchema);

export default VaultPlayer;