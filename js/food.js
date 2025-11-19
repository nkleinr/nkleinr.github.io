/* =========================================
   UNLOCK FITNESS — FOOD TRACKER (LocalStorage)
========================================= */

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

/* ============================
   LOAD / SAVE
============================ */
function loadMeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) || {};
    meals.breakfast = parsed.breakfast || null;
    meals.lunch = parsed.lunch || null;
    meals.dinner = parsed.dinner || null;
  } catch (e) {
    console.error("Error loading meals", e);
  }
}

function saveMeals() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  } catch (e) {
    console.error("Error saving meals", e);
  }
}

/* ============================
   RENDER
============================ */
function renderMeals() {
  ["breakfast", "lunch", "dinner"].forEach((type) => {
    const row = document.querySelector(`.meal[data-type="${type}"]`);
    if (!row) return;

    const details = row.querySelector(".details");
    const label = row.querySelector(".label");
    const data = meals[type];

    if (details && label) {
      if (data && data.name) {
        details.textContent = `${data.name} – ${data.calories} kcal`;
        details.style.opacity = "1";
        label.textContent = `Add ${capitalize(type)}`;
      } else {
        details.textContent = "No meal logged yet.";
        details.style.opacity = "0.7";
        label.textContent = `Add ${capitalize(type)}`;
      }
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

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ============================
   ADD BUTTONS
============================ */
function setupAddButtons() {
  const addBtns = document.querySelectorAll(".meal .add");
  addBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const row = btn.closest(".meal");
      if (!row) return;

      currentMealType = row.dataset.type;
      currentMode = "add";

      const eatTitle = document.getElementById("eatTitle");
      if (eatTitle) {
        eatTitle.textContent = `Did you eat ${capitalize(currentMealType)} today?`;
      }

      window.location.hash = "eat";
    });
  });
}

/* ============================
   EDIT / DELETE BUTTONS
============================ */
function setupEditDeleteButtons() {
  document.querySelectorAll(".meal").forEach((row) => {
    const type = row.dataset.type;

    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!meals[type]) return;

        currentMealType = type;
        currentMode = "edit";
        prepareMealForm();
        window.location.hash = "mealForm";
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!meals[type]) return;
        if (!confirm("Delete this meal?")) return;

        meals[type] = null;
        renderMeals();
      });
    }
  });
}

/* ============================
   POPUP 1 — Did you eat?
============================ */
function setupEatPopupButtons() {
  const noBtn = document.querySelector("#eat .pill-ghost");
  const yesBtn = document.querySelector("#eat .pill-primary");

  if (noBtn) {
    noBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "";
    });
  }

  if (yesBtn) {
    yesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      prepareMealForm();
      window.location.hash = "mealForm";
    });
  }
}

/* ============================
   POPUP 2 — Add/Edit Meal
============================ */
function prepareMealForm() {
  const title = document.getElementById("mealFormTitle");
  const nameInput = document.getElementById("mealName");
  const calInput = document.getElementById("mealCalories");
  if (!nameInput || !calInput) return;

  if (title) {
    title.textContent =
      currentMode === "edit"
        ? `Edit ${capitalize(currentMealType)}`
        : `Add ${capitalize(currentMealType)}`;
  }

  const existing = meals[currentMealType] || {};
  nameInput.value = existing.name || "";
  calInput.value =
    existing.calories !== undefined && existing.calories !== null
      ? existing.calories
      : "";
}

function setupMealFormHandlers() {
  const form = document.getElementById("mealFormElement");
  const cancelBtn = document.getElementById("mealCancel");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentMealType) return;

      const name = (document.getElementById("mealName").value || "").trim();
      const calStr = (document.getElementById("mealCalories").value || "").trim();

      if (!name) {
        alert("Please enter the meal name.");
        return;
      }

      const calories = parseInt(calStr, 10) || 0;
      meals[currentMealType] = { name, calories };

      renderMeals();
      window.location.hash = "";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "";
    });
  }
}

/* QUICK PICK TARGET */
function setupQuickPickTarget() {
  const buttons = document.querySelectorAll(".qp-target-btn");
  const label = document.getElementById("qp-selected-label");

  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedMealType = btn.dataset.target || "breakfast";

      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (label) {
        label.textContent = `Selected: ${capitalize(selectedMealType)}`;
      }
    });
  });

  // default state
  const defaultBtn = document.querySelector('.qp-target-btn[data-target="breakfast"]');
  if (defaultBtn) defaultBtn.classList.add("active");
  if (label) label.textContent = "Selected: Breakfast";
}

/* ============================
   QUICK PICK ITEMS
============================ */
function setupQuickPickClicks() {
  const items = document.querySelectorAll(".food-group li");
  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const name = item.dataset.name;
      const calories = parseInt(item.dataset.cal, 10) || 0;

      if (!selectedMealType) selectedMealType = "breakfast";
      meals[selectedMealType] = { name, calories };
      renderMeals();
    });
  });
}

/* ============================
   INIT
============================ */
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
