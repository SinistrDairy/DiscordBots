import { AttachmentBuilder } from "discord.js";
import * as path from "node:path";

export function getImage(fileName: string) {
  const attachment = new AttachmentBuilder(
    path.join(process.cwd(), "Images", fileName),
    {
      name: fileName,
    }
  );

  return {
    attachment,
    url: `attachment://${fileName}`,
  };
}