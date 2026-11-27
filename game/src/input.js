// Turkey Run — keyboard and mouse input.
// Keyboard: arrows/WASD switch lanes, Space jumps, Shift dashes,
// P pauses, M mutes, R restarts, Enter starts.
// Mouse: moving the pointer picks a lane, click jumps, double-click
// dashes. Every press is consumed once by the game loop.

(function (global) {
  'use strict';

  function createInput(canvas) {
    var pressed = {};
    var queue = [];
    var mouse = { x: 0, y: 0, inside: false };

    function push(action) {
      queue.push(action);
    }

    function keyAction(code) {
      switch (code) {
        case 'ArrowUp': case 'KeyW': return 'up';
        case 'ArrowDown': case 'KeyS': return 'down';
        case 'ArrowLeft': case 'KeyA': return 'left';
        case 'ArrowRight': case 'KeyD': return 'right';
        case 'Space': return 'jump';
        case 'ShiftLeft': case 'ShiftRight': return 'dash';
        case 'KeyP': return 'pause';
        case 'KeyM': return 'mute';
        case 'KeyR': return 'restart';
        case 'Enter': return 'start';
        default: return null;
      }
    }

    function onKeyDown(event) {
      var action = keyAction(event.code);
      if (!action) return;
      if (action === 'jump' || action === 'up' || action === 'down') {
        event.preventDefault();
      }
      if (!pressed[event.code]) push(action);
      pressed[event.code] = true;
    }

    function onKeyUp(event) {
      pressed[event.code] = false;
    }

    function canvasPoint(event) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    function onMouseMove(event) {
      var p = canvasPoint(event);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.inside = true;
    }

    function onMouseDown(event) {
      var p = canvasPoint(event);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.inside = true;
      push('jump');
    }

    function onDoubleClick() {
      push('dash');
    }

    function onBlur() {
      for (var code in pressed) pressed[code] = false;
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('dblclick', onDoubleClick);

    return {
      // Drain the actions pressed since the last frame, in order.
      drain: function () {
        var actions = queue;
        queue = [];
        return actions;
      },
      mouse: mouse,
      isDown: function (code) {
        return !!pressed[code];
      },
    };
  }

  global.TurkeyRunInput = { createInput: createInput };
})(typeof window !== 'undefined' ? window : globalThis);
