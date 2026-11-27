// Turkey Run — a tiny seeded random generator.
// The game uses it for obstacle patterns and for the deterministic
// screenshot scenes, so a given seed always plays the same run.

(function (global) {
  'use strict';

  // Mulberry32: small, fast, and good enough for a game.
  function makeRng(seed) {
    var state = seed >>> 0;
    return function next() {
      state = (state + 0x6D2B79F5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, list) {
    return list[Math.floor(rng() * list.length)];
  }

  function range(rng, min, max) {
    return min + rng() * (max - min);
  }

  function chance(rng, probability) {
    return rng() < probability;
  }

  global.TurkeyRunRandom = { makeRng: makeRng, pick: pick, range: range, chance: chance };
})(typeof window !== 'undefined' ? window : globalThis);
