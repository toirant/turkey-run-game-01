// Turkey Run — the game loop and state machine.
// States: title -> playing <-> paused -> caught / escaped.
// The loop owns scoring, collisions, the farmer chase and the
// restart; drawing lives in render.js, the world in world.js.

(function (global) {
  'use strict';

  var C = global.TurkeyRunConfig;
  var W = global.TurkeyRunWorld;
  var T = global.TurkeyRunTurkey;
  var F = global.TurkeyRunFarmer;
  var R = global.TurkeyRunRender;

  function createGame(canvas) {
    var game = {
      canvas: canvas,
      ctx: canvas.getContext('2d'),
      state: 'title',
      time: 0,
      score: 0,
      distance: 0,
      cornEaten: 0,
      bestScore: 0,
      turkey: T.createTurkey(),
      farmer: F.createFarmer(),
      world: W.createWorld(20261127),
      input: global.TurkeyRunInput.createInput(canvas),
      audio: global.TurkeyRunAudio.createAudio(),
      speed: C.baseSpeed,
      lastFrame: 0,
      shotMode: null,
    };
    return game;
  }

  function resetRun(game) {
    T.resetTurkey(game.turkey);
    F.resetFarmer(game.farmer);
    W.resetWorld(game.world, (Math.random() * 1e9) | 0);
    game.score = 0;
    game.distance = 0;
    game.cornEaten = 0;
    game.speed = C.baseSpeed;
    game.state = 'playing';
  }

  function currentSpeed(game) {
    var speed = Math.min(
      C.maxSpeed,
      C.baseSpeed + game.distance * C.speedGainPerMetre
    );
    if (game.turkey.dashTime > 0) speed *= C.dashSpeedMultiplier;
    return speed;
  }

  function boxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function obstacleBox(obstacle) {
    var groundY = C.lanes[obstacle.lane];
    return {
      x: obstacle.x + 4,
      y: groundY - obstacle.h + 6,
      w: obstacle.w - 8,
      h: obstacle.h - 6,
    };
  }

  function checkCollisions(game) {
    var turkey = game.turkey;
    if (turkey.invulnerableTime > 0 || turkey.stumbleTime > 0) return;
    var box = T.turkeyBox(turkey);

    for (var i = 0; i < game.world.obstacles.length; i++) {
      var obstacle = game.world.obstacles[i];
      if (obstacle.passed) continue;
      // A jump clears an obstacle only if the turkey is high enough
      // above its top; low obstacles can also be dodged by lane.
      var ob = obstacleBox(obstacle);
      if (boxesOverlap(box, ob)) {
        var def = W.OBSTACLE_TYPES[obstacle.type];
        if (turkey.airborne && box.y + box.h <= ob.y + 14 && def.jumpable) {
          continue; // cleared it mid-jump
        }
        obstacle.passed = true;
        T.stumble(turkey);
        F.lunge(game.farmer);
        game.audio.thud();
        return;
      }
      if (!obstacle.passed && obstacle.x + obstacle.w < C.turkeyX - 30) {
        obstacle.passed = true;
        game.score += W.OBSTACLE_TYPES[obstacle.type].score;
      }
    }

    for (var j = 0; j < game.world.corns.length; j++) {
      var corn = game.world.corns[j];
      if (corn.taken) continue;
      var cornBox = { x: corn.x - 12, y: C.lanes[corn.lane] - 40, w: 24, h: 28 };
      if (boxesOverlap(box, cornBox)) {
        corn.taken = true;
        game.cornEaten += 1;
        game.score += C.cornScore;
        F.pushBack(game.farmer, C.farmerPushbackOnCorn);
        game.audio.corn();
      }
    }
  }

  function updatePlaying(game, dt) {
    game.speed = currentSpeed(game);
    T.updateTurkey(game.turkey, dt, game.speed);
    F.updateFarmer(game.farmer, dt, game.speed, game.turkey);

    var events = W.updateWorld(game.world, dt, game.speed);
    game.distance = game.world.distance;
    if (events.stageChanged) {
      game.score += C.stageBonus;
      game.audio.stageClear();
    }

    // Score ticks up with every metre run.
    game.score += game.speed * dt * C.metreScore * 0.02;

    checkCollisions(game);

    // The farmer's warning cry when he gets dangerously close.
    if (F.threatLevel(game.farmer) > 0.8 && !game.farmer.warned) {
      game.farmer.warned = true;
      game.audio.farmerClose();
    }
    if (F.threatLevel(game.farmer) < 0.5) game.farmer.warned = false;

    // Caught: out of lives, or the farmer closed the gap.
    if (game.turkey.lives <= 0 || F.isCaught(game.farmer)) {
      game.state = 'caught';
      game.bestScore = Math.max(game.bestScore, Math.floor(game.score));
      game.audio.caught();
      return;
    }

    // Escaped: reached the forest gate.
    if (game.distance >= C.escapeDistance) {
      game.state = 'escaped';
      game.score += C.escapeBonus;
      game.bestScore = Math.max(game.bestScore, Math.floor(game.score));
      game.audio.escaped();
    }
  }

  function handleAction(game, action) {
    game.audio.unlock();
    if (action === 'mute') {
      var muted = game.audio.toggleMute();
      if (game.state === 'title') game.mutedNote = muted;
      return;
    }

    if (game.state === 'title') {
      if (action === 'start' || action === 'jump') {
        game.audio.gobble();
        resetRun(game);
      }
      return;
    }

    if (game.state === 'playing') {
      if (action === 'up') T.moveLane(game.turkey, -1);
      else if (action === 'down') T.moveLane(game.turkey, 1);
      else if (action === 'jump') {
        if (T.jump(game.turkey)) game.audio.jump();
      } else if (action === 'dash') {
        if (T.dash(game.turkey)) {
          F.pushBack(game.farmer, C.farmerPushbackOnDash);
          game.audio.dash();
        }
      } else if (action === 'pause') {
        game.state = 'paused';
      } else if (action === 'restart') {
        resetRun(game);
      }
      return;
    }

    if (game.state === 'paused') {
      if (action === 'pause' || action === 'start') game.state = 'playing';
      else if (action === 'restart') resetRun(game);
      return;
    }

    // caught / escaped
    if (action === 'restart' || action === 'jump' || action === 'start') {
      game.audio.gobble();
      resetRun(game);
    }
  }

  function handleMouseSteering(game) {
    if (game.state !== 'playing') return;
    var mouse = game.input.mouse;
    if (!mouse.inside) return;
    // The pointer's height picks a lane; the turkey eases toward it.
    var laneHeight = (C.lanes[2] - C.lanes[0]) / 2;
    var middle = (C.lanes[0] + C.lanes[2]) / 2;
    var lane = 1;
    if (mouse.y < middle - laneHeight / 2) lane = 0;
    else if (mouse.y > middle + laneHeight / 2) lane = 2;
    if (lane !== game.turkey.lane && game.turkey.stumbleTime <= 0) {
      game.turkey.lane = lane;
    }
  }

  function frame(game, timestamp) {
    // Screenshot scenes are stills: draw the frozen scene once and
    // do not advance it, so ?shot= always renders the same picture.
    if (game.shotMode) {
      R.drawFrame(game.ctx, game);
      return;
    }
    var dt = Math.min(0.05, (timestamp - game.lastFrame) / 1000 || 0.016);
    game.lastFrame = timestamp;
    game.time += dt;

    var actions = game.input.drain();
    for (var i = 0; i < actions.length; i++) {
      handleAction(game, actions[i]);
    }
    handleMouseSteering(game);

    if (game.state === 'playing') {
      updatePlaying(game, dt);
    } else if (game.state === 'title' || game.state === 'escaped' || game.state === 'caught') {
      // Idle animation on the menu screens: the turkey keeps running
      // in place on the title screen.
      game.turkey.runPhase += dt * 8;
    }

    R.drawFrame(game.ctx, game);
    global.requestAnimationFrame(function (ts) { frame(game, ts); });
  }

  function boot() {
    var canvas = document.getElementById('game');
    var game = createGame(canvas);

    var params = global.TurkeyRunShots.readShotParams();
    if (params.shot) {
      game.shotMode = params.shot;
      global.TurkeyRunShots.applyShot(game, params.shot, params.seed);
      // Screenshot scenes render one still frame; the animation loop
      // keeps running underneath so the scene stays alive.
    }

    global.requestAnimationFrame(function (ts) {
      game.lastFrame = ts;
      frame(game, ts);
    });

    // A read-only handle for automated testing and debugging.
    global.__turkeyRunGame = game;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.TurkeyRunMain = { createGame: createGame, resetRun: resetRun };
})(typeof window !== 'undefined' ? window : globalThis);
