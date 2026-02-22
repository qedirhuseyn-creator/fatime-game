let questions = [];
let index = 0;
let score = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");

fetch("data/numbers.json")
  .then(r => r.json())
  .then(d => {
    questions = d;
    showQuestion();
  });

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ru-RU";
  speechSynthesis.speak(u);
}

function showQuestion() {
  const q = questions[index];
  questionEl.innerText = q.value;
  optionsEl.innerHTML = "";
  speak(q.voice);

  q.options.forEach(o => {
    const btn = document.createElement("button");
    btn.innerText = o;
    btn.className = "option";
    btn.onclick = () => check(o);
    optionsEl.appendChild(btn);
  });
}

function check(val) {
  const q = questions[index];
  if (val === q.correct) {
    score++;
    scoreEl.innerText = score;
    speak("Молодец, Фатима");
    index++;
    if (index < questions.length) {
      setTimeout(showQuestion, 700);
    } else {
      endGame();
    }
  } else {
    speak("Попробуй ещё раз");
  }
}

function endGame() {
  speak("Молодец, Фатима! Папа гордится тобой");
  alert("Молодец, Фатима! Папа гордится тобой 🌟");
}