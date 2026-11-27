// Turkey Run — all drawing: scenery, characters, obstacles, HUD
// and the title / end screens. Everything is drawn with canvas
// paths in an autumn palette; no image files are loaded.

(function (global) {
  'use strict';

  var C = global.TurkeyRunConfig;
  var W = global.TurkeyRunWorld;
  var T = global.TurkeyRunTurkey;

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  // --- scenery ----------------------------------------------------

  function drawSky(ctx, stage, time) {
    var gradient = ctx.createLinearGradient(0, 0, 0, C.height);
    gradient.addColorStop(0, stage.sky[0]);
    gradient.addColorStop(1, stage.sky[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, C.width, C.height);

    // A low autumn sun and a few drifting clouds.
    ctx.fillStyle = '#fff3c4';
    circle(ctx, 830, 74, 34);
    ctx.fillStyle = 'rgba(255, 244, 200, 0.75)';
    for (var i = 0; i < 3; i++) {
      var cx = ((i * 340 + time * 12) % (C.width + 240)) - 120;
      var cy = 56 + i * 34;
      ellipse(ctx, cx, cy, 52, 16);
      ellipse(ctx, cx + 34, cy + 6, 38, 13);
    }

    // Falling leaves in the forest stage, drifting feathers elsewhere.
    ctx.fillStyle = stage.key === 'forest' ? '#c96a2e' : 'rgba(255,255,255,0.7)';
    for (var j = 0; j < 12; j++) {
      var lx = ((j * 173 + time * (18 + j * 2)) % (C.width + 40)) - 20;
      var ly = (j * 47 + time * 26) % 300;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.sin(time + j) * 0.6);
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    }
  }

  function drawGround(ctx, stage, scrollX) {
    // Rolling hills in the distance.
    ctx.fillStyle = stage.grass;
    ctx.beginPath();
    ctx.moveTo(0, 300);
    for (var x = 0; x <= C.width; x += 40) {
      ctx.lineTo(x, 292 + Math.sin((x + scrollX * 0.3) * 0.012) * 10);
    }
    ctx.lineTo(C.width, C.height);
    ctx.lineTo(0, C.height);
    ctx.closePath();
    ctx.fill();

    // The dirt road the turkey runs on, one band per lane.
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, 300, C.width, 240);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (var lane = 0; lane < 3; lane++) {
      ctx.fillRect(0, C.lanes[lane] + 4, C.width, 3);
    }
    // Dashed centre line that scrolls with the world.
    ctx.fillStyle = 'rgba(255, 240, 200, 0.5)';
    var offset = scrollX % 64;
    for (var d = -offset; d < C.width; d += 64) {
      ctx.fillRect(d, 392, 34, 5);
    }

    // Stage dressing at the roadside.
    if (stage.key === 'farmyard' || stage.key === 'forest') {
      drawFenceLine(ctx, scrollX, 296);
    }
    if (stage.key === 'barn') {
      drawBarn(ctx, scrollX);
    }
    if (stage.key === 'kitchen') {
      drawKitchenWall(ctx, scrollX);
    }
  }

  function drawFenceLine(ctx, scrollX, y) {
    ctx.strokeStyle = '#7a4a22';
    ctx.lineWidth = 4;
    var offset = scrollX % 90;
    for (var x = -offset; x < C.width + 90; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, y - 26);
      ctx.lineTo(x, y + 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, y - 20);
    ctx.lineTo(C.width, y - 20);
    ctx.moveTo(0, y - 8);
    ctx.lineTo(C.width, y - 8);
    ctx.stroke();
  }

  function drawBarn(ctx, scrollX) {
    var bx = C.width - ((scrollX * 0.5) % (C.width + 500)) + 40;
    ctx.fillStyle = '#a83c28';
    ctx.fillRect(bx, 150, 220, 150);
    ctx.fillStyle = '#7e2a1a';
    ctx.beginPath();
    ctx.moveTo(bx - 12, 150);
    ctx.lineTo(bx + 110, 84);
    ctx.lineTo(bx + 232, 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7e3b0';
    ctx.fillRect(bx + 82, 210, 56, 90);
    ctx.strokeStyle = '#7e2a1a';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx + 82, 210, 56, 90);
    ctx.beginPath();
    ctx.moveTo(bx + 82, 210);
    ctx.lineTo(bx + 138, 300);
    ctx.moveTo(bx + 138, 210);
    ctx.lineTo(bx + 82, 300);
    ctx.stroke();
  }

  function drawKitchenWall(ctx, scrollX) {
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(0, 0, C.width, 96);
    ctx.fillStyle = '#c9b68f';
    for (var x = -((scrollX * 0.4) % 64); x < C.width; x += 64) {
      ctx.fillRect(x, 0, 2, 96);
    }
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, 96, C.width, 10);
  }

  // --- characters -------------------------------------------------

  function drawTurkey(ctx, turkey, time) {
    var x = C.turkeyX;
    var groundY = turkey.y;
    var baseY = groundY - turkey.height;
    var bob = turkey.airborne ? 0 : Math.sin(turkey.runPhase * 2) * 2;
    var blink = turkey.invulnerableTime > 0 && Math.floor(time * 12) % 2 === 0;

    ctx.save();
    if (blink) ctx.globalAlpha = 0.35;
    ctx.translate(x, baseY + bob);

    // Shadow on the ground.
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ellipse(ctx, 0, turkey.height + 2 - bob, 30, 6);

    // Fanned tail feathers.
    var tailColors = ['#b4551f', '#d97b2e', '#8a3d16', '#e8a33c', '#b4551f'];
    for (var i = 0; i < 5; i++) {
      var angle = -0.9 + i * 0.45;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = tailColors[i];
      ellipse(ctx, -26, -34, 9, 26);
      ctx.fillStyle = '#f7e3b0';
      circle(ctx, -26, -52, 4);
      ctx.restore();
    }

    // Body.
    ctx.fillStyle = '#7a4a22';
    ellipse(ctx, 0, -28, 26, 30);
    ctx.fillStyle = '#8f5a2c';
    ellipse(ctx, 2, -30, 20, 24);

    // Wing, flapping with the run.
    var flap = Math.sin(turkey.runPhase * 2) * 6;
    ctx.fillStyle = '#5d3617';
    ctx.save();
    ctx.translate(-4, -30);
    ctx.rotate(-0.4 + flap * 0.02);
    ellipse(ctx, -8, 0, 16, 10);
    ctx.restore();

    // Neck and head.
    ctx.fillStyle = '#a8642f';
    roundRect(ctx, 14, -58, 10, 26, 5);
    ctx.fillStyle = '#e8e0d0';
    circle(ctx, 20, -62, 11);
    // Beak and wattle.
    ctx.fillStyle = '#e8a33c';
    ctx.beginPath();
    ctx.moveTo(29, -64);
    ctx.lineTo(40, -60);
    ctx.lineTo(29, -57);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c92f2f';
    ellipse(ctx, 26, -52, 4, 7);
    // Eye, wide with panic.
    ctx.fillStyle = '#1a1a1a';
    circle(ctx, 23, -65, 2.6);
    ctx.fillStyle = '#ffffff';
    circle(ctx, 24, -66, 1);

    // Legs, cycling with the run.
    ctx.strokeStyle = '#e8a33c';
    ctx.lineWidth = 4;
    var legSwing = turkey.airborne ? 10 : Math.sin(turkey.runPhase * 2) * 10;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-6 + legSwing, 0);
    ctx.moveTo(6, -4);
    ctx.lineTo(6 - legSwing, 0);
    ctx.stroke();

    ctx.restore();
  }

  function drawFarmer(ctx, farmer, turkeyY, time) {
    var x = C.turkeyX - farmer.gap;
    var y = turkeyY;
    var bob = Math.abs(Math.sin(farmer.runPhase * 2)) * -4;

    ctx.save();
    ctx.translate(x, y + bob);

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ellipse(ctx, 0, 2 - bob, 28, 6);

    // Legs, pumping.
    ctx.strokeStyle = '#3a2c1c';
    ctx.lineWidth = 6;
    var swing = Math.sin(farmer.runPhase * 2) * 12;
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.lineTo(-6 + swing, 0);
    ctx.moveTo(6, -26);
    ctx.lineTo(6 - swing, 0);
    ctx.stroke();

    // Overalls and shirt.
    ctx.fillStyle = '#2f5d8a';
    roundRect(ctx, -16, -66, 32, 42, 6);
    ctx.fillStyle = '#c94f32';
    ctx.fillRect(-16, -66, 32, 14);
    // Arms reaching for the turkey.
    ctx.strokeStyle = '#c94f32';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(10, -58);
    ctx.lineTo(30, -48 + Math.sin(time * 6) * 3);
    ctx.moveTo(-10, -58);
    ctx.lineTo(-28, -50);
    ctx.stroke();

    // Head, straw hat and angry moustache.
    ctx.fillStyle = '#e8b98a';
    circle(ctx, 0, -76, 13);
    ctx.fillStyle = '#e8c33c';
    ellipse(ctx, 0, -86, 22, 6);
    ctx.fillStyle = '#d9a92e';
    roundRect(ctx, -10, -100, 20, 14, 4);
    ctx.fillStyle = '#4a2c12';
    ctx.fillRect(-8, -72, 16, 4);
    // Eyes fixed on the turkey.
    ctx.fillStyle = '#1a1a1a';
    circle(ctx, 5, -78, 2);
    circle(ctx, 11, -78, 2);

    ctx.restore();
  }

  // --- obstacles and pickups --------------------------------------

  function drawObstacle(ctx, obstacle) {
    var groundY = C.lanes[obstacle.lane];
    var x = obstacle.x;
    var top = groundY - obstacle.h;
    ctx.save();
    if (obstacle.type === 'fence') {
      ctx.fillStyle = '#7a4a22';
      ctx.fillRect(x, top, 6, obstacle.h);
      ctx.fillRect(x + 40, top, 6, obstacle.h);
      ctx.fillStyle = '#9a6232';
      ctx.fillRect(x - 4, top + 8, 54, 8);
      ctx.fillRect(x - 4, top + 30, 54, 8);
    } else if (obstacle.type === 'hay') {
      ctx.fillStyle = '#d9a92e';
      ellipse(ctx, x + 32, groundY - 26, 34, 28);
      ctx.strokeStyle = '#a87e1e';
      ctx.lineWidth = 2;
      for (var i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + 32, groundY - 26, 12 + i * 6, 0.4, 2.6);
        ctx.stroke();
      }
    } else if (obstacle.type === 'pumpkin') {
      ctx.fillStyle = '#e8721c';
      ellipse(ctx, x + 22, groundY - 20, 24, 20);
      ctx.strokeStyle = '#b85a10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 22, groundY - 38);
      ctx.quadraticCurveTo(x + 22, groundY - 20, x + 22, groundY - 2);
      ctx.stroke();
      ctx.fillStyle = '#4f7a33';
      ctx.fillRect(x + 19, groundY - 46, 6, 10);
    } else if (obstacle.type === 'pitchfork') {
      ctx.strokeStyle = '#8a8a8a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 15, groundY);
      ctx.lineTo(x + 15, top + 18);
      ctx.stroke();
      ctx.lineWidth = 3;
      for (var t = -1; t <= 1; t++) {
        ctx.beginPath();
        ctx.moveTo(x + 15 + t * 9, top + 18);
        ctx.lineTo(x + 15 + t * 9, top);
        ctx.stroke();
      }
      ctx.fillStyle = '#7a4a22';
      ctx.fillRect(x + 11, groundY - 22, 8, 22);
    } else if (obstacle.type === 'knife') {
      // A carving knife plunged into the road, blade glinting.
      ctx.save();
      ctx.translate(x + 13, groundY);
      ctx.rotate(0.3);
      ctx.fillStyle = '#d7dee8';
      ctx.beginPath();
      ctx.moveTo(-9, -obstacle.h + 34);
      ctx.lineTo(9, -obstacle.h + 34);
      ctx.lineTo(0, -obstacle.h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-4, -obstacle.h + 32);
      ctx.lineTo(2, -obstacle.h + 32);
      ctx.lineTo(0, -obstacle.h + 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5d3a1a';
      roundRect(ctx, -8, -34, 16, 34, 4);
      ctx.fillStyle = '#c0c8d0';
      ctx.fillRect(-8, -36, 16, 4);
      ctx.restore();
    } else if (obstacle.type === 'oven') {
      // A roaring oven with its door open, heat shimmering above it.
      ctx.fillStyle = '#3a3a3a';
      roundRect(ctx, x, top, obstacle.w, obstacle.h, 8);
      ctx.fillStyle = '#e8721c';
      roundRect(ctx, x + 12, top + 18, obstacle.w - 24, 40, 4);
      ctx.fillStyle = '#ffcf5c';
      ctx.beginPath();
      ctx.moveTo(x + 24, top + 54);
      ctx.quadraticCurveTo(x + 32, top + 28, x + 40, top + 54);
      ctx.quadraticCurveTo(x + 48, top + 32, x + 56, top + 54);
      ctx.quadraticCurveTo(x + 64, top + 30, x + 72, top + 54);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c0c8d0';
      ctx.fillRect(x + 8, top + 62, obstacle.w - 16, 6);
      ctx.fillStyle = '#ff5c1c';
      for (var f = 0; f < 3; f++) {
        ellipse(ctx, x + 24 + f * 24, top - 8 - (f % 2) * 6, 10, 14);
      }
    }
    ctx.restore();
  }

  function drawCorn(ctx, corn) {
    var y = C.lanes[corn.lane] - 26;
    ctx.save();
    ctx.translate(corn.x, y);
    ctx.rotate(0.5);
    ctx.fillStyle = '#f7cf3c';
    ellipse(ctx, 0, 0, 9, 14);
    ctx.fillStyle = '#e8a33c';
    for (var i = -1; i <= 1; i++) {
      ctx.fillRect(i * 5, -10, 2, 20);
    }
    ctx.fillStyle = '#4f7a33';
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.lineTo(-14, 22);
    ctx.lineTo(-4, 16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- HUD and screens --------------------------------------------

  function drawHud(ctx, game) {
    // Top bar.
    ctx.fillStyle = 'rgba(43, 26, 14, 0.72)';
    roundRect(ctx, 12, 10, C.width - 24, 52, 10);

    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCORE ' + Math.floor(game.score), 28, 37);

    ctx.fillStyle = '#ffd27d';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.fillText(Math.floor(game.distance) + ' m / ' + C.escapeDistance + ' m', 330, 37);

    // Stage name.
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(W.stageAt(game.distance).name, C.width / 2 + 60, 37);

    // Hearts.
    ctx.textAlign = 'right';
    for (var i = 0; i < C.startLives; i++) {
      var hx = C.width - 40 - i * 34;
      ctx.fillStyle = i < game.turkey.lives ? '#e83a3a' : 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(hx, 44);
      ctx.bezierCurveTo(hx - 12, 32, hx - 22, 40, hx, 52);
      ctx.bezierCurveTo(hx + 22, 40, hx + 12, 32, hx, 44);
      ctx.fill();
    }

    // Farmer threat meter, bottom left.
    var threat = global.TurkeyRunFarmer.threatLevel(game.farmer);
    ctx.fillStyle = 'rgba(43, 26, 14, 0.72)';
    roundRect(ctx, 12, C.height - 44, 250, 32, 8);
    ctx.fillStyle = '#fff3c4';
    ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FARMER', 24, C.height - 28);
    var barX = 96;
    var barW = 140;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    roundRect(ctx, barX, C.height - 36, barW, 14, 7);
    ctx.fillStyle = threat > 0.66 ? '#e83a3a' : threat > 0.33 ? '#e8a33c' : '#7da23c';
    roundRect(ctx, barX, C.height - 36, barW * threat, 14, 7);
    if (threat > 0.66) {
      ctx.fillStyle = '#ff6b5c';
      ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
      ctx.fillText('HE IS RIGHT BEHIND YOU!', 268, C.height - 28);
    }

    // Dash cooldown, bottom right.
    if (game.turkey.dashCooldown > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('DASH recharging…', C.width - 24, C.height - 28);
    } else if (game.turkey.dashTime > 0) {
      ctx.fillStyle = '#ffd27d';
      ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('DASH!', C.width - 24, C.height - 28);
    }

    // Stage banner.
    if (game.world.banner) {
      ctx.font = 'bold 19px "Trebuchet MS", sans-serif';
      var bw = ctx.measureText(game.world.banner.text).width + 48;
      ctx.fillStyle = 'rgba(43, 26, 14, 0.8)';
      roundRect(ctx, (C.width - bw) / 2, 78, bw, 40, 10);
      ctx.fillStyle = '#ffe9b0';
      ctx.textAlign = 'center';
      ctx.fillText(game.world.banner.text, C.width / 2, 99);
    }
  }

  function drawTitle(ctx, time) {
    ctx.fillStyle = 'rgba(43, 26, 14, 0.55)';
    ctx.fillRect(0, 0, C.width, C.height);

    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 64px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TURKEY RUN', C.width / 2, 130);

    ctx.fillStyle = '#ffd27d';
    ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
    ctx.fillText('The Great Thanksgiving Escape', C.width / 2, 172);

    // A turkey mid-stride, drawn large on the title.
    ctx.save();
    ctx.translate(C.width / 2, 345);
    ctx.scale(1.45, 1.45);
    ctx.translate(-C.turkeyX + 190, 0);
    var fake = { lane: 1, y: 0, height: Math.abs(Math.sin(time * 3)) * 14, vy: 0,
      airborne: false, dashTime: 0, dashCooldown: 0, stumbleTime: 0,
      invulnerableTime: 0, runPhase: time * 6, lives: 3 };
    // Draw the turkey at the origin by shifting the coordinate frame.
    ctx.translate(-190, 0);
    drawTurkey(ctx, fake, time);
    ctx.restore();

    ctx.fillStyle = '#fff3c4';
    ctx.font = '20px "Trebuchet MS", sans-serif';
    ctx.fillText('You are Tom the turkey. Thanksgiving is tomorrow.', C.width / 2, 420);
    ctx.fillText('Outrun the farmer, dodge the oven and the carving knives,', C.width / 2, 448);
    ctx.fillText('and reach the forest gate 3000 m away to escape.', C.width / 2, 476);

    var pulse = 0.6 + Math.sin(time * 4) * 0.4;
    ctx.fillStyle = 'rgba(255, 210, 125, ' + pulse + ')';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.fillText('Press ENTER or CLICK to run!', C.width / 2, 516);
  }

  function drawEnd(ctx, game) {
    var escaped = game.state === 'escaped';
    ctx.fillStyle = escaped ? 'rgba(20, 60, 20, 0.6)' : 'rgba(60, 16, 8, 0.62)';
    ctx.fillRect(0, 0, C.width, C.height);

    if (escaped) {
      // Confetti over the forest.
      for (var i = 0; i < 60; i++) {
        var cx = (i * 137) % C.width;
        var cy = (i * 89 + game.time * 40) % C.height;
        ctx.fillStyle = ['#e8a33c', '#c92f2f', '#7da23c', '#ffd27d'][i % 4];
        ctx.fillRect(cx, cy, 8, 5);
      }
    }

    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 58px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', C.width / 2, 140);

    ctx.fillStyle = '#fff3c4';
    ctx.font = '24px "Trebuchet MS", sans-serif';
    ctx.fillText(
      escaped
        ? 'Tom slipped through the forest gate — no dinner tonight!'
        : 'The farmer got Tom… but there is always next Thanksgiving.',
      C.width / 2, 188
    );

    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.fillText('Final score: ' + game.score, C.width / 2, 250);
    ctx.font = '20px "Trebuchet MS", sans-serif';
    ctx.fillText('Distance: ' + Math.floor(game.distance) + ' m   ·   Corn eaten: ' + game.cornEaten +
      '   ·   Best: ' + game.bestScore, C.width / 2, 286);

    var pulse = 0.6 + Math.sin(game.time * 4) * 0.4;
    ctx.fillStyle = 'rgba(255, 210, 125, ' + pulse + ')';
    ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
    ctx.fillText('Press R or CLICK to run again', C.width / 2, 350);
  }

  function drawPaused(ctx) {
    ctx.fillStyle = 'rgba(43, 26, 14, 0.55)';
    ctx.fillRect(0, 0, C.width, C.height);
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 48px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', C.width / 2, C.height / 2);
    ctx.font = '20px "Trebuchet MS", sans-serif';
    ctx.fillStyle = '#fff3c4';
    ctx.fillText('Press P to keep running', C.width / 2, C.height / 2 + 44);
  }

  // --- the frame --------------------------------------------------

  function drawFrame(ctx, game) {
    var stage = W.stageAt(game.distance);
    var time = game.time;
    drawSky(ctx, stage, time);
    drawGround(ctx, stage, game.distance * 40);

    for (var i = 0; i < game.world.corns.length; i++) {
      if (!game.world.corns[i].taken) drawCorn(ctx, game.world.corns[i]);
    }
    for (var j = 0; j < game.world.obstacles.length; j++) {
      drawObstacle(ctx, game.world.obstacles[j]);
    }

    // The farmer runs behind the turkey, on the turkey's lane.
    drawFarmer(ctx, game.farmer, game.turkey.y, time);
    drawTurkey(ctx, game.turkey, time);

    if (game.state === 'playing' || game.state === 'paused') {
      drawHud(ctx, game);
    }
    if (game.state === 'title') drawTitle(ctx, time);
    if (game.state === 'paused') drawPaused(ctx);
    if (game.state === 'escaped' || game.state === 'caught') drawEnd(ctx, game);
  }

  global.TurkeyRunRender = {
    drawFrame: drawFrame,
    drawTurkey: drawTurkey,
    drawFarmer: drawFarmer,
    drawHud: drawHud,
    drawTitle: drawTitle,
    drawEnd: drawEnd,
  };
})(typeof window !== 'undefined' ? window : globalThis);
