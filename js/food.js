/* ============================================
   UNLOCK FITNESS — FOOD TRACKER with LocalStorage
============================================ */

const DAILY_GOAL = 2000;
const STORAGE_KEY = "uf_meals";

let meals = {
  breakfast: null,
  lunch: null,
  dinner: null,
};

let currentMealType = null;
let currentMode = "add";

/* LOAD MEALS */
function loadMeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    meals.breakfast = parsed.breakfast || null;
    meals.lunch = parsed.lunch || null;
    meals.dinner = parsed.dinner || null;
  } catch (e) {
    console.warn("Load error:", e);
  }
}

/* SAVE MEALS */
function saveMeals() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  } catch (e) {
    console.warn("Save error:", e);
  }
}

/* RENDER MEALS */
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

  const strong = document.querySelector(".today-pill strong");
  if (strong) {
    strong.textContent = `${total} Kcal / ${DAILY_GOAL} kcal`;
  }
}

/* CAPITALIZE */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ADD BUTTONS */
function setupAddButtons() {
  document.querySelectorAll(".meal .add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const row = btn.closest(".meal");
      currentMealType = row.dataset.type;
      currentMode = "add";

      const title = document.getElementById("eatTitle");
      if (title) title.textContent = `Did you eat ${capitalize(currentMealType)} today?`;

      window.location.hash = "eat";
    });
  });
}

/* POPUP #1 */
function setupEatPopupButtons() {
  const noBtn = document.querySelector("#eat .pill-ghost");
  const yesBtn = document.querySelector("#eat .pill-primary");

  if (noBtn) noBtn.addEventListener("click", closePopups);

  if (yesBtn) {
    yesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      prepareMealForm();
      window.location.hash = "mealForm";
    });
  }
}

/* EDIT + DELETE */
function setupEditDeleteButtons() {
  document.querySelectorAll(".meal").forEach((row) => {
    const type = row.dataset.type;

    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        if (!meals[type]) return;
        currentMode = "edit";
        currentMealType = type;
        prepareMealForm();
        window.location.hash = "mealForm";
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (!meals[type]) return;
        if (!confirm("Delete this meal?")) return;
        meals[type] = null;
        renderMeals();
      });
    }
  });
}

/* PREPARE FORM */
function prepareMealForm() {
  const title = document.getElementById("mealFormTitle");
  const name = document.getElementById("mealName");
  const calories = document.getElementById("mealCalories");

  title.textContent =
    currentMode === "edit" ? `Edit ${capitalize(currentMealType)}` : `Add ${capitalize(currentMealType)}`;

  const existing = meals[currentMealType] || {};
  name.value = existing.name || "";
  calories.value = existing.calories || "";
}

/* FORM SUBMIT */
function setupMealFormHandlers() {
  const form = document.getElementById("mealFormElement");
  const cancel = document.getElementById("mealCancel");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    meals[currentMealType] = {
      name: document.getElementById("mealName").value.trim(),
      calories: parseInt(document.getElementById("mealCalories").value),
    };
    renderMeals();
    closePopups();
  });

  cancel.addEventListener("click", (e) => {
    e.preventDefault();
    closePopups();
  });
}

/* FOOD DATABASE CLICK HANDLER */
function setupFoodDatabase() {
  const items = document.querySelectorAll(".food-db li");

  items.forEach((item) => {
    item.addEventListener("click", () => {
      document.getElementById("mealName").value = item.dataset.name;
      document.getElementById("mealCalories").value = item.dataset.cal;

      window.location.hash = "mealForm";
    });
  });
}

/* CLOSE POPUPS */
function closePopups() {
  window.location.hash = "";
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  loadMeals();
  renderMeals();
  setupAddButtons();
  setupEditDeleteButtons();
  setupEatPopupButtons();
  setupMealFormHandlers();
  setupFoodDatabase(); // NEW
});
