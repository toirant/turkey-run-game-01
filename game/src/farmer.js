// Turkey Run — the farmer: the chaser.
// The farmer trails behind the turkey at a gap that shrinks slowly
// on its own, lunges closer on every stumble, and falls back when
// the turkey eats corn or dashes. When the gap closes, dinner is
// served. He also searches: when the turkey is far ahead he
// quickens, and when the turkey dawdles he closes in faster.

(function (global) {
  'use strict';

  var C = global.TurkeyRunConfig;

  function createFarmer() {
    return {
      gap: C.farmerStartGap, // pixels behind the turkey
      runPhase: 0,
      searching: false,      // true when the turkey pulled far ahead
      warned: false,         // true once the close-warning sound played
    };
  }

  function resetFarmer(farmer) {
    var fresh = createFarmer();
    farmer.gap = fresh.gap;
    farmer.runPhase = 0;
    farmer.searching = false;
    farmer.warned = false;
  }

  function updateFarmer(farmer, dt, speed, turkey) {
    // The farmer always creeps closer; faster when the turkey is
    // stumbling, slower while the turkey is dashing away.
    var closeRate = C.farmerClosePerSecond;
    if (turkey.stumbleTime > 0) closeRate *= 3.2;
    if (turkey.dashTime > 0) closeRate = -6;
    farmer.gap -= closeRate * dt;

    // Searching: a big gap makes the farmer sprint to catch up.
    farmer.searching = farmer.gap > 190;
    if (farmer.searching) farmer.gap -= 14 * dt;

    // Clamp the gap so the farmer never runs off the left edge or
    // overtakes the turkey without a catch.
    if (farmer.gap < C.farmerCatchGap) farmer.gap = C.farmerCatchGap;
    if (farmer.gap > 260) farmer.gap = 260;

    farmer.runPhase += dt * (speed / 24);
  }

  function lunge(farmer) {
    farmer.gap = Math.max(C.farmerCatchGap, farmer.gap - C.farmerLungeOnStumble);
  }

  function pushBack(farmer, pixels) {
    farmer.gap = Math.min(260, farmer.gap + pixels);
  }

  function isCaught(farmer) {
    return farmer.gap <= C.farmerCatchGap + 0.5;
  }

  // How close the farmer is, 0 (far away) to 1 (on the turkey).
  function threatLevel(farmer) {
    var span = 260 - C.farmerCatchGap;
    return Math.max(0, Math.min(1, 1 - (farmer.gap - C.farmerCatchGap) / span));
  }

  global.TurkeyRunFarmer = {
    createFarmer: createFarmer,
    resetFarmer: resetFarmer,
    updateFarmer: updateFarmer,
    lunge: lunge,
    pushBack: pushBack,
    isCaught: isCaught,
    threatLevel: threatLevel,
  };
})(typeof window !== 'undefined' ? window : globalThis);
