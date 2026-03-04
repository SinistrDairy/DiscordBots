// src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    GUILD_ID: `${number}`;
    // …any other vars…
  }
}
