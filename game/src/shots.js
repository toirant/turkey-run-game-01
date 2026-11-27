// Turkey Run — deterministic screenshot scenes.
// ?shot=start shows the title, ?shot=play a mid-run moment in the
// barn with the farmer closing in, ?shot=end the escape screen.
// Each scene seeds the world so the same URL always renders the
// same picture, and the scenes are real renders of the game code.

(function (global) {
  'use strict';

  var C = global.TurkeyRunConfig;
  var W = global.TurkeyRunWorld;

  function readShotParams() {
    var params = new URLSearchParams(global.location.search);
    return {
      shot: params.get('shot'),
      seed: parseInt(params.get('seed') || '7', 10) || 7,
    };
  }

  // Build a fixed scene for the requested screenshot and return the
  // game state it should start in. Returns null for normal play.
  function applyShot(game, shot, seed) {
    if (!shot) return null;

    if (shot === 'start') {
      game.state = 'title';
      game.time = 1.2;
      return 'title';
    }

    if (shot === 'play') {
      // A busy barn moment: knives and hay ahead, corn on the open
      // lane, the farmer close enough to read the threat meter.
      W.resetWorld(game.world, seed);
      game.world.distance = 1250;
      game.world.stageIndex = W.stageIndexAt(1250);
      game.world.obstacles = [
        { type: 'knife', lane: 0, x: 620, w: 26, h: 92, passed: false },
        { type: 'hay', lane: 1, x: 700, w: 64, h: 58, passed: false },
        { type: 'fence', lane: 2, x: 640, w: 46, h: 62, passed: false },
        { type: 'pitchfork', lane: 0, x: 880, w: 30, h: 78, passed: false },
        { type: 'knife', lane: 2, x: 900, w: 26, h: 92, passed: false },
      ];
      game.world.corns = [
        { lane: 1, x: 420, taken: false },
        { lane: 1, x: 476, taken: false },
        { lane: 1, x: 532, taken: false },
      ];
      game.world.banner = { text: 'Through the barn — mind the carving knives!', until: 2.5 };
      game.turkey.lane = 1;
      game.turkey.y = C.lanes[1];
      game.turkey.height = 26;
      game.turkey.airborne = true;
      game.turkey.vy = -220;
      game.turkey.lives = 2;
      game.farmer.gap = 58;
      game.score = 1450;
      game.cornEaten = 12;
      game.distance = 1250;
      game.state = 'playing';
      game.time = 2.4;
      return 'playing';
    }

    if (shot === 'end') {
      game.state = 'escaped';
      game.score = 4860;
      game.distance = C.escapeDistance;
      game.cornEaten = 27;
      game.bestScore = 4860;
      game.time = 1.6;
      return 'escaped';
    }

    return null;
  }

  global.TurkeyRunShots = { readShotParams: readShotParams, applyShot: applyShot };
})(typeof window !== 'undefined' ? window : globalThis);
