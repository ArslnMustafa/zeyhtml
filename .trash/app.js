const ASSETS = {
  matcha: "assets/matcha.png",
  cake: "assets/chocolate-cake.png",
  pizza: "assets/pizza.png",
  sushi: "assets/sushi.png",
  burger: "assets/burger.png",
  surprise: "assets/surprise.png",
};

const times = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const foods = [
  { label: "Matcha", image: ASSETS.matcha },
  { label: "Çikolatalı pasta ama çok çikolatalı", image: ASSETS.cake },
  { label: "Pizza", image: ASSETS.pizza },
  { label: "Sushi", image: ASSETS.sushi },
  { label: "Burger", image: ASSETS.burger },
  { label: "Sana bırakıyorum", image: ASSETS.surprise },
];

const state = { step: 1, date: "", time: "14:00", foods: [] };
const stepLabels = { 1: "Ana sayfa", 2: "Tarih ve saat seçimi", 3: "Yemek ve içecek seçimi", 4: "Randevu onayı" };
const $ = (selector) => document.querySelector(selector);
const calendarMonth = new Date(2026, 7, 1, 12, 0, 0, 0);
const calendarLastDay = new Date(2026, 7, 30, 12, 0, 0, 0);

function localIso(date) { return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function calendarStartDate() {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  return today > calendarMonth ? today : calendarMonth;
}
function renderCalendar() {
  const root = $("#calendar-days");
  const firstWeekday = (calendarMonth.getDay() + 6) % 7;
  const minimumDate = calendarStartDate();
  const todayIso = localIso(new Date());
  root.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(2026, 7, index - firstWeekday + 1, 12, 0, 0, 0);
    const isAugust = date.getMonth() === 7;
    const isoDate = localIso(date);
    const selectable = isAugust && date >= minimumDate && date <= calendarLastDay;
    const classes = ["calendar-day"];
    if (!isAugust) classes.push("outside");
    if (isoDate === todayIso) classes.push("today");
    if (isoDate === state.date) classes.push("selected");
    return `<button class="${classes.join(" ")}" type="button" role="gridcell" data-date="${isoDate}" ${selectable ? "" : "disabled"} aria-label="${date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}" aria-pressed="${isoDate === state.date}">${date.getDate()}</button>`;
  }).join("");
  root.onclick = (event) => {
    const button = event.target.closest("[data-date]");
    if (!button || button.disabled) return;
    state.date = button.dataset.date;
    renderCalendar();
    renderSchedule();
  };
}
function setupCalendar() {
  const firstAvailableDate = calendarStartDate();
  state.date = localIso(firstAvailableDate <= calendarLastDay ? firstAvailableDate : calendarLastDay);
  renderCalendar();
}
function displayDate() { return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" }).format(new Date(`${state.date}T12:00:00`)); }
function renderSchedule() { $("#schedule-text").textContent = `${displayDate()} · ${state.time}`; }
function renderTimes() {
  const root = $("#time-options");
  root.innerHTML = times.map((time) => `<button class="time-choice ${time === state.time ? "selected" : ""}" type="button" data-time="${time}">${time}</button>`).join("");
  root.onclick = (event) => { const button = event.target.closest("[data-time]"); if (!button) return; state.time = button.dataset.time; renderTimes(); renderSchedule(); };
}
function renderFoods() {
  const root = $("#menu-options");
  root.innerHTML = foods.map((food, index) => `<button class="food-card ${state.foods.includes(food.label) ? "selected" : ""}" type="button" data-food="${index}" aria-pressed="${state.foods.includes(food.label)}"><img src="${food.image}" alt="" /><span class="food-label">${food.label}</span><span class="selection-check" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m5 12 4.2 4.2L19.5 6" /></svg></span></button>`).join("");
  root.onclick = (event) => { const button = event.target.closest("[data-food]"); if (!button) return; const food = foods[Number(button.dataset.food)].label; state.foods = state.foods.includes(food) ? state.foods.filter((item) => item !== food) : [...state.foods, food]; renderFoods(); renderFoodCount(); };
}
function renderFoodCount() { $("#selection-count").textContent = state.foods.length ? `${state.foods.length} seçenek seçtin.` : "Seçim yapmayı unutma."; $("#confirm-date").disabled = state.foods.length === 0; }
function sendNotification(payload) {
  return fetch("notify.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store", keepalive: true })
    .then(async (response) => {
      if (response.ok) return;
      const data = await response.json().catch(() => ({}));
      console.warn("Bildirim gönderilemedi:", data.error || response.status);
    })
    .catch(() => console.warn("Bildirim sunucusuna ulaşılamadı."));
}
function notify(page) { return sendNotification({ type: "visit", page }); }
function showStep(step) {
  state.step = step;
  document.querySelectorAll(".screen").forEach((screen) => { screen.hidden = Number(screen.id.split("-")[1]) !== step; screen.classList.toggle("active", !screen.hidden); });
  notify(stepLabels[step]);
}
function showFinal() {
  $("#final-message").textContent = `${displayDate()} saat ${state.time}'de hazır ol. Seni almaya geleceğim.`;
  $("#final-date").textContent = displayDate();
  $("#final-time").textContent = `Saat ${state.time}`;
  $("#final-foods").innerHTML = state.foods.map((food) => `<li><span class="final-check" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m5 12 4.2 4.2L19.5 6" /></svg></span>${food}</li>`).join("");
  showStep(4);
  sendNotification({ type: "date", date: state.date, time: state.time, foods: state.foods });
}
function dodgeNo() { const button = $("#no-button"); button.style.left = `${16 + Math.random() * 68}%`; button.style.top = `${24 + Math.random() * 52}%`; }

setupCalendar(); renderTimes(); renderSchedule(); renderFoods(); renderFoodCount();
$("#yes-button").addEventListener("click", () => showStep(2)); $("#no-button").addEventListener("mouseenter", dodgeNo); $("#no-button").addEventListener("click", (event) => { event.preventDefault(); dodgeNo(); });
$("#to-menu").addEventListener("click", () => showStep(3)); $("#confirm-date").addEventListener("click", showFinal);
notify(stepLabels[1]);
