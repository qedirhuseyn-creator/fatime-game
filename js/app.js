// --------------------
// SETTINGS
// --------------------
const DEMO_LIMIT = 10; // 4-7 yaş üçün istəyirsənsə 5 də edə bilərsən
const DATA_URL = "data/numbers.json";

// --------------------
// ELEMENTS
// --------------------
const screenLogin = document.getElementById("screenLogin");
const screenGame  = document.getElementById("screenGame");

const langBtn = document.getElementById("langBtn");
const backBtn = document.getElementById("backBtn");
const modePill = document.getElementById("modePill");

const loginTitle = document.getElementById("loginTitle");
const loginText  = document.getElementById("loginText");

const avatarInput = document.getElementById("avatarInput");
const avatarBox = document.getElementById("avatarBox");
const avatarImg = document.getElementById("avatarImg");
const avatarPlaceholder = document.getElementById("avatarPlaceholder");
const clearAvatarBtn = document.getElementById("clearAvatarBtn");

const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

const playerNameEl = document.getElementById("playerName");
const scoreEl = document.getElementById("score");
const questionLabelEl = document.getElementById("questionLabel");
const questionValueEl = document.getElementById("questionValue");
const optionsEl = document.getElementById("options");
const hintEl = document.getElementById("hint");
const restartBtn = document.getElementById("restartBtn");

// --------------------
// STORAGE KEYS
// --------------------
const KEY_NAME = "kid_name_v1";
const KEY_AVATAR = "kid_avatar_v1";
const KEY_LANG = "kid_lang_v1"; // "AZ" or "RU"

// --------------------
// STATE
// --------------------
let LANG = localStorage.getItem(KEY_LANG) || "AZ";
let questions = [];
let idx = 0;
let score = 0;

// --------------------
// UI TEXT
// --------------------
function t(az, ru){
  return LANG === "RU" ? ru : az;
}

function applyLangUI(){
  langBtn.textContent = LANG;

  modePill.textContent = t("Oyun (demo)", "Игра (демо)");
  loginTitle.textContent = t("Salam!", "Привет!");
  loginText.textContent  = t(
    "Uşağın adını yaz və şəkil yüklə. Şəkil dairəvi avatar kimi görünəcək.",
    "Введи имя ребёнка и загрузи фото. Фото станет круглым аватаром."
  );

  startBtn.textContent = t("Başla", "Начать");
  resetAllBtn.textContent = t("Yaddaşı sıfırla", "Сбросить");
  clearAvatarBtn.textContent = t("🧹 Avatarı sil", "🧹 Удалить аватар");
  restartBtn.textContent = t("Yenidən başla", "Сначала");
  backBtn.textContent = t("⬅ Geri", "⬅ Назад");

  questionLabelEl.textContent = t("Bu neçədir?", "Сколько это?");
}

// --------------------
// SPEAK
// --------------------
function speak(text){
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = (LANG === "RU") ? "ru-RU" : "az-AZ";
    speechSynthesis.speak(u);
  }catch(e){
    // ignore
  }
}

// --------------------
// AVATAR (file -> dataURL)
// --------------------
function setAvatarDataUrl(dataUrl){
  if(dataUrl){
    avatarImg.src = dataUrl;
    avatarImg.classList.remove("hidden");
    avatarPlaceholder.classList.add("hidden");
    localStorage.setItem(KEY_AVATAR, dataUrl);
  }else{
    avatarImg.src = "";
    avatarImg.classList.add("hidden");
    avatarPlaceholder.classList.remove("hidden");
    localStorage.removeItem(KEY_AVATAR);
  }
}

avatarInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    setAvatarDataUrl(dataUrl);
  };
  reader.readAsDataURL(file);
});

clearAvatarBtn.addEventListener("click", () => {
  avatarInput.value = "";
  setAvatarDataUrl(null);
});

// --------------------
// LOAD SAVED USER
// --------------------
function loadUser(){
  const savedName = localStorage.getItem(KEY_NAME);
  if(savedName) nameInput.value = savedName;

  const savedAvatar = localStorage.getItem(KEY_AVATAR);
  if(savedAvatar) setAvatarDataUrl(savedAvatar);

  applyLangUI();
}

// --------------------
// SCREEN CONTROL
// --------------------
function showLogin(){
  screenLogin.classList.remove("hidden");
  screenGame.classList.add("hidden");
  backBtn.style.display = "none";
}

function showGame(){
  screenLogin.classList.add("hidden");
  screenGame.classList.remove("hidden");
  backBtn.style.display = "inline-flex";
}

// --------------------
// GAME LOGIC
// --------------------
function shuffle(arr){
  for(let i=arr.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
}

function setHint(msg){
  hintEl.textContent = msg || "";
}

function renderQuestion(){
  const q = questions[idx];
  if(!q){
    // end
    speak(t("Əla! Təbriklər!", "Отлично! Молодец!"));
    alert(t("Əla! Təbriklər 🌟", "Отлично! Молодец! 🌟"));
    restartGame();
    return;
  }

  questionValueEl.textContent = q.value;
  setHint("");

  // options
  optionsEl.innerHTML = "";
  const opts = [...q.options];
  shuffle(opts);

  opts.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "optBtn";
    btn.textContent = String(opt);
    btn.onclick = () => checkAnswer(opt);
    optionsEl.appendChild(btn);
  });

  // voice per question (RU default in JSON, AZ can be added later)
  if(q.voice){
    speak(q.voice);
  }else{
    speak(t("Bu neçədir?", "Сколько это?"));
  }
}

function checkAnswer(val){
  const q = questions[idx];
  if(val === q.correct){
    score++;
    scoreEl.textContent = String(score);
    speak(t("Aferin!", "Молодец!"));
    idx++;
    setTimeout(renderQuestion, 450);
  }else{
    speak(t("Bir də cəhd et", "Попробуй ещё раз"));
  }
}

function restartGame(){
  idx = 0;
  score = 0;
  scoreEl.textContent = "0";
  shuffle(questions);
  // Demo limit
  questions = questions.slice(0, DEMO_LIMIT);
  renderQuestion();
}

async function loadQuestions(){
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if(!res.ok) throw new Error("Failed to load data");
  const data = await res.json();
  if(!Array.isArray(data)) throw new Error("Bad data");
  questions = data.slice();
  shuffle(questions);
  questions = questions.slice(0, DEMO_LIMIT);
}

// --------------------
// EVENTS
// --------------------
langBtn.addEventListener("click", () => {
  LANG = (LANG === "AZ") ? "RU" : "AZ";
  localStorage.setItem(KEY_LANG, LANG);
  applyLangUI();
});

backBtn.addEventListener("click", () => {
  showLogin();
});

startBtn.addEventListener("click", async () => {
  const name = (nameInput.value || "").trim();
  if(!name){
    alert(t("Zəhmət olmasa adı yaz.", "Пожалуйста, введи имя."));
    return;
  }

  localStorage.setItem(KEY_NAME, name);
  playerNameEl.textContent = name;

  showGame();

  try{
    await loadQuestions();
    restartGame();
  }catch(e){
    questionValueEl.textContent = "Xəta";
    optionsEl.innerHTML = "";
    setHint(t("Data yüklənmədi. numbers.json faylını yoxla.", "Не загрузились данные. Проверь numbers.json."));
  }
});

restartBtn.addEventListener("click", () => {
  restartGame();
});

resetAllBtn.addEventListener("click", () => {
  localStorage.removeItem(KEY_NAME);
  localStorage.removeItem(KEY_AVATAR);
  // dili saxlayırıq
  nameInput.value = "";
  setAvatarDataUrl(null);
  alert(t("Yaddaş sıfırlandı.", "Сброшено."));
});

// --------------------
// INIT
// --------------------
loadUser();
showLogin();

// Auto-fill player name on game screen if exists
const savedName = localStorage.getItem(KEY_NAME);
if(savedName) playerNameEl.textContent = savedName;