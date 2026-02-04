// src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    GUILD_ID2: `${number}`;
    // …any other vars…
  }
}
