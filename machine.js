/* =========================================================
   machine.js — the machine, and the game underneath it
   Both live in this file because they are both the same page.
   ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     1. The machine
     One state machine:
     off → on → reaching → pushed back → retracting → off
     ========================================================= */

  var machine  = document.getElementById('machine');
  var switcher = document.getElementById('mSwitch');
  var mStatus  = document.getElementById('mStatus');
  var mCount   = document.getElementById('mCount');
  var mReset   = document.getElementById('mReset');

  var rejects = 0;
  var busy = false;

  function say(text) {
    if (mStatus) mStatus.textContent = text;
  }

  if (machine && switcher) {
    switcher.addEventListener('click', function () {
      // already moving, or already on: pretend not to have heard
      if (busy || machine.classList.contains('is-on')) return;
      busy = true;

      machine.classList.add('is-on');
      switcher.setAttribute('aria-pressed', 'true');
      say('It is on. The machine is deciding whether to bother with you…');

      // 700ms: something moves inside the box
      setTimeout(function () {
        machine.classList.add('is-working');
        say('Something moved in there.');
      }, 700);

      // 1450ms: the hand pushes the switch back down
      setTimeout(function () {
        machine.classList.add('is-flip');
        machine.classList.remove('is-on');
        switcher.setAttribute('aria-pressed', 'false');
        rejects += 1;
        if (mCount) mCount.textContent = rejects;
        say('Clack. It pushed the switch back down.');
      }, 1450);

      // 2350ms: the hand goes home
      setTimeout(function () {
        machine.classList.remove('is-working');
        say('See? It only knows the one trick.');
      }, 2350);

      setTimeout(function () {
        machine.classList.remove('is-flip');
        busy = false;
      }, 2700);
    });
  }

  if (mReset) {
    mReset.addEventListener('click', function () {
      rejects = 0;
      if (mCount) mCount.textContent = '0';
      say('Back to zero. It does not hold grudges.');
    });
  }

  /* =========================================================
     2. The game: keep your hands off it for fifteen seconds
     ========================================================= */

  var gBtn    = document.getElementById('gBtn');
  var gFill   = document.getElementById('gFill');
  var gClock  = document.getElementById('gClock');
  var gBar    = document.getElementById('gBar');
  var gStatus = document.getElementById('gStatus');
  var gFails  = document.getElementById('gFails');

  if (!gBtn) return;

  var DURATION = 15000;          // fifteen seconds
  var running  = false;
  var startAt  = 0;
  var rafId    = null;
  var teaseId  = null;
  var fails    = 0;

  var TEASES = [
    'Don\u2019t…',
    'Just once',
    'You want to',
    'Look at me',
    'It does not bite',
    'One last time',
    'Still here?'
  ];

  function paint(remaining) {
    var done = 1 - remaining / DURATION;
    if (done < 0) done = 0;
    if (done > 1) done = 1;
    gFill.style.width = (done * 100) + '%';
    gBar.setAttribute('aria-valuenow', String(Math.round(done * 100)));
    gClock.textContent = (remaining / 1000).toFixed(1);
  }

  function stopTeasing() {
    if (teaseId) {
      clearInterval(teaseId);
      teaseId = null;
    }
    gBtn.classList.remove('is-wobble');
    gBtn.classList.remove('is-armed');
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    stopTeasing();
  }

  function tick() {
    var remaining = DURATION - (performance.now() - startAt);
    if (remaining <= 0) {
      win();
      return;
    }
    paint(remaining);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    running = true;
    startAt = performance.now();
    gBtn.textContent = 'Hands off';
    gBtn.classList.add('is-armed');
    gStatus.textContent = 'It has started. Do not touch it.';
    paint(DURATION);

    var i = 0;
    teaseId = setInterval(function () {
      i = (i + 1) % TEASES.length;
      gBtn.textContent = TEASES[i];
      gBtn.classList.remove('is-wobble');
      void gBtn.offsetWidth;          // so the wobble replays
      gBtn.classList.add('is-wobble');
    }, 2100);

    rafId = requestAnimationFrame(tick);
  }

  function win() {
    stop();
    paint(0);
    gClock.textContent = '0.0';
    gBtn.textContent = 'Survive it again';
    gStatus.textContent = 'Fifteen seconds. You win — the machine is a little disappointed.';
  }

  function lose() {
    stop();
    paint(DURATION);
    fails += 1;
    if (gFails) gFails.textContent = fails;
    gBtn.textContent = 'Try again';
    gStatus.textContent = fails === 1
      ? 'You could not help it. I am counting.'
      : 'You pressed it again. That is ' + fails + ' times now.';
  }

  gBtn.addEventListener('click', function () {
    if (running) {
      lose();
    } else {
      start();
    }
  });
})();
