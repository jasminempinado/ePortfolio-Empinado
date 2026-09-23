(function () {
  'use strict';

  var typingBox = document.getElementById('typingBox');
  var typingText = document.getElementById('typingText');
  var inputEl = document.getElementById('typingInput');
  if (!typingBox || !typingText || !inputEl) return;

  var statWpm = document.getElementById('statWpm');
  var statAccuracy = document.getElementById('statAccuracy');
  var statTime = document.getElementById('statTime');
  var resultBox = document.getElementById('typingResult');
  var resultWpm = document.getElementById('resultWpm');
  var resultAccuracy = document.getElementById('resultAccuracy');
  var resultChars = document.getElementById('resultChars');
  var restartBtn = document.getElementById('restartBtn');
  var tryAgainBtn = document.getElementById('tryAgainBtn');
  var modeButtons = document.querySelectorAll('.mode-btn');

  var WORDS = ('the of and a to in is you that it he was for on are as with his they at be this from '
    + 'have or by one had not word but what some we can out other were all there when up use your how '
    + 'said an each she which do their time if will way about many then them write would like so these '
    + 'her long make thing see him two has look more day could go come did number sound no most people '
    + 'my over know water than call first who may down side been now find any new work part take get '
    + 'place made live where after back little only round man year came show every good me give our '
    + 'under name very through just form sentence great think say help low line differ turn cause much '
    + 'mean before move right boy old too same tell does set three want air well also play small end '
    + 'put home read hand port large spell add even land here must big high such follow act why ask men '
    + 'change went light kind off need house picture try us again animal point mother world near build '
    + 'self earth father head stand own page should country found answer school grow study still learn '
    + 'plant cover food sun four between state keep eye never last let thought city tree cross farm hard '
    + 'start might story saw far sea draw left late run while press close night real life few north open '
    + 'seem together next white children begin got walk example ease paper group always music those both '
    + 'mark often letter until mile river car feet care second book carry took science eat room friend '
    + 'began idea fish mountain stop once base hear horse cut sure watch color face wood main enough plain '
    + 'girl usual young ready above ever red list though feel talk bird soon body dog family direct pose '
    + 'leave song measure').split(' ');

  var state = {
    duration: 30,
    timeLeft: 30,
    started: false,
    finished: false,
    timer: null,
    target: '',
    correctChars: 0,
    totalTyped: 0
  };

  function randomWords(count) {
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    }
    return out.join(' ');
  }

  function renderTarget(text) {
    typingText.innerHTML = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i];
      frag.appendChild(span);
    }
    typingText.appendChild(frag);
    setCursor(0);
  }

  function setCursor(pos) {
    var chars = typingText.children;
    for (var i = 0; i < chars.length; i++) chars[i].classList.remove('current');
    if (chars[pos]) {
      var span = chars[pos];
      span.classList.add('current');
      // Scroll only the text container itself, never the page.
      var target = span.offsetTop - (typingText.clientHeight / 2) + (span.offsetHeight / 2);
      typingText.scrollTop = Math.max(0, target);
    }
  }

  function updateStatsLive() {
    var value = inputEl.value;
    var chars = typingText.children;
    var correct = 0;

    for (var i = 0; i < chars.length; i++) {
      var span = chars[i];
      span.classList.remove('correct', 'incorrect');
      if (i < value.length) {
        if (value[i] === state.target[i]) {
          span.classList.add('correct');
          correct++;
        } else {
          span.classList.add('incorrect');
        }
      }
    }

    state.correctChars = correct;
    state.totalTyped = value.length;
    setCursor(value.length);

    if (state.started) {
      var elapsedMinutes = (state.duration - state.timeLeft) / 60;
      if (elapsedMinutes > 0) {
        statWpm.textContent = Math.max(0, Math.round((correct / 5) / elapsedMinutes));
      }
      statAccuracy.textContent = (value.length ? Math.round((correct / value.length) * 100) : 100) + '%';
    }
  }

  function tick() {
    state.timeLeft -= 1;
    statTime.textContent = state.timeLeft;
    if (state.timeLeft <= 0) {
      finishTest();
      return;
    }
    var elapsedMinutes = (state.duration - state.timeLeft) / 60;
    statWpm.textContent = Math.max(0, Math.round((state.correctChars / 5) / elapsedMinutes));
  }

  function startTimer() {
    state.timer = window.setInterval(tick, 1000);
  }

  function finishTest() {
    if (state.finished) return;
    state.finished = true;
    window.clearInterval(state.timer);
    inputEl.disabled = true;

    var elapsedMinutes = (state.duration - state.timeLeft) / 60 || (state.duration / 60);
    var wpm = elapsedMinutes > 0 ? Math.round((state.correctChars / 5) / elapsedMinutes) : 0;
    var accuracy = state.totalTyped ? Math.round((state.correctChars / state.totalTyped) * 100) : 100;

    resultWpm.textContent = wpm;
    resultAccuracy.textContent = accuracy + '%';
    resultChars.textContent = state.totalTyped;
    statWpm.textContent = wpm;
    statAccuracy.textContent = accuracy + '%';
    resultBox.hidden = false;
  }

  function resetTest(duration) {
    window.clearInterval(state.timer);
    if (duration) state.duration = duration;
    state.timeLeft = state.duration;
    state.started = false;
    state.finished = false;
    state.correctChars = 0;
    state.totalTyped = 0;
    state.target = randomWords(220);

    inputEl.value = '';
    inputEl.disabled = false;
    renderTarget(state.target);

    statTime.textContent = state.timeLeft;
    statWpm.textContent = '0';
    statAccuracy.textContent = '100%';
    resultBox.hidden = true;

    inputEl.focus();
  }

  inputEl.addEventListener('input', function () {
    if (state.finished) return;

    if (inputEl.value.length > state.target.length) {
      inputEl.value = inputEl.value.slice(0, state.target.length);
    }

    if (!state.started) {
      state.started = true;
      startTimer();
    }

    updateStatsLive();

    if (inputEl.value.length === state.target.length) {
      finishTest();
    }
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      resetTest();
    }
  });

  typingBox.addEventListener('click', function () {
    if (!inputEl.disabled) inputEl.focus();
  });

  if (restartBtn) restartBtn.addEventListener('click', function () { resetTest(); });
  if (tryAgainBtn) tryAgainBtn.addEventListener('click', function () { resetTest(); });

  modeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      resetTest(parseInt(btn.getAttribute('data-duration'), 10));
    });
  });

  resetTest(30);
})();
