let questions = [];
let current = 0;
let score = 0;
let soundOn = true;

const $q = document.getElementById("question");
const $v = document.getElementById("value");
const $score = document.getElementById("score");
const $hint = document.getElementById("hint");
const $soundBtn = document.getElementById("soundBtn");
const $soundState = document.getElementById("soundState");
const $restartBtn = document.getElementById("restartBtn");

function setHint(text, cls = "") {
  $hint.className = `hint ${cls}`.trim();
  $hint.textContent = text || "";
}

function speak(text) {
  if (!soundOn) return;
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "az-AZ";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function render() {
  const item = questions[current];
  $q.textContent = item.question;
  $v.textContent = item.value;

  const btns = document.querySelectorAll(".option");
  btns.forEach((btn, i) => {
    btn.textContent = item.options[i];
    btn.onclick = () => check(Number(item.options[i]), item);
  });
}

function next() {
  current++;
  if (current >= questions.length) {
    speak("Əla! Rəqəmləri öyrəndin");
    alert("Əla! Rəqəmləri öyrəndin 🌟");
    start(); // yenidən başlasın
    return;
  }
  render();
}

function check(ans, item) {
  if (ans === item.correct) {
    score++;
    $score.textContent = String(score);
    speak(item.voice);
    setHint("Aferin, Fatimə! 👏", "ok");
    setTimeout(() => {
      setHint("");
      next();
    }, 550);
  } else {
    setHint("Yenə cəhd edək 🙂", "bad");
    speak("Bir də baxaq");
  }
}

function start() {
  current = 0;
  score = 0;
  $score.textContent = "0";
  setHint("");
  // sualları qarışdıraq
  questions = shuffle([...questions]);
  render();
}

$soundBtn?.addEventListener("click", () => {
  soundOn = !soundOn;
  $soundState.textContent = soundOn ? "Aç" : "Söndür";
  setHint(soundOn ? "Səs açıldı" : "Səs söndü");
  if (soundOn) speak("Aferin, Fatimə");
});

$restartBtn?.addEventListener("click", () => {
  start();
});

fetch("data/numbers.json")
  .then(r => r.json())
  .then(data => {
    questions = data;
    start();
  })
  .catch(() => {
    $q.textContent = "Yükləmə xətası";
    $v.textContent = "—";
    setHint("numbers.json tapılmadı. data/numbers.json var mı?");
  });
