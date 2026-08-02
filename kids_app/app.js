(function () {
  "use strict";

  const translations = {
    en: {
      welcome: "Welcome, little counter!",
      appTitle: "Number Garden",
      tagline: "Let’s count, listen, and play!",
      startHere: "Start here",
      chooseLevel: "Choose a level",
      easyTitle: "Easy",
      easyRange: "First numbers",
      ready: "Let’s play!",
      hardTitle: "Big Numbers",
      hardRange: "More numbers",
      comingLater: "Coming later",
      easyActivities: "Easy · 1–10",
      chooseActivity: "What shall we play?",
      readLearn: "Learn to Read",
      readLearnDesc: "Tap a number and listen",
      readQuiz: "Listening Quiz",
      readQuizDesc: "Listen, then find the number",
      countQuiz: "Counting Quiz",
      countQuizDesc: "Count the pictures",
      appLanguage: "App language",
      back: "Back",
      tapANumber: "Tap a number",
      hearIt: "and hear how it sounds!",
      yourTurn: "Your turn!",
      listenCarefully: "Listen carefully!",
      whichNumber: "Which number do you hear?",
      tapToListen: "Tap to listen",
      playNumber: "Play number",
      correct: "That’s right!",
      niceTry: "Nice try!",
      howMany: "How many can you see?",
      questionProgress: "Question {current} of {total}",
      allDone: "All done!",
      amazingTitle: "Amazing counting!",
      greatTitle: "Great work!",
      practiceTitle: "Keep counting!",
      amazingMessage: "You counted like a number superstar!",
      greatMessage: "You’re getting really good at counting!",
      practiceMessage: "Every try makes your counting stronger.",
      playAgain: "Play again",
      mainMenu: "Main menu",
      audioPreparing: "This sound is being prepared."
    },
    ko: {
      welcome: "꼬마 숫자 친구, 안녕!",
      appTitle: "숫자 정원",
      tagline: "숫자를 듣고, 세고, 신나게 놀아요!",
      startHere: "여기서 시작해요",
      chooseLevel: "레벨을 골라요",
      easyTitle: "쉬워요",
      easyRange: "처음 만나는 숫자",
      ready: "놀아 볼까요!",
      hardTitle: "큰 숫자",
      hardRange: "더 많은 숫자",
      comingLater: "나중에 만나요",
      easyActivities: "쉬워요 · 1–10",
      chooseActivity: "무엇을 해 볼까요?",
      readLearn: "숫자 읽기",
      readLearnDesc: "숫자를 누르고 들어 봐요",
      readQuiz: "소리 듣기 퀴즈",
      readQuizDesc: "듣고 알맞은 숫자를 찾아요",
      countQuiz: "숫자 세기 퀴즈",
      countQuizDesc: "그림이 몇 개인지 세어 봐요",
      appLanguage: "앱 언어",
      back: "뒤로",
      tapANumber: "숫자를 눌러요",
      hearIt: "어떻게 읽는지 들어 봐요!",
      yourTurn: "해 볼까요?",
      listenCarefully: "잘 들어 보세요!",
      whichNumber: "어떤 숫자가 들렸나요?",
      tapToListen: "눌러서 듣기",
      playNumber: "숫자 듣기",
      correct: "정답이에요!",
      niceTry: "잘했어요!",
      howMany: "모두 몇 개일까요?",
      questionProgress: "{total}문제 중 {current}번째",
      allDone: "모두 풀었어요!",
      amazingTitle: "정말 멋져요!",
      greatTitle: "아주 잘했어요!",
      practiceTitle: "계속 세어 봐요!",
      amazingMessage: "숫자를 정말 멋지게 셌어요!",
      greatMessage: "숫자 세기 실력이 쑥쑥 자라고 있어요!",
      practiceMessage: "다시 해 볼수록 숫자 세기가 쉬워져요.",
      playAgain: "한 번 더",
      mainMenu: "처음으로",
      audioPreparing: "이 소리는 준비 중이에요."
    }
  };

  const countingWords = {
    en: ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    "ko-sino": ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십"],
    "ko-native": ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉", "열"]
  };

  const screens = [...document.querySelectorAll("[data-screen]")];
  const speechPlayer = document.getElementById("speech-player");
  const learnGrid = document.getElementById("learn-number-grid");
  const quizPlayButton = document.getElementById("quiz-play-button");
  const quizChoices = document.getElementById("read-quiz-choices");
  const quizFeedback = document.getElementById("read-quiz-feedback");
  const countPanel = document.getElementById("count-question-panel");
  const resultPanel = document.getElementById("count-result-panel");
  const objectStage = document.getElementById("object-stage");
  const countChoices = document.getElementById("count-answer-choices");
  const countFeedback = document.getElementById("count-feedback");
  const progressText = document.getElementById("count-progress-text");
  const progressBar = document.getElementById("count-progress-bar");
  const scoreChip = document.getElementById("count-score-chip");
  const toast = document.getElementById("toast");

  const state = {
    appLanguage: loadLanguage(),
    countingMode: "en",
    route: "menu",
    activeAudioElement: null,
    readQuiz: { target: 1, choices: [], answered: false, lastTarget: 0 },
    countQuiz: { index: 0, total: 10, score: 0, target: 1, choices: [], answered: false, lastTarget: 0, theme: "star" },
    toastTimer: null,
    transitionTimer: null
  };

  function loadLanguage() {
    try {
      return localStorage.getItem("number-garden-language") === "ko" ? "ko" : "en";
    } catch (_) {
      return "en";
    }
  }

  function t(key, values) {
    let value = (translations[state.appLanguage] && translations[state.appLanguage][key]) || translations.en[key] || key;
    if (values) {
      Object.entries(values).forEach(([name, replacement]) => {
        value = value.replace(`{${name}}`, String(replacement));
      });
    }
    return value;
  }

  function applyTranslations() {
    document.documentElement.lang = state.appLanguage;
    document.title = t("appTitle");
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-app-language]").forEach((button) => {
      const active = button.dataset.appLanguage === state.appLanguage;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    quizPlayButton.setAttribute("aria-label", t("playNumber"));
    updateCountProgress();
  }

  function changeAppLanguage(language) {
    state.appLanguage = language === "ko" ? "ko" : "en";
    try { localStorage.setItem("number-garden-language", state.appLanguage); } catch (_) { /* Private mode can block storage. */ }
    playUiTone("tap");
    applyTranslations();
    if (!resultPanel.hidden) renderCountResult();
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
    state.route = route;
    screens.forEach((screen) => {
      const active = screen.dataset.screen === route;
      screen.hidden = !active;
      screen.classList.toggle("is-active", active);
    });
    window.scrollTo(0, 0);
    if (route === "read-quiz") prepareReadQuestion();
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
    if (sourceScreen === "read-quiz" || state.route === "read-quiz") prepareReadQuestion();
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

  function prepareReadQuestion() {
    clearTimeout(state.transitionTimer);
    stopSpeech();
    quizFeedback.textContent = "";
    quizFeedback.className = "feedback-space";
    const next = randomNumber(1, 10, [state.readQuiz.lastTarget]);
    state.readQuiz.lastTarget = next;
    state.readQuiz.target = next;
    state.readQuiz.choices = makeChoices(next, 3);
    state.readQuiz.answered = false;
    renderReadChoices();
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
    if (state.readQuiz.answered) return;
    state.readQuiz.answered = true;
    const correct = number === state.readQuiz.target;
    button.classList.add(correct ? "is-correct" : "is-wrong");
    quizFeedback.textContent = correct ? t("correct") : t("niceTry");
    quizFeedback.classList.add(correct ? "is-correct" : "is-wrong");
    if (!correct) {
      [...quizChoices.children].find((choice) => Number(choice.dataset.value) === state.readQuiz.target)?.classList.add("is-correct");
    }
    playUiTone(correct ? "correct" : "wrong");
    state.transitionTimer = setTimeout(prepareReadQuestion, correct ? 850 : 1150);
  }

  function startCountQuiz() {
    clearTimeout(state.transitionTimer);
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
    objectStage.setAttribute("aria-label", `${count} ${state.countQuiz.theme}`);
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
    scoreChip.innerHTML = `<span aria-hidden="true">★</span> ${state.countQuiz.score}`;
  }

  function showCountResult() {
    countPanel.hidden = true;
    resultPanel.hidden = false;
    renderCountResult();
    if (state.countQuiz.score >= 8) {
      document.body.classList.add("celebrating");
      createConfetti();
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
    const main = document.getElementById("result-character-main");
    const friend = document.getElementById("result-character-friend");
    delete main.dataset.fallbackUsed;
    delete friend.dataset.fallbackUsed;
    if (high) {
      main.src = "assets/characters/character1-celebrate.png";
      main.dataset.fallback = "assets/characters/character1-welcome.png";
      friend.src = "assets/characters/character2-celebrate.png";
      friend.dataset.fallback = "assets/characters/character2-welcome.png";
    } else {
      main.src = medium ? "assets/characters/character1-listen.png" : "assets/characters/character1-thinking.png";
      main.dataset.fallback = "assets/characters/character1-welcome.png";
      friend.src = "assets/characters/character2-encourage.png";
      friend.dataset.fallback = "assets/characters/character2-welcome.png";
    }
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

  function playUiTone(type) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const context = playUiTone.context || (playUiTone.context = new AudioContextClass());
      if (context.state === "suspended") context.resume();
      const now = context.currentTime;
      const patterns = {
        tap: [[480, 0, .055]],
        correct: [[523, 0, .1], [659, .09, .11], [784, .18, .16]],
        wrong: [[280, 0, .09], [220, .09, .12]],
        complete: [[392, 0, .11], [523, .12, .16]],
        celebrate: [[523, 0, .12], [659, .1, .12], [784, .2, .14], [1047, .32, .28]]
      };
      (patterns[type] || patterns.tap).forEach(([frequency, delay, duration]) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = type === "wrong" ? "triangle" : "sine";
        oscillator.frequency.setValueAtTime(frequency, now + delay);
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(type === "tap" ? .055 : .11, now + delay + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, now + delay + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now + delay);
        oscillator.stop(now + delay + duration + .02);
      });
    } catch (_) { /* Audio feedback is an enhancement. */ }
  }

  function createConfetti() {
    const field = document.getElementById("confetti-field");
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
    const languageButton = event.target.closest("[data-app-language]");
    if (languageButton) {
      changeAppLanguage(languageButton.dataset.appLanguage);
      return;
    }
    const modeButton = event.target.closest("[data-counting-mode]");
    if (modeButton) {
      setCountingMode(modeButton.dataset.countingMode, modeButton.closest("[data-screen]")?.dataset.screen);
    }
  });

  quizPlayButton.addEventListener("click", () => playNumber(state.readQuiz.target, quizPlayButton));
  document.getElementById("play-again-button").addEventListener("click", () => {
    playUiTone("tap");
    startCountQuiz();
  });
  window.addEventListener("hashchange", () => showScreen(window.location.hash));

  installImageFallbacks();
  renderLearnGrid();
  applyTranslations();
  setCountingMode("en");
  showScreen(window.location.hash);
})();
