const DAILY_GOAL = 2000;
let meals = {};
let currentMealType = null;  // "breakfast" "lunch" "dinner"
let currentMode = "add";     // "add" "edit"
function getMealTypeFromLabel(labelText) {
  const lower = labelText.toLowerCase();
  if (lower.includes("breakfast")) return "breakfast";
  if (lower.includes("lunch")) return "lunch";
  if (lower.includes("dinner")) return "dinner";
  return "meal";
}

// .meal div for a given type
function findMealRow(type) {
  const rows = document.querySelectorAll(".meal");
  for (const row of rows) {
    const l = row.querySelector(".label");
    if (!l) continue;
    const text = l.textContent.toLowerCase();
    if (type === "breakfast" && text.includes("breakfast")) return row;
    if (type === "lunch" && text.includes("lunch")) return row;
    if (type === "dinner" && text.includes("dinner")) return row;
  }
  return null;
}

function renderMeals() {
  meals = meals || {};

  ["breakfast", "lunch", "dinner"].forEach((type) => {
    const row = findMealRow(type);
    if (!row) return;

    const details = row.querySelector(".details");
    const data = meals[type];

    if (data) {
      details.textContent = `${data.name} – ${data.calories} kcal`;
      details.style.opacity = "1";
    } else {
      details.textContent = "No meal logged yet.";
      details.style.opacity = "0.7";
    }
  });

  // Calculate totals
  const total = Object.values(meals).reduce((sum, m) => {
    if (!m) return sum;
    return sum + (m.calories || 0);
  }, 0);

  const totalStrong = document.querySelector(".today-pill strong");
  if (totalStrong) {
    totalStrong.textContent = `${total} Kcal / ${DAILY_GOAL} kcal`;
  }
}

/* Storage */

function saveMeals() {
  localStorage.setItem("uf_meals", JSON.stringify(meals));
}

function loadMeals() {
  const saved = localStorage.getItem("uf_meals");
  if (!saved) return;
  try {
    meals = JSON.parse(saved) || {};
  } catch {
    meals = {};
  }
}

/* Add button (+) “Did you eat today?” popup */

function setupAddButtons() {
  const addButtons = document.querySelectorAll(".circle-btn.add");
  const title = document.getElementById("eatTitle");

  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const labelText =
        btn.getAttribute("aria-label") || btn.textContent || "Add meal";
      currentMealType = getMealTypeFromLabel(labelText);

      if (title && currentMealType !== "meal") {
        const pretty =
          currentMealType.charAt(0).toUpperCase() +
          currentMealType.slice(1);
        title.textContent = `Did you eat ${pretty} today?`;
      } else if (title) {
        title.textContent = "Did you eat today?";
      }
    });
  });
}

/* Popup #1 buttons */

function setupPopupButtons() {
  const yesButton = document.querySelector(".pill.pill-ghost");
  const addMealButton = document.querySelector(".pill.pill-primary");

  // "Yes, I did" 
  if (yesButton) {
    yesButton.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = ""; // close overlay
    });
  }

  // "Add a meal"
  if (addMealButton) {
    addMealButton.addEventListener("click", () => {
      currentMode = "add";
      prepareMealForm();
    });
  }
}

/* Edit + Delete buttons on each row */

function setupEditDeleteButtons() {
  const rows = document.querySelectorAll(".meal");

  rows.forEach((row) => {
    const labelEl = row.querySelector(".label");
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (!labelEl) return;

    const type = getMealTypeFromLabel(labelEl.textContent);

    // EDIT
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        currentMealType = type;
        currentMode = "edit";
        prepareMealForm();
        window.location.hash = "#mealForm";
      });
    }

    // DELETE
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (!meals[type]) return;
        const sure = confirm("Delete this meal?");
        if (!sure) return;
        delete meals[type];
        saveMeals();
        renderMeals();
      });
    }
  });
}

/* Meal Form (popup #2) */

function prepareMealForm() {
  const title = document.getElementById("mealFormTitle");
  const nameInput = document.getElementById("mealName");
  const calInput = document.getElementById("mealCalories");

  if (!currentMealType) currentMealType = "meal";

let pretty;

if (currentMealType === "meal") {
  pretty = "Meal";
} else {
  pretty = currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1);
}
    
  if (title) {
    title.textContent =
      currentMode === "edit" ? `Edit ${pretty}` : `Add ${pretty}`;
  }

  const existing = meals[currentMealType] || {};
  if (currentMode === "edit" && existing.name) {
    nameInput.value = existing.name;
    calInput.value = existing.calories != null ? existing.calories : "";
  } else {
    nameInput.value = "";
    calInput.value = "";
  }
}

/* Handle submit + cancel */

function setupMealFormHandlers() {
  const form = document.getElementById("mealFormElement");
  const cancel = document.getElementById("mealCancel");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentMealType) return;

    const name = document.getElementById("mealName").value.trim();
    const calStr = document.getElementById("mealCalories").value.trim();
    const calories = parseInt(calStr, 10);

    if (!name) {
      alert("Please enter the meal name.");
      return;
    }
    if (isNaN(calories) || calories < 0) {
      alert("Please enter a valid calorie amount.");
      return;
    }

    meals[currentMealType] = { name, calories };
    saveMeals();
    renderMeals();

    // Close modal
    window.location.hash = "";
  });

  if (cancel) {
    cancel.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "";
    });
  }
}

/* Initialize */

document.addEventListener("DOMContentLoaded", () => {
  loadMeals();
  renderMeals();
  setupAddButtons();
  setupPopupButtons();
  setupEditDeleteButtons();
  setupMealFormHandlers();
});
