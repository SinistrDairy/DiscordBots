// run-scripts.mjs
// Interactive runner: lists all .ts scripts and prompts which one to execute
import { register } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "fs";
import path from "path";
import readline from "readline/promises";

// Hook ts-node's ESM loader
register("ts-node/esm", pathToFileURL("./"));

(async () => {
  const scriptsDir = path.resolve("./scripts");

  // Get .ts files in scripts/
  let files;
  try {
    files = fs.readdirSync(scriptsDir).filter((f) => f.endsWith(".ts"));
  } catch (e) {
    console.error(`Error reading scripts directory: ${e.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log("No .ts scripts found in scripts/");
    process.exit(0);
  }

  // List options
  console.log("Available scripts:");
  files.forEach((file, i) => {
    console.log(`  ${i + 1}) ${file}`);
  });

  // Prompt user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question("Enter the number of the script to run: ");
  rl.close();

  const idx = parseInt(answer.trim(), 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= files.length) {
    console.error("Invalid selection. Exiting.");
    process.exit(1);
  }

  const selected = files[idx];
  const filePath = path.join(scriptsDir, selected);
  console.log(`\n📄 Running ${selected}...`);

  try {
    await import(pathToFileURL(filePath).href);
  } catch (err) {
    console.error(`Error executing ${selected}:`, err);
    process.exit(1);
  }
})();
