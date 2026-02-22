let questions = [];
let current = 0;

// SƏS FUNKSİYASI
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "az-AZ";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// RƏQƏMLƏRİ YÜKLƏ
fetch("data/numbers.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    current = 0;
    showQuestion();
  });

// SUALI GÖSTƏR
function showQuestion() {
  const q = questions[current];
  document.getElementById("question").innerText = q.question;
  document.getElementById("value").innerText = q.value;

  const buttons = document.querySelectorAll(".option");
  buttons.forEach((btn, i) => {
    btn.innerText = q.options[i];
    btn.onclick = () => checkAnswer(q.options[i], q);
  });
}

// CAVABI YOXLA
function checkAnswer(answer, q) {
  if (answer === q.correct) {
    speak(q.voice);
    current++;
    if (current < questions.length) {
      setTimeout(showQuestion, 600);
    } else {
      speak("Əla! Rəqəmləri öyrəndin");
      alert("Əla! Rəqəmləri öyrəndin 🌟");
      current = 0;
      showQuestion();
    }
  } else {
    speak("Bir də baxaq");
  }
    }
