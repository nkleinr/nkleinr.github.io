/* =========================================
   UNLOCK FITNESS — FOOD TRACKER (LocalStorage + Data Table)
========================================= */

const DAILY_GOAL = 2000;
const STORAGE_KEY = "uf_meals";

// default structure
let meals = {
  breakfast: null,
  lunch: null,
  dinner: null
};

let currentMealType = null;
let currentMode = "add";

/* ============================
   LOAD MEALS FROM STORAGE
============================ */
function loadMeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    meals.breakfast = parsed.breakfast || null;
    meals.lunch = parsed.lunch || null;
    meals.dinner = parsed.dinner || null;
  } catch (e) {
    console.warn("❌ Error loading meals", e);
  }
}

/* ============================
   SAVE MEALS TO STORAGE
============================ */
function saveMeals() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  } catch (e) {
    console.warn("❌ Error saving meals", e);
  }
}

/* ============================
   RENDER ALL MEALS
============================ */
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
  renderDataTable();   // NEW
  saveMeals();
}

/* ============================
   UPDATE TOTAL CALORIES
============================ */
function updateTotalCalories() {
  const total =
    (meals.breakfast?.calories || 0) +
    (meals.lunch?.calories || 0) +
    (meals.dinner?.calories || 0);

  const strong = document.querySelector(".today-pill strong");
  if (strong) strong.textContent = `${total} Kcal / ${DAILY_GOAL} kcal`;
}

/* ============================
   DATA TABLE RENDERING (NEW)
============================ */
function renderDataTable() {
  const tbody = document.getElementById("dataTableBody");
  if (!tbody) return;

  tbody.innerHTML = ""; // clear table

  Object.keys(meals).forEach((type) => {
    const item = meals[type];

    const row = document.createElement("tr");

    const mealCell = document.createElement("td");
    mealCell.textContent = capitalize(type);

    const nameCell = document.createElement("td");
    nameCell.textContent = item?.name || "—";

    const calCell = document.createElement("td");
    calCell.textContent = item?.calories ? `${item.calories} kcal` : "—";

    row.appendChild(mealCell);
    row.appendChild(nameCell);
    row.appendChild(calCell);

    tbody.appendChild(row);
  });
}

/* ============================
   POPUP #1 — ADD BUTTONS
============================ */
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

function setupEatPopupButtons() {
  const noBtn = document.querySelector("#eat .pill-ghost");
  const yesBtn = document.querySelector("#eat .pill-primary");

  if (noBtn)
    noBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closePopups();
    });

  if (yesBtn)
    yesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      prepareMealForm();
      window.location.hash = "mealForm";
    });
}

/* ============================
   POPUP #2 — EDIT + DELETE
============================ */
function setupEditDeleteButtons() {
  document.querySelectorAll(".meal").forEach((row) => {
    const type = row.dataset.type;

    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (editBtn)
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!meals[type]) return;

        currentMealType = type;
        currentMode = "edit";

        prepareMealForm();
        window.location.hash = "mealForm";
      });

    if (deleteBtn)
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();

        if (!meals[type]) return;

        if (!confirm("Delete this meal?")) return;

        meals[type] = null;
        renderMeals();
      });
  });
}

/* ============================
   PREPARE THE FORM
============================ */
function prepareMealForm() {
  const title = document.getElementById("mealFormTitle");
  const name = document.getElementById("mealName");
  const calories = document.getElementById("mealCalories");

  if (!name || !calories) return;

  title.textContent =
    currentMode === "edit"
      ? `Edit ${capitalize(currentMealType)}`
      : `Add ${capitalize(currentMealType)}`;

  const existing = meals[currentMealType] || {};
  name.value = existing.name || "";
  calories.value = existing.calories || "";
}

/* ============================
   FORM HANDLING
============================ */
function setupMealFormHandlers() {
  const form = document.getElementById("mealFormElement");
  const cancelBtn = document.getElementById("mealCancel");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("mealName").value.trim();
      const cal = parseInt(document.getElementById("mealCalories").value) || 0;

      meals[currentMealType] = {
        name,
        calories: cal
      };

      renderMeals();
      closePopups();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closePopups();
    });
  }
}

/* ============================
   CLOSE POPUPS
============================ */
function closePopups() {
  window.location.hash = "";
}

/* ============================
   CAPITALIZE HELPER
============================ */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
});
