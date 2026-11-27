// Turkey Run — tuning constants and stage definitions.
// One place for every number the game balances on, so tuning never
// means hunting through the drawing or physics code.

(function (global) {
  'use strict';

  var CONFIG = {
    // Canvas the game draws into (CSS scales it up for the page).
    width: 960,
    height: 540,

    // Three running lanes, as y coordinates of the ground line.
    lanes: [330, 410, 490],
    laneCount: 3,

    // Where the turkey and the farmer sit on screen.
    turkeyX: 190,
    farmerX: 60,

    // The run: reach the forest gate at this distance to escape.
    escapeDistance: 3000,

    // Speed in pixels per second, rising with distance.
    baseSpeed: 260,
    maxSpeed: 520,
    speedGainPerMetre: 0.09,

    // The farmer's gap behind the turkey, in pixels.
    farmerStartGap: 130,
    farmerCatchGap: 6,
    farmerClosePerSecond: 1.6,
    farmerLungeOnStumble: 34,
    farmerPushbackOnCorn: 4,
    farmerPushbackOnDash: 10,

    // Lives, scoring and pickups.
    startLives: 3,
    cornScore: 50,
    metreScore: 1,
    stageBonus: 250,
    escapeBonus: 1000,

    // Jump and dash feel.
    jumpVelocity: -640,
    gravity: 1900,
    dashSeconds: 0.45,
    dashCooldownSeconds: 2.2,
    dashSpeedMultiplier: 1.7,

    // Stumble: how long the turkey flails after hitting something.
    stumbleSeconds: 0.9,
    invulnerableSeconds: 1.6,

    // Spawning: gap between obstacle groups, in pixels, shrinking as
    // the run gets faster and the stages get meaner.
    spawnGapMin: 300,
    spawnGapMax: 560,
    spawnGapShrinkPerMetre: 0.06,

    // Corn: how often a little trail of corn appears.
    cornChance: 0.42,
    cornTrailLength: 4,
  };

  // The four stages of the escape, in order. Each stage changes the
  // scenery, the obstacle mix and the stage banner the player sees.
  var STAGES = [
    {
      key: 'farmyard',
      name: 'THE FARMYARD',
      from: 0,
      to: 800,
      sky: ['#f9cf7d', '#f2a95c'],
      ground: '#8a5a2b',
      grass: '#7da23c',
      obstacles: ['fence', 'hay', 'pumpkin'],
      banner: 'Run, Tom! The farmer is coming!',
    },
    {
      key: 'barn',
      name: 'THE BARN',
      from: 800,
      to: 1600,
      sky: ['#e8a35c', '#c97e3e'],
      ground: '#6e4520',
      grass: '#8a6d2f',
      obstacles: ['fence', 'hay', 'knife', 'pitchfork'],
      banner: 'Through the barn — mind the carving knives!',
    },
    {
      key: 'kitchen',
      name: 'THE KITCHEN',
      from: 1600,
      to: 2400,
      sky: ['#d98a4e', '#a85f33'],
      ground: '#5d3a22',
      grass: '#7a5a34',
      obstacles: ['oven', 'knife', 'hay', 'fence'],
      banner: 'The oven is lit! Do NOT become dinner!',
    },
    {
      key: 'forest',
      name: 'THE FOREST EDGE',
      from: 2400,
      to: 3000,
      sky: ['#e8b96a', '#c98a4a'],
      ground: '#6b4a24',
      grass: '#4f7a33',
      obstacles: ['fence', 'hay', 'knife', 'pumpkin'],
      banner: 'Almost there — the forest gate is ahead!',
    },
  ];

  global.TurkeyRunConfig = CONFIG;
  global.TurkeyRunStages = STAGES;
})(typeof window !== 'undefined' ? window : globalThis);
