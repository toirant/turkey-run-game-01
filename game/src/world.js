// Turkey Run — the world: stages, obstacles and corn.
// The world scrolls left past the turkey. Obstacles are spawned in
// groups ahead of the screen; each group leaves at least one lane
// open so a run is always survivable. Corn trails pay the player
// for risky lines and push the farmer back a little.

(function (global) {
  'use strict';

  var C = global.TurkeyRunConfig;
  var STAGES = global.TurkeyRunStages;
  var R = global.TurkeyRunRandom;

  // Obstacle shapes: width, height and whether the turkey must jump
  // them (tall) or can also dodge around them (low, lane-bound).
  var OBSTACLE_TYPES = {
    fence:    { w: 46, h: 62, jumpable: true,  score: 20 },
    hay:      { w: 64, h: 58, jumpable: true,  score: 20 },
    pumpkin:  { w: 44, h: 40, jumpable: true,  score: 20 },
    pitchfork:{ w: 30, h: 78, jumpable: false, score: 30 },
    knife:    { w: 26, h: 92, jumpable: false, score: 40 },
    oven:     { w: 96, h: 84, jumpable: false, score: 50 },
  };

  function stageAt(distance) {
    for (var i = 0; i < STAGES.length; i++) {
      if (distance >= STAGES[i].from && distance < STAGES[i].to) return STAGES[i];
    }
    return STAGES[STAGES.length - 1];
  }

  function stageIndexAt(distance) {
    for (var i = 0; i < STAGES.length; i++) {
      if (distance >= STAGES[i].from && distance < STAGES[i].to) return i;
    }
    return STAGES.length - 1;
  }

  function createWorld(seed) {
    var rng = R.makeRng(seed || 20261127);
    return {
      rng: rng,
      distance: 0,
      obstacles: [], // { type, lane, x, w, h, passed }
      corns: [],     // { lane, x, taken }
      nextSpawnX: 1100,
      stageIndex: 0,
      banner: null,  // { text, until }
      spawnAccumulator: 0,
    };
  }

  function resetWorld(world, seed) {
    var fresh = createWorld(seed);
    world.rng = fresh.rng;
    world.distance = 0;
    world.obstacles = [];
    world.corns = [];
    world.nextSpawnX = 1100;
    world.stageIndex = 0;
    world.banner = null;
    world.spawnAccumulator = 0;
  }

  // Spawn one obstacle group just off the right edge. One lane is
  // always left clear; a second obstacle may share the group on a
  // different lane once the run is past the farmyard.
  function spawnGroup(world, x) {
    var stage = stageAt(world.distance);
    var lanes = [0, 1, 2];
    var openLane = Math.floor(world.rng() * 3);
    var blocked = lanes.filter(function (lane) { return lane !== openLane; });
    var count = 1;
    if (world.distance > 500 && R.chance(world.rng, 0.55)) count = 2;
    var chosen = [];
    while (chosen.length < count && blocked.length > 0) {
      var lane = blocked.splice(Math.floor(world.rng() * blocked.length), 1)[0];
      chosen.push(lane);
    }
    chosen.forEach(function (lane, i) {
      var type = R.pick(world.rng, stage.obstacles);
      var def = OBSTACLE_TYPES[type];
      world.obstacles.push({
        type: type,
        lane: lane,
        x: x + i * 90,
        w: def.w,
        h: def.h,
        passed: false,
      });
    });

    // Sometimes a trail of corn runs down the open lane: a reward
    // for staying on the safe line, and bait for a dash.
    if (R.chance(world.rng, C.cornChance)) {
      for (var c = 0; c < C.cornTrailLength; c++) {
        world.corns.push({ lane: openLane, x: x + 30 + c * 56, taken: false });
      }
    }
  }

  // Advance the world by dt seconds at the given scroll speed.
  // Returns events the game loop should react to: stage changes and
  // the banner text for them.
  function updateWorld(world, dt, speed) {
    var events = { stageChanged: false, newStage: null };
    var dx = speed * dt;
    world.distance += (dx / 40); // 40 px is one metre of road.

    var newIndex = stageIndexAt(world.distance);
    if (newIndex !== world.stageIndex) {
      world.stageIndex = newIndex;
      events.stageChanged = true;
      events.newStage = STAGES[newIndex];
      world.banner = { text: STAGES[newIndex].banner, until: 3.0 };
    }
    if (world.banner) {
      world.banner.until -= dt;
      if (world.banner.until <= 0) world.banner = null;
    }

    for (var i = 0; i < world.obstacles.length; i++) {
      world.obstacles[i].x -= dx;
    }
    for (var j = 0; j < world.corns.length; j++) {
      world.corns[j].x -= dx;
    }
    world.obstacles = world.obstacles.filter(function (o) { return o.x > -160; });
    world.corns = world.corns.filter(function (c) { return c.x > -60; });

    // Keep spawning ahead of the screen.
    var gap = Math.max(
      C.spawnGapMin,
      C.spawnGapMax - world.distance * C.spawnGapShrinkPerMetre
    );
    world.spawnAccumulator += dx;
    if (world.spawnAccumulator >= gap) {
      world.spawnAccumulator = 0;
      var farthest = C.width + 120;
      for (var k = 0; k < world.obstacles.length; k++) {
        farthest = Math.max(farthest, world.obstacles[k].x + 200);
      }
      spawnGroup(world, farthest);
    }
    return events;
  }

  global.TurkeyRunWorld = {
    OBSTACLE_TYPES: OBSTACLE_TYPES,
    stageAt: stageAt,
    stageIndexAt: stageIndexAt,
    createWorld: createWorld,
    resetWorld: resetWorld,
    spawnGroup: spawnGroup,
    updateWorld: updateWorld,
  };
})(typeof window !== 'undefined' ? window : globalThis);
