// Turkey Run — the player: Tom the turkey.
// Tom runs in one of three lanes, jumps the low stuff, dashes for a
// burst of speed, and stumbles when he hits something. A stumble
// costs a heart and lets the farmer lunge closer.

(function (global) {
  'use strict';

  var C = global.TurkeyRunConfig;

  function createTurkey() {
    return {
      lane: 1,            // 0 top, 1 middle, 2 bottom
      y: C.lanes[1],      // ground line of the current lane
      height: 0,          // pixels above the ground line (jump arc)
      vy: 0,              // vertical velocity while airborne
      airborne: false,
      dashTime: 0,        // seconds of dash left
      dashCooldown: 0,
      stumbleTime: 0,     // seconds of stumble left
      invulnerableTime: 0,
      runPhase: 0,        // leg-cycle phase for the run animation
      lives: C.startLives,
    };
  }

  function resetTurkey(turkey) {
    var fresh = createTurkey();
    turkey.lane = fresh.lane;
    turkey.y = fresh.y;
    turkey.height = 0;
    turkey.vy = 0;
    turkey.airborne = false;
    turkey.dashTime = 0;
    turkey.dashCooldown = 0;
    turkey.stumbleTime = 0;
    turkey.invulnerableTime = 0;
    turkey.runPhase = 0;
    turkey.lives = C.startLives;
  }

  function moveLane(turkey, direction) {
    var next = turkey.lane + direction;
    if (next < 0 || next >= C.laneCount) return false;
    turkey.lane = next;
    return true;
  }

  function jump(turkey) {
    if (turkey.airborne || turkey.stumbleTime > 0) return false;
    turkey.airborne = true;
    turkey.vy = C.jumpVelocity;
    return true;
  }

  function dash(turkey) {
    if (turkey.dashCooldown > 0 || turkey.stumbleTime > 0) return false;
    turkey.dashTime = C.dashSeconds;
    turkey.dashCooldown = C.dashCooldownSeconds;
    return true;
  }

  function stumble(turkey) {
    turkey.lives -= 1;
    turkey.stumbleTime = C.stumbleSeconds;
    turkey.invulnerableTime = C.invulnerableSeconds;
    turkey.dashTime = 0;
    if (turkey.airborne) {
      turkey.airborne = false;
      turkey.height = 0;
      turkey.vy = 0;
    }
  }

  function updateTurkey(turkey, dt, speed) {
    // Ease toward the current lane's ground line.
    var targetY = C.lanes[turkey.lane];
    turkey.y += (targetY - turkey.y) * Math.min(1, dt * 14);

    if (turkey.airborne) {
      turkey.vy += C.gravity * dt;
      turkey.height -= turkey.vy * dt;
      if (turkey.height <= 0) {
        turkey.height = 0;
        turkey.vy = 0;
        turkey.airborne = false;
      }
    }

    if (turkey.dashTime > 0) turkey.dashTime -= dt;
    if (turkey.dashCooldown > 0) turkey.dashCooldown -= dt;
    if (turkey.stumbleTime > 0) turkey.stumbleTime -= dt;
    if (turkey.invulnerableTime > 0) turkey.invulnerableTime -= dt;

    turkey.runPhase += dt * (speed / 28);
  }

  // The turkey's collision box, in screen space.
  function turkeyBox(turkey) {
    return {
      x: C.turkeyX - 26,
      y: turkey.y - 58 - turkey.height,
      w: 52,
      h: 58,
    };
  }

  global.TurkeyRunTurkey = {
    createTurkey: createTurkey,
    resetTurkey: resetTurkey,
    moveLane: moveLane,
    jump: jump,
    dash: dash,
    stumble: stumble,
    updateTurkey: updateTurkey,
    turkeyBox: turkeyBox,
  };
})(typeof window !== 'undefined' ? window : globalThis);
