const DAILY_GOAL = 2000;
const STORAGE_KEY = "uf_meals";

let meals = {
  breakfast: null,
  lunch: null,
  dinner: null
};

let currentMealType = null;
let currentMode = "add";
let selectedMealType = "breakfast";

/*  LOAD MEALS */
function loadMeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    meals.breakfast = parsed.breakfast || null;
    meals.lunch = parsed.lunch || null;
    meals.dinner = parsed.dinner || null;

  } catch (e) { console.error(e); }
}

/* SAVE MEALS */
function saveMeals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

/* RENDER UI */
function renderMeals() {
  ["breakfast", "lunch", "dinner"].forEach((type) => {
    const row = document.querySelector(`.meal[data-type="${type}"]`);
    if (!row) return;

    const details = row.querySelector(".details");
    const label = row.querySelector(".label");
    const data = meals[type];

    if (data && data.name) {
      details.textContent = `${data.name} – ${data.calories} kcal`;
      details.style.opacity = "1";
      label.textContent = `Add ${capitalize(type)}`;
    } else {
      details.textContent = "No meal logged yet.";
      details.style.opacity = "0.7";
      label.textContent = `Add ${capitalize(type)}`;
    }
  });

  updateTotalCalories();
  saveMeals();
}

function updateTotalCalories() {
  const total =
    (meals.breakfast?.calories || 0) +
    (meals.lunch?.calories || 0) +
    (meals.dinner?.calories || 0);

  document.querySelector(".today-pill strong").textContent =
    `${total} Kcal / ${DAILY_GOAL} kcal`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ADD BUTTONS */
function setupAddButtons() {
  document.querySelectorAll(".meal .add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const row = btn.closest(".meal");
      currentMealType = row.dataset.type;
      currentMode = "add";

      document.getElementById("eatTitle").textContent =
        `Did you eat ${capitalize(currentMealType)} today?`;

      window.location.hash = "eat";
    });
  });
}

/* EDIT + DELETE BUTTONS */
function setupEditDeleteButtons() {
  document.querySelectorAll(".meal").forEach((row) => {
    const type = row.dataset.type;

    row.querySelector(".edit-btn").addEventListener("click", () => {
      if (!meals[type]) return;

      currentMealType = type;
      currentMode = "edit";
      prepareMealForm();
      window.location.hash = "mealForm";
    });

    row.querySelector(".delete-btn").addEventListener("click", () => {
      if (!meals[type]) return;

      if (!confirm("Delete this meal?")) return;

      meals[type] = null;
      renderMeals();
    });
  });
}

/* POPUP LOGIC */
function setupEatPopupButtons() {
  document.querySelector("#eat .pill-ghost")
    .addEventListener("click", () => window.location.hash = "");

  document.querySelector("#eat .pill-primary")
    .addEventListener("click", () => {
      prepareMealForm();
      window.location.hash = "mealForm";
    });
}

function prepareMealForm() {
  document.getElementById("mealFormTitle").textContent =
    currentMode === "edit"
      ? `Edit ${capitalize(currentMealType)}`
      : `Add ${capitalize(currentMealType)}`;

  const existing = meals[currentMealType] || {};
  document.getElementById("mealName").value = existing.name || "";
  document.getElementById("mealCalories").value = existing.calories || "";
}

function setupMealFormHandlers() {
  const form = document.getElementById("mealFormElement");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("mealName").value.trim();
    const calories = parseInt(document.getElementById("mealCalories").value) || 0;

    meals[currentMealType] = { name, calories };

    renderMeals();
    window.location.hash = "";
  });

  document.getElementById("mealCancel").addEventListener("click", () => {
    window.location.hash = "";
  });
}

/*  QUICK PICK TARGET */
function setupQuickPickTarget() {
  const buttons = document.querySelectorAll(".qp-target-btn");
  const label = document.getElementById("qp-selected-label");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMealType = btn.dataset.target;

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      label.textContent = `Selected: ${capitalize(selectedMealType)}`;
    });
  });

  document.querySelector('.qp-target-btn[data-target="breakfast"]').classList.add("active");
}

/* QUICK PICK ITEM CLICK */
function setupQuickPickClicks() {
  document.querySelectorAll(".food-group li").forEach(item => {
    item.addEventListener("click", () => {
      const name = item.dataset.name;
      const calories = parseInt(item.dataset.cal);

      meals[selectedMealType] = { name, calories };
      renderMeals();
    });
  });
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  loadMeals();
  renderMeals();

  setupAddButtons();
  setupEditDeleteButtons();
  setupEatPopupButtons();
  setupMealFormHandlers();
  setupQuickPickTarget();
  setupQuickPickClicks();
});
