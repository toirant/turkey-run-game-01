// Turkey Run — the entrypoint: hands the game in.
// Copies game/ and screenshots/ from this repository into the
// output directory and writes /output/dossier.json with buildDossier
// from vendor/makefun-game.ts, exactly as the gate expects it.
// Run it with MAKEFUN_OUTPUT_DIR=out node main.ts outside the
// grader; inside the grader /output is the target. It never deletes
// the output directory itself: the grader mounts it, so removing it
// would fail the run. It only writes inside it.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const gameDir = join(repoRoot, 'game');
const screenshotsDir = join(repoRoot, 'screenshots');

if (!existsSync(gameDir)) {
  throw new Error('game/: no such directory in the repository');
}
if (!existsSync(screenshotsDir)) {
  throw new Error('screenshots/: no such directory in the repository');
}

mkdirSync(outputDir, { recursive: true });
cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
cpSync(screenshotsDir, join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// A short human-readable summary of what was handed in, so a local
// run shows the entry is complete without opening the dossier.
const gameFiles = readdirSync(join(outputDir, 'game'), { recursive: true }).length;
const shotFiles = readdirSync(join(outputDir, 'screenshots')).length;
console.log(
  `turkey-run-game-01: wrote ${outputDir} (${gameFiles} game entries, ` +
  `${shotFiles} screenshots, dossier ${dossier.length} bytes)`
);
