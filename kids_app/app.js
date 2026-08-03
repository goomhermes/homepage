(function () {
  "use strict";

  const translations = {
    welcome: "꼬마 숫자 친구, 안녕!",
    appTitle: "숫자 정원",
    tagline: "숫자를 듣고, 세고, 신나게 놀아요!",
    easyActivities: "1부터 10까지",
    chooseActivity: "무엇을 해 볼까요?",
    readLearn: "숫자 읽기",
    readLearnDesc: "숫자를 누르고 소리를 들어요",
    readQuiz: "숫자 퀴즈",
    readQuizDesc: "소리를 듣고 알맞은 숫자를 찾아요",
    countQuiz: "숫자세기 퀴즈",
    countQuizDesc: "그림이 몇 개인지 세어 봐요",
    back: "뒤로",
    tapANumber: "숫자를 눌러요",
    hearIt: "어떻게 읽는지 들어 봐요!",
    yourTurn: "해 볼까요?",
    listenCarefully: "잘 들어 보세요!",
    whichNumber: "어떤 숫자가 들렸나요?",
    tapToListen: "눌러서 듣기",
    playNumber: "숫자 듣기",
    correct: "정답이에요!",
    niceTry: "다시 생각해 봐요!",
    howMany: "모두 몇 개일까요?",
    questionProgress: "{total}문제 중 {current}번째",
    allDone: "모두 풀었어요!",
    amazingTitle: "정말 멋져요!",
    greatTitle: "아주 잘했어요!",
    practiceTitle: "계속 세어 봐요!",
    amazingMessage: "숫자를 정말 멋지게 셌어요!",
    greatMessage: "숫자 세기 실력이 쑥쑥 자라고 있어요!",
    practiceMessage: "다시 해 볼수록 숫자 세기가 쉬워져요.",
    amazingListenTitle: "정말 잘 들었어요!",
    greatListenTitle: "귀가 쫑긋, 잘했어요!",
    practiceListenTitle: "한 번 더 들어 봐요!",
    amazingListenMessage: "숫자 소리를 모두 척척 찾아냈어요!",
    greatListenMessage: "숫자 소리를 아주 잘 구별했어요!",
    practiceListenMessage: "다시 들을수록 숫자 소리가 더 익숙해져요.",
    playAgain: "한 번 더",
    mainMenu: "처음으로",
    enterFullscreen: "전체 화면",
    exitFullscreen: "전체 화면 종료",
    fullscreenUnavailable: "이 기기에서는 전체 화면을 사용할 수 없어요.",
    audioPreparing: "이 소리는 준비 중이에요."
  };

  const countingWords = {
    en: ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    "ko-sino": ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십"],
    "ko-native": ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열"]
  };

  const screens = [...document.querySelectorAll("[data-screen]")];
  const speechPlayer = document.getElementById("speech-player");
  const learnGrid = document.getElementById("learn-number-grid");
  const readQuestionPanel = document.getElementById("read-question-panel");
  const readResultPanel = document.getElementById("read-result-panel");
  const quizPlayButton = document.getElementById("quiz-play-button");
  const quizChoices = document.getElementById("read-quiz-choices");
  const quizFeedback = document.getElementById("read-quiz-feedback");
  const readProgressText = document.getElementById("read-progress-text");
  const readProgressBar = document.getElementById("read-progress-bar");
  const readProgressTrack = document.getElementById("read-progress-track");
  const readScoreChip = document.getElementById("read-score-chip");
  const readDanceVideo = document.getElementById("read-result-dance-video");
  const readFriendDanceVideo = document.getElementById("read-result-friend-dance-video");
  const countPanel = document.getElementById("count-question-panel");
  const resultPanel = document.getElementById("count-result-panel");
  const objectStage = document.getElementById("object-stage");
  const countChoices = document.getElementById("count-answer-choices");
  const countFeedback = document.getElementById("count-feedback");
  const progressText = document.getElementById("count-progress-text");
  const progressBar = document.getElementById("count-progress-bar");
  const progressTrack = document.getElementById("count-progress-track");
  const scoreChip = document.getElementById("count-score-chip");
  const countDanceVideo = document.getElementById("count-result-dance-video");
  const countFriendDanceVideo = document.getElementById("count-result-friend-dance-video");
  const fullscreenButton = document.getElementById("fullscreen-button");
  const fullscreenLabel = document.getElementById("fullscreen-label");
  const answerEffectLayer = document.getElementById("answer-effect-layer");
  const toast = document.getElementById("toast");

  const state = {
    countingMode: "en",
    route: "menu",
    activeAudioElement: null,
    readQuiz: { index: 0, total: 10, score: 0, target: 1, choices: [], answered: false, questionOrder: [] },
    countQuiz: { index: 0, total: 10, score: 0, target: 1, choices: [], answered: false, lastTarget: 0, theme: "star" },
    toastTimer: null,
    transitionTimer: null
  };

  function t(key, values) {
    let value = translations[key] || key;
    if (values) {
      Object.entries(values).forEach(([name, replacement]) => {
        value = value.replace(`{${name}}`, String(replacement));
      });
    }
    return value;
  }

  function applyTranslations() {
    document.documentElement.lang = "ko";
    document.title = t("appTitle");
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    quizPlayButton.setAttribute("aria-label", t("playNumber"));
    updateReadProgress();
    updateCountProgress();
    updateFullscreenButton();
  }

  function syncAppHeight() {
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return;
    document.documentElement.style.setProperty("--app-height", `${Math.floor(viewportHeight)}px`);
  }

  function scheduleAppHeightSync() {
    syncAppHeight();
    window.requestAnimationFrame(syncAppHeight);
  }

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function updateFullscreenButton() {
    if (!fullscreenButton || !fullscreenLabel) return;
    const active = Boolean(fullscreenElement());
    fullscreenButton.classList.toggle("is-active", active);
    fullscreenButton.setAttribute("aria-pressed", String(active));
    fullscreenLabel.textContent = t(active ? "exitFullscreen" : "enterFullscreen");
  }

  async function toggleFullscreen() {
    const root = document.documentElement;
    try {
      if (fullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      } else {
        showToast(t("fullscreenUnavailable"));
      }
    } catch (_) {
      showToast(t("fullscreenUnavailable"));
    }
    updateFullscreenButton();
  }

  function stopDanceVideos() {
    [readDanceVideo, readFriendDanceVideo, countDanceVideo, countFriendDanceVideo].forEach((video) => {
      if (!video) return;
      video.pause();
      try { video.currentTime = 0; } catch (_) { /* Metadata may not be ready yet. */ }
    });
  }

  function playDanceVideo(video) {
    if (!video) return;
    try { video.currentTime = 0; } catch (_) { /* Metadata may not be ready yet. */ }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => { /* The poster remains visible if autoplay is unavailable. */ });
    }
  }

  function normalizeRoute(value) {
    const route = String(value || "").replace(/^#\/?/, "");
    return ["read-learn", "read-quiz", "count-quiz"].includes(route) ? route : "menu";
  }

  function goTo(route) {
    const normalized = normalizeRoute(route);
    if (normalizeRoute(window.location.hash) === normalized) {
      showScreen(normalized);
      return;
    }
    window.location.hash = normalized === "menu" ? "" : normalized;
  }

  function showScreen(route) {
    route = normalizeRoute(route);
    clearTimeout(state.transitionTimer);
    stopSpeech();
    stopDanceVideos();
    clearAnswerEffects();
    document.body.classList.remove("celebrating");
    state.route = route;
    screens.forEach((screen) => {
      const active = screen.dataset.screen === route;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
    });
    window.scrollTo(0, 0);
    if (route === "read-quiz") startReadQuiz();
    if (route === "count-quiz") startCountQuiz();
  }

  function setCountingMode(mode, sourceScreen) {
    if (!countingWords[mode]) return;
    stopSpeech();
    state.countingMode = mode;
    document.querySelectorAll(".mode-picker").forEach((picker) => {
      picker.querySelectorAll("[data-counting-mode]").forEach((button) => {
        const active = button.dataset.countingMode === mode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    });
    renderLearnGrid();
    playUiTone("tap");
    if (sourceScreen === "read-quiz" || state.route === "read-quiz") {
      quizFeedback.textContent = "";
      quizFeedback.className = "feedback-space";
    }
  }

  function audioPath(number) {
    return `assets/audio/${state.countingMode}/${String(number).padStart(2, "0")}.mp3`;
  }

  function stopSpeech() {
    speechPlayer.pause();
    speechPlayer.removeAttribute("src");
    speechPlayer.load();
    clearAudioState();
  }

  function clearAudioState() {
    if (state.activeAudioElement) state.activeAudioElement.classList.remove("is-playing");
    state.activeAudioElement = null;
    quizPlayButton.classList.remove("is-playing");
  }

  function playNumber(number, activeElement) {
    speechPlayer.pause();
    clearAudioState();
    state.activeAudioElement = activeElement || null;
    if (activeElement) activeElement.classList.add("is-playing");
    if (state.route === "read-quiz") quizPlayButton.classList.add("is-playing");
    speechPlayer.src = audioPath(number);
    speechPlayer.load();
    speechPlayer.currentTime = 0;
    const playPromise = speechPlayer.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        clearAudioState();
        showToast(t("audioPreparing"));
      });
    }
  }

  speechPlayer.addEventListener("ended", clearAudioState);
  speechPlayer.addEventListener("error", () => {
    clearAudioState();
    showToast(t("audioPreparing"));
  });

  function renderLearnGrid() {
    learnGrid.innerHTML = "";
    for (let number = 1; number <= 10; number += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "number-button";
      button.textContent = String(number);
      button.setAttribute("aria-label", `${number}, ${countingWords[state.countingMode][number]}`);
      button.addEventListener("click", () => playNumber(number, button));
      learnGrid.appendChild(button);
    }
  }

  function startReadQuiz() {
    clearTimeout(state.transitionTimer);
    stopDanceVideos();
    readQuestionPanel.hidden = false;
    readResultPanel.hidden = true;
    document.body.classList.remove("celebrating");
    state.readQuiz.index = 0;
    state.readQuiz.score = 0;
    state.readQuiz.answered = false;
    state.readQuiz.questionOrder = shuffle(Array.from({ length: 10 }, (_, index) => index + 1));
    prepareReadQuestion();
  }

  function prepareReadQuestion() {
    stopSpeech();
    clearAnswerEffects();
    quizFeedback.textContent = "";
    quizFeedback.className = "feedback-space";
    const quiz = state.readQuiz;
    quiz.target = quiz.questionOrder[quiz.index];
    quiz.choices = makeChoices(quiz.target, 4);
    quiz.answered = false;
    renderReadChoices();
    updateReadProgress();
  }

  function renderReadChoices() {
    quizChoices.innerHTML = "";
    state.readQuiz.choices.forEach((number) => {
      const button = makeAnswerButton(number);
      button.addEventListener("click", () => answerReadQuiz(number, button));
      quizChoices.appendChild(button);
    });
  }

  function answerReadQuiz(number, button) {
    const quiz = state.readQuiz;
    if (quiz.answered) return;
    quiz.answered = true;
    const correct = number === quiz.target;
    if (correct) quiz.score += 1;
    stopSpeech();
    button.classList.add(correct ? "is-correct" : "is-wrong");
    quizFeedback.textContent = correct ? t("correct") : t("niceTry");
    quizFeedback.classList.add(correct ? "is-correct" : "is-wrong");
    if (!correct) {
      [...quizChoices.children].find((choice) => Number(choice.dataset.value) === quiz.target)?.classList.add("is-correct");
    }
    showAnswerEffect(button, correct);
    readScoreChip.innerHTML = `<span aria-hidden="true">★</span> ${quiz.score}`;
    playUiTone(correct ? "correct" : "wrong");
    state.transitionTimer = setTimeout(() => {
      quiz.index += 1;
      if (quiz.index >= quiz.total) {
        showReadResult();
      } else {
        prepareReadQuestion();
      }
    }, correct ? 850 : 1150);
  }

  function updateReadProgress() {
    if (!readProgressText) return;
    const current = Math.min(state.readQuiz.index + 1, state.readQuiz.total);
    readProgressText.textContent = t("questionProgress", { current, total: state.readQuiz.total });
    readProgressBar.style.width = `${(current / state.readQuiz.total) * 100}%`;
    readProgressTrack.setAttribute("aria-valuenow", String(current));
    readScoreChip.innerHTML = `<span aria-hidden="true">★</span> ${state.readQuiz.score}`;
  }

  function showReadResult() {
    stopSpeech();
    readQuestionPanel.hidden = true;
    readResultPanel.hidden = false;
    renderReadResult();
    playDanceVideo(readDanceVideo);
    playDanceVideo(readFriendDanceVideo);
    if (state.readQuiz.score >= 8) {
      document.body.classList.add("celebrating");
      createConfetti("read-confetti-field");
      playUiTone("celebrate");
    } else {
      playUiTone("complete");
    }
  }

  function renderReadResult() {
    const score = state.readQuiz.score;
    const high = score >= 8;
    const medium = score >= 5 && score < 8;
    document.getElementById("read-result-title").textContent = high ? t("amazingListenTitle") : medium ? t("greatListenTitle") : t("practiceListenTitle");
    document.getElementById("read-result-score").textContent = String(score);
    document.getElementById("read-result-message").textContent = high ? t("amazingListenMessage") : medium ? t("greatListenMessage") : t("practiceListenMessage");
    const stars = Math.max(1, Math.ceil(score / 2));
    document.getElementById("read-result-stars").innerHTML = Array.from({ length: 5 }, (_, index) => `<span class="${index < stars ? "earned" : ""}" style="--i:${index}">★</span>`).join("");
  }

  function startCountQuiz() {
    clearTimeout(state.transitionTimer);
    stopDanceVideos();
    countPanel.hidden = false;
    resultPanel.hidden = true;
    document.body.classList.remove("celebrating");
    state.countQuiz.index = 0;
    state.countQuiz.score = 0;
    state.countQuiz.lastTarget = 0;
    state.countQuiz.answered = false;
    prepareCountQuestion();
  }

  function prepareCountQuestion() {
    const quiz = state.countQuiz;
    clearAnswerEffects();
    countFeedback.textContent = "";
    countFeedback.className = "feedback-space";
    quiz.target = randomNumber(1, 10, [quiz.lastTarget]);
    quiz.lastTarget = quiz.target;
    quiz.choices = makeChoices(quiz.target, 3);
    quiz.answered = false;
    const themes = ["star", "apple", "fish", "flower", "gem", "balloon"];
    quiz.theme = themes[quiz.index % themes.length];
    renderCountObjects();
    renderCountChoices();
    updateCountProgress();
  }

  function renderCountObjects() {
    const count = state.countQuiz.target;
    const columns = count <= 3 ? count : count <= 6 ? 3 : count <= 8 ? 4 : 5;
    objectStage.style.setProperty("--columns", columns);
    objectStage.setAttribute("aria-label", `세어 볼 그림 ${count}개`);
    objectStage.innerHTML = "";
    for (let index = 0; index < count; index += 1) {
      const item = document.createElement("span");
      item.className = "count-object";
      item.style.setProperty("--i", index);
      item.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#object-${state.countQuiz.theme}"></use></svg>`;
      objectStage.appendChild(item);
    }
  }

  function renderCountChoices() {
    countChoices.innerHTML = "";
    state.countQuiz.choices.forEach((number) => {
      const button = makeAnswerButton(number);
      button.addEventListener("click", () => answerCountQuiz(number, button));
      countChoices.appendChild(button);
    });
  }

  function answerCountQuiz(number, button) {
    const quiz = state.countQuiz;
    if (quiz.answered) return;
    quiz.answered = true;
    const correct = number === quiz.target;
    if (correct) quiz.score += 1;
    button.classList.add(correct ? "is-correct" : "is-wrong");
    countFeedback.textContent = correct ? t("correct") : t("niceTry");
    countFeedback.classList.add(correct ? "is-correct" : "is-wrong");
    if (!correct) {
      [...countChoices.children].find((choice) => Number(choice.dataset.value) === quiz.target)?.classList.add("is-correct");
    }
    showAnswerEffect(button, correct);
    scoreChip.innerHTML = `<span aria-hidden="true">★</span> ${quiz.score}`;
    playUiTone(correct ? "correct" : "wrong");
    state.transitionTimer = setTimeout(() => {
      quiz.index += 1;
      if (quiz.index >= quiz.total) {
        showCountResult();
      } else {
        prepareCountQuestion();
      }
    }, correct ? 800 : 1100);
  }

  function updateCountProgress() {
    if (!progressText) return;
    const current = Math.min(state.countQuiz.index + 1, state.countQuiz.total);
    progressText.textContent = t("questionProgress", { current, total: state.countQuiz.total });
    progressBar.style.width = `${(current / state.countQuiz.total) * 100}%`;
    progressTrack.setAttribute("aria-valuenow", String(current));
    scoreChip.innerHTML = `<span aria-hidden="true">★</span> ${state.countQuiz.score}`;
  }

  function showCountResult() {
    countPanel.hidden = true;
    resultPanel.hidden = false;
    renderCountResult();
    playDanceVideo(countDanceVideo);
    playDanceVideo(countFriendDanceVideo);
    if (state.countQuiz.score >= 8) {
      document.body.classList.add("celebrating");
      createConfetti("confetti-field");
      playUiTone("celebrate");
    } else {
      playUiTone("complete");
    }
  }

  function renderCountResult() {
    const score = state.countQuiz.score;
    const high = score >= 8;
    const medium = score >= 5 && score < 8;
    document.getElementById("result-title").textContent = high ? t("amazingTitle") : medium ? t("greatTitle") : t("practiceTitle");
    document.getElementById("result-score").textContent = String(score);
    document.getElementById("result-message").textContent = high ? t("amazingMessage") : medium ? t("greatMessage") : t("practiceMessage");
    const stars = Math.max(1, Math.ceil(score / 2));
    document.getElementById("result-stars").innerHTML = Array.from({ length: 5 }, (_, index) => `<span class="${index < stars ? "earned" : ""}" style="--i:${index}">★</span>`).join("");
  }

  function makeAnswerButton(number) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.value = String(number);
    button.textContent = String(number);
    return button;
  }

  function makeChoices(target, total) {
    const values = new Set([target]);
    const nearby = [target - 1, target + 1, target - 2, target + 2].filter((value) => value >= 1 && value <= 10);
    shuffle(nearby).forEach((value) => { if (values.size < total) values.add(value); });
    while (values.size < total) values.add(randomNumber(1, 10, [...values]));
    return shuffle([...values]);
  }

  function randomNumber(min, max, excluded) {
    const blocked = new Set(excluded || []);
    const options = [];
    for (let value = min; value <= max; value += 1) if (!blocked.has(value)) options.push(value);
    return options[Math.floor(Math.random() * options.length)];
  }

  function shuffle(values) {
    const result = values.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function showToast(message) {
    clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    state.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function clearAnswerEffects() {
    if (answerEffectLayer) answerEffectLayer.innerHTML = "";
  }

  function showAnswerEffect(button, correct) {
    if (!answerEffectLayer || !button || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const rect = button.getBoundingClientRect();
    const effect = document.createElement("span");
    effect.className = `answer-effect ${correct ? "mini-confetti-effect" : "bomb-effect"}`;
    effect.style.left = `${rect.left + rect.width / 2}px`;
    effect.style.top = `${rect.top + rect.height / 2}px`;

    if (correct) {
      const colors = ["#ff4f9a", "#ffd43e", "#55cdee", "#6659e7", "#52c976", "#ff884d"];
      for (let index = 0; index < 14; index += 1) {
        const piece = document.createElement("span");
        piece.className = "mini-confetti-piece";
        piece.style.setProperty("--piece-color", colors[index % colors.length]);
        piece.style.setProperty("--piece-x", `${-84 + Math.random() * 168}px`);
        piece.style.setProperty("--piece-y", `${-42 - Math.random() * 78}px`);
        piece.style.setProperty("--piece-spin", `${220 + Math.random() * 500}deg`);
        piece.style.setProperty("--piece-delay", `${Math.random() * 70}ms`);
        effect.appendChild(piece);
      }
    } else {
      effect.innerHTML = [
        '<span class="bomb-symbol">💣</span>',
        '<span class="bomb-ring"></span>',
        '<span class="bomb-blast">💥</span>',
        '<span class="bomb-smoke smoke-one"></span>',
        '<span class="bomb-smoke smoke-two"></span>',
        '<span class="bomb-smoke smoke-three"></span>'
      ].join("");
    }

    answerEffectLayer.appendChild(effect);
    setTimeout(() => effect.remove(), 950);
  }

  function scheduleTone(context, output, frequency, delay, duration, volume, waveType, endFrequency) {
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = waveType || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(.018, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(output);
    oscillator.start(start);
    oscillator.stop(start + duration + .03);
  }

  function scheduleNoise(context, output, delay, duration, volume) {
    const start = context.currentTime + delay;
    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      const fade = Math.pow(1 - index / frameCount, 1.8);
      data[index] = (Math.random() * 2 - 1) * fade;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1300, start);
    filter.frequency.exponentialRampToValueAtTime(180, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(output);
    source.start(start);
    source.stop(start + duration + .03);
  }

  function playUiTone(type) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const context = playUiTone.context || (playUiTone.context = new AudioContextClass());
      if (context.state === "suspended") context.resume().catch(() => {});
      if (!playUiTone.output) {
        const master = context.createGain();
        const compressor = context.createDynamicsCompressor();
        master.gain.value = .72;
        compressor.threshold.value = -20;
        compressor.knee.value = 14;
        compressor.ratio.value = 6;
        compressor.attack.value = .004;
        compressor.release.value = .18;
        master.connect(compressor).connect(context.destination);
        playUiTone.output = master;
      }
      const output = playUiTone.output;

      if (type === "correct") {
        [[523, 0, .18, .075], [659, .09, .21, .08], [784, .18, .28, .09]].forEach(([frequency, delay, duration, volume]) => {
          scheduleTone(context, output, frequency, delay, duration, volume, "sine");
          scheduleTone(context, output, frequency * 2, delay, duration * .72, volume * .24, "triangle");
        });
      } else if (type === "wrong") {
        scheduleTone(context, output, 175, 0, .42, .11, "triangle", 55);
        scheduleTone(context, output, 92, .025, .5, .075, "sine", 46);
        scheduleNoise(context, output, .035, .34, .075);
      } else if (type === "celebrate") {
        [[523, 0], [659, .09], [784, .18], [1047, .3], [1319, .43], [1568, .52]].forEach(([frequency, delay], index) => {
          scheduleTone(context, output, frequency, delay, index > 3 ? .3 : .24, index > 3 ? .045 : .075, index % 2 ? "triangle" : "sine");
        });
      } else if (type === "complete") {
        scheduleTone(context, output, 392, 0, .22, .065, "sine");
        scheduleTone(context, output, 523, .12, .3, .075, "sine");
        scheduleTone(context, output, 659, .23, .34, .055, "triangle");
      } else {
        scheduleTone(context, output, 520, 0, .075, .035, "triangle", 640);
      }
    } catch (_) { /* Audio feedback is an enhancement. */ }
  }

  function createConfetti(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const colors = ["#ff4f9a", "#ffd43e", "#55cdee", "#6659e7", "#52c976"];
    field.innerHTML = "";
    for (let index = 0; index < 36; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${3 + Math.random() * 94}%`;
      piece.style.setProperty("--color", colors[index % colors.length]);
      piece.style.setProperty("--rotation", `${Math.random() * 180}deg`);
      piece.style.setProperty("--drift", `${-45 + Math.random() * 90}px`);
      piece.style.setProperty("--duration", `${1.25 + Math.random() * .9}s`);
      piece.style.setProperty("--delay", `${Math.random() * .5}s`);
      field.appendChild(piece);
    }
  }

  function installImageFallbacks() {
    document.addEventListener("error", (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || !image.dataset.fallback || image.dataset.fallbackUsed) return;
      image.dataset.fallbackUsed = "true";
      image.src = image.dataset.fallback;
    }, true);
  }

  document.addEventListener("click", (event) => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      playUiTone("tap");
      goTo(routeButton.dataset.route);
      return;
    }
    const modeButton = event.target.closest("[data-counting-mode]");
    if (modeButton) {
      setCountingMode(modeButton.dataset.countingMode, modeButton.closest("[data-screen]")?.dataset.screen);
    }
  });

  quizPlayButton.addEventListener("click", () => playNumber(state.readQuiz.target, quizPlayButton));
  fullscreenButton.addEventListener("click", () => {
    playUiTone("tap");
    toggleFullscreen();
  });
  document.getElementById("read-play-again-button").addEventListener("click", () => {
    playUiTone("tap");
    startReadQuiz();
  });
  document.getElementById("play-again-button").addEventListener("click", () => {
    playUiTone("tap");
    startCountQuiz();
  });
  window.addEventListener("hashchange", () => showScreen(window.location.hash));
  window.addEventListener("resize", scheduleAppHeightSync, { passive: true });
  window.addEventListener("orientationchange", scheduleAppHeightSync, { passive: true });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", scheduleAppHeightSync, { passive: true });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  document.addEventListener("fullscreenchange", scheduleAppHeightSync);
  document.addEventListener("webkitfullscreenchange", scheduleAppHeightSync);

  syncAppHeight();
  installImageFallbacks();
  renderLearnGrid();
  applyTranslations();
  showScreen(window.location.hash);
})();
