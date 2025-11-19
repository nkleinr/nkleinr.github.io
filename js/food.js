const DAILY_GOAL = 2000;
let meals = {};
let currentMealType = null; 
let currentMode = "add";    
function getMealTypeFromLabel(labelText) {
  const lower = labelText.toLowerCase();
  if (lower.includes("breakfast")) return "breakfast";
  if (lower.includes("lunch")) return "lunch";
  if (lower.includes("dinner")) return "dinner";
  return null;
}

function getRowFor(type) {
  return document.querySelector(`.meal[data-type="${type}"]`);
}

function formatType(type) {
  if (!type) return "Meal";
  return type.charAt(0).toUpperCase() + type.slice(1);
}
// Render + storage
function renderMeals() {
  ["breakfast", "lunch", "dinner"].forEach((type) => {
    const row = getRowFor(type);
    if (!row) return;

    const details = row.querySelector(".details");
    const label = row.querySelector(".label");

    const data = meals[type];

    if (data && data.name) {
      if (details) {
        details.textContent = `${data.name} – ${data.calories} kcal`;
        details.style.opacity = "1";
      }
      if (label) {
        label.textContent = `Add ${formatType(type)}`;
      }
    } else {
      if (details) {
        details.textContent = "No meal logged yet.";
        details.style.opacity = "0.7";
      }
      if (label) {
        label.textContent = `Add ${formatType(type)}`;
      }
    }
  });

  // total calories
  const total = Object.values(meals).reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );
  const totalStrong = document.querySelector(".today-pill strong");
  if (totalStrong) {
    totalStrong.textContent = `${total} Kcal / ${DAILY_GOAL} kcal`;
  }
  try {
    localStorage.setItem("uf_meals", JSON.stringify(meals));
  } catch (e) {
  }
}

function loadMeals() {
  try {
    const raw = localStorage.getItem("uf_meals");
    if (!raw) {
      meals = {};
      return;
    }
    meals = JSON.parse(raw) || {};
  } catch (e) {
    meals = {};
  }
}
// Popup helpers (hash-based)
function openEatPopup() {
  window.location.hash = "#eat";
}

function openMealFormPopup() {
  window.location.hash = "#mealForm";
}

function closePopups() {
  window.location.hash = "";
}
// Setup: Add (+) buttons
function setupAddButtons() {
  const addButtons = document.querySelectorAll(".meal .add");

  addButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const row = btn.closest(".meal");
      if (!row) return;

      const label = row.querySelector(".label");
      if (!label) return;

      currentMealType = getMealTypeFromLabel(label.textContent);
      currentMode = "add";

      // update "Did you eat ___ today?"
      const title = document.getElementById("eatTitle");
      if (title) {
        const pretty = formatType(currentMealType);
        title.textContent = `Did you eat ${pretty} today?`;
      }

      openEatPopup();
    });
  });
}
// Setup: Edit / Delete buttons
function setupEditDeleteButtons() {
  const rows = document.querySelectorAll(".meal");

  rows.forEach((row) => {
    const labelEl = row.querySelector(".label");
    if (!labelEl) return;

    const type = getMealTypeFromLabel(labelEl.textContent);
    if (!type) return;

    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    // EDIT
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        currentMealType = type;
        currentMode = "edit";
        prepareMealForm();
        openMealFormPopup();
      });
    }

    // DELETE
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!meals[type]) return;

        const ok = window.confirm("Are you sure you want to delete this meal?");
        if (!ok) return;

        delete meals[type];
        renderMeals();
      });
    }
  });
}
// Popup #1 buttons (Did you eat?)
function setupEatPopupButtons() {
  const yesBtn = document.querySelector("#eat .pill-ghost");
  const addBtn = document.querySelector("#eat .pill-primary");

  if (yesBtn) {
    yesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closePopups();
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      prepareMealForm();
      openMealFormPopup();
    });
  }
}
// Popup #2 form (Add / Edit meal)
function prepareMealForm() {
  const titleEl = document.getElementById("mealFormTitle");
  const nameInput = document.getElementById("mealName");
  const calInput = document.getElementById("mealCalories");

  if (!nameInput || !calInput) return;

  const pretty = formatType(currentMealType);
  if (titleEl) {
    titleEl.textContent =
      currentMode === "edit" ? `Edit ${pretty}` : `Add ${pretty}`;
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

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentMealType) return;

    const nameInput = document.getElementById("mealName");
    const calInput = document.getElementById("mealCalories");

    const name = (nameInput.value || "").trim();
    const caloriesStr = (calInput.value || "").trim();

    if (!name) {
      alert("Please enter the meal name.");
      return;
    }

    const calories = parseInt(caloriesStr, 10) || 0;

    meals[currentMealType] = { name, calories };
    renderMeals();
    closePopups();
  });

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closePopups();
    });
  }
}
// Init
document.addEventListener("DOMContentLoaded", () => {
  loadMeals();
  renderMeals();
  setupAddButtons();
  setupEditDeleteButtons();
  setupEatPopupButtons();
  setupMealFormHandlers();
});
