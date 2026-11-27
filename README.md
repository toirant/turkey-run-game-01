# Turkey Run — The Great Thanksgiving Escape

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/toirant/turkey-run-game-01/rank.svg)](https://make.fun/c/turkey-run-game-01/leaderboard)
[![reward](https://make.fun/badge/turkey-run-game-01/toirant/turkey-run-game-01/reward.svg)](https://make.fun/c/turkey-run-game-01)

A complete, original turkey escape game that runs offline in a desktop
browser from static files — no build step, no network requests, no
libraries. Entry for the [make.fun turkey-run-game-01 bounty](https://make.fun/bounty/turkey-run-game-01) ($250, top 20 entries share it).

## The game

You are **Tom the turkey**, and Thanksgiving is tomorrow. The farmer is
coming for you, the oven is already lit, and the carving knives are out.
Run 3000 m from the farmyard, through the barn and the kitchen, to the
forest gate — and live to gobble another day.

- **Outrun the farmer**: he trails behind you and lunges closer every
  time you stumble. Corn pushes him back; a dash buys you room.
- **Dodge the dinner**: jump fences, hay bales and pumpkins, sidestep
  pitchforks and falling carving knives, and never stand in front of a
  lit oven.
- **Four stages that get meaner**: the farmyard, the barn, the kitchen,
  and the forest edge — faster scroll, tighter obstacle groups, new
  hazards in each.
- **A real chase**: the farmer searches and sprints when you pull away,
  and the threat meter in the HUD tells you exactly how close he is.
- **Score, distance, lives**: corn is worth 50, every obstacle cleared
  pays, each stage pays a 250 bonus, and escaping pays 1000.
- **Title, HUD and end screens**: a title screen, a live HUD (score,
  distance, hearts, farmer threat, dash cooldown), and a caught or
  escaped screen with instant restart.
- **Keyboard + mouse**: arrows / W S switch lanes, Space or click jumps,
  Shift or double-click dashes, P pauses, M mutes, R restarts.
- **Synthesised sound**: gobbles, thuds, corn chimes, a stage fanfare
  and an escape fanfare, all generated with WebAudio — no audio files.

## Play it

Serve `game/` with any static server and open `game/index.html`, or:

```sh
node serve.ts   # serves game/ at http://localhost:8080
```

## Layout

- `game/index.html` — the page; `game/src/` holds one file per job:
  `config.js` (tuning + stages), `random.js` (seeded RNG),
  `input.js` (keyboard + mouse), `audio.js` (WebAudio synth),
  `world.js` (stages, obstacles, corn), `turkey.js` (the player),
  `farmer.js` (the chaser AI), `render.js` (all drawing + HUD +
  screens), `shots.js` (deterministic screenshot scenes),
  `main.js` (loop + state machine).
- `screenshots/` — three real renders of the game: title, mid-run in
  the barn, and the escape screen.
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with `buildDossier`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
