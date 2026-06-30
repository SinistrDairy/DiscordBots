// src/constants/images.ts

export const Images = {
  // Splash Showdown
  splashShowdown: "FK_Splash_Showdown.png",
  splashShowdown2: "FK_Splash_Showdown_2.png",
  footer: "FK_Embed_Footers_3.png",

  // Emojis / Special
  waterEmoji: "FK_SplashEmoji_water.png",
  slimeEmoji: "FK_SplashEmoji_slime.png",
  stitchTongue: "stitch_tongue.png",
  stitchWG: "stitch-WG.png",

  // Characters
  abuu: "Abuu.png",
  bruni: "Bruni.png",
  cheshire: "Cheshire.png",
  figment: "Figment.png",
  gusGus: "GusGus.png",
  kuzco: "Kuzco.png",
  mushu: "Mushu.png",
  tigger: "Tigger.png",
  tinkerbell: "Tinkerbell.png",
} as const;

export const CharacterImages = {
  Tigger: Images.tigger,
  Kuzco: Images.kuzco,
  "Tinker Bell": Images.tinkerbell,
  "Gus Gus": Images.gusGus,
  Abuu: Images.abuu,
  Bruni: Images.bruni,
  Cheshire: Images.cheshire,
  Figment: Images.figment,
  Mushu: Images.mushu,
} as const;

export type CharacterName = keyof typeof CharacterImages;