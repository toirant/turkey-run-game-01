// Turkey Run — synthesized sound, no audio files.
// Every effect is a small WebAudio oscillator phrase: a gobble for
// the turkey, a thud for a stumble, a chime for corn, a rising
// fanfare for escape, and a sad trombone-ish slide for getting caught.
// The context starts on the first user gesture, as browsers require.

(function (global) {
  'use strict';

  function createAudio() {
    var ctx = null;
    var muted = false;
    var master = null;

    function ensure() {
      if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        return true;
      }
      var AudioContext = global.AudioContext || global.webkitAudioContext;
      if (!AudioContext) return false;
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.25;
      master.connect(ctx.destination);
      return true;
    }

    function tone(freq, startAt, seconds, type, volume, slideTo) {
      if (!ctx || muted) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + startAt + seconds);
      }
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
      gain.gain.exponentialRampToValueAtTime(volume || 0.5, ctx.currentTime + startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + seconds);
      osc.connect(gain);
      gain.connect(master);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + seconds + 0.05);
    }

    function gobble() {
      if (!ensure()) return;
      // Two quick low blips, like a startled turkey.
      tone(320, 0, 0.09, 'square', 0.35, 210);
      tone(300, 0.11, 0.12, 'square', 0.35, 180);
    }

    function jump() {
      if (!ensure()) return;
      tone(280, 0, 0.16, 'sine', 0.3, 560);
    }

    function corn() {
      if (!ensure()) return;
      tone(880, 0, 0.08, 'triangle', 0.4);
      tone(1318, 0.07, 0.12, 'triangle', 0.35);
    }

    function thud() {
      if (!ensure()) return;
      tone(140, 0, 0.22, 'sawtooth', 0.5, 60);
      tone(90, 0.05, 0.25, 'square', 0.4, 45);
    }

    function dash() {
      if (!ensure()) return;
      tone(500, 0, 0.18, 'sawtooth', 0.25, 1100);
    }

    function stageClear() {
      if (!ensure()) return;
      tone(523, 0, 0.12, 'triangle', 0.4);
      tone(659, 0.11, 0.12, 'triangle', 0.4);
      tone(784, 0.22, 0.2, 'triangle', 0.4);
    }

    function escaped() {
      if (!ensure()) return;
      var notes = [523, 659, 784, 1047, 784, 1047, 1319];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], i * 0.13, 0.18, 'triangle', 0.4);
      }
    }

    function caught() {
      if (!ensure()) return;
      // A slow descending slide: dinner is served.
      tone(392, 0, 0.3, 'sawtooth', 0.35, 370);
      tone(370, 0.3, 0.3, 'sawtooth', 0.35, 349);
      tone(349, 0.6, 0.55, 'sawtooth', 0.35, 233);
    }

    function farmerClose() {
      if (!ensure()) return;
      tone(196, 0, 0.14, 'square', 0.3, 180);
      tone(196, 0.18, 0.14, 'square', 0.3, 180);
    }

    return {
      unlock: ensure,
      gobble: gobble,
      jump: jump,
      corn: corn,
      thud: thud,
      dash: dash,
      stageClear: stageClear,
      escaped: escaped,
      caught: caught,
      farmerClose: farmerClose,
      toggleMute: function () {
        muted = !muted;
        return muted;
      },
      isMuted: function () {
        return muted;
      },
    };
  }

  global.TurkeyRunAudio = { createAudio: createAudio };
})(typeof window !== 'undefined' ? window : globalThis);
