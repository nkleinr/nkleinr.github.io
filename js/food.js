const DAILY_GOAL = 2000;
let meals = {};
let currentMealType = null;

function getMealTypeFromLabel(labelText) {
  const lower = labelText.toLowerCase();
  if (lower.includes("breakfast")) return "breakfast";
  if (lower.includes("lunch")) return "lunch";
  if (lower.includes("dinner")) return "dinner";
  return "meal";
}

// Find the .meal div for a given type
function findMealRow(type) {
  const rows = document.querySelectorAll(".meal");
  for (const row of rows) {
    const label = row.querySelector(".label");
    if (!label) continue;
    const text = label.textContent.toLowerCase();
    if (type === "breakfast" && text.includes("breakfast")) return row;
    if (type === "lunch" && text.includes("lunch")) return row;
    if (type === "dinner" && text.includes("dinner")) return row;
  }
  return null;
}

// Update Total Calories text and meal descriptions
function renderMeals() {
  meals = meals || {};

  ["breakfast", "lunch", "dinner"].forEach((type) => {
    const row = findMealRow(type);
    if (!row) return;

    let details = row.querySelector(".details");
    if (!details) {
      details = document.createElement("div");
      details.className = "details";
      row.appendChild(details);
    }

    const data = meals[type];
    if (data) {
      details.textContent = `${data.name} – ${data.calories} kcal`;
      details.style.opacity = "1";
    } else {
      details.textContent = "No meal logged yet.";
      details.style.opacity = "0.7";
    }
  });

  // Calculate total calories
  const total = Object.values(meals).reduce((sum, m) => {
    if (!m) return sum;
    return sum + (m.calories || 0);
  }, 0);

  const totalStrong = document.querySelector(".today-pill strong");
  if (totalStrong) {
    totalStrong.textContent = `${total} Kcal / ${DAILY_GOAL} kcal`;
  }
}

// Save to localStorage
function saveMeals() {
  localStorage.setItem("uf_meals", JSON.stringify(meals));
}

// Load from localStorage
function loadMeals() {
  const saved = localStorage.getItem("uf_meals");
  if (!saved) return;
  try {
    meals = JSON.parse(saved) || {};
  } catch (e) {
    meals = {};
  }
}

// Handle clicking the "+" buttons (Breakfast / Lunch / Dinner)
function setupAddButtons() {
  const addButtons = document.querySelectorAll(".add");
  const title = document.getElementById("eatTitle");

  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const labelText =
        btn.getAttribute("aria-label") || btn.textContent || "Add Meal";
      currentMealType = getMealTypeFromLabel(labelText);

      if (title && currentMealType !== "meal") {
        const niceName =
          currentMealType.charAt(0).toUpperCase() +
          currentMealType.slice(1);
        title.textContent = `Did you eat ${niceName} today?`;
      } else if (title) {
        title.textContent = "Did you eat today?";
      }
     
    });
  });
}

// Buttons inside the popup
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
    addMealButton.addEventListener("click", (e) => {
      e.preventDefault();

      if (!currentMealType) currentMealType = "meal";

      const prettyName = (currentMealType === "meal" ? "this meal" : currentMealType);

      const existing = meals[currentMealType] || {};

      const name = prompt(
        `What did you eat for ${prettyName}?`,
        existing.name || ""
      );
      if (!name) return;

      const calStr = prompt(
        "How many calories (kcal)?",
        existing.calories != null ? existing.calories : ""
      );
      const calories = parseInt(calStr, 10);
      if (isNaN(calories) || calories <= 0) {
        alert("Please enter a valid number of calories.");
        return;
      }

      meals[currentMealType] = { name, calories };
      saveMeals();
      renderMeals();

      window.location.hash = ""; 
    });
  }
}

// Delete a meal when clicking on the details text
function setupDeleteOnDetails() {
  document.addEventListener("click", (e) => {
    const details = e.target;
    if (!details.classList.contains("details")) return;

    const row = details.closest(".meal");
    if (!row) return;

    const label = row.querySelector(".label");
    if (!label) return;

    const type = getMealTypeFromLabel(label.textContent);
    if (!meals[type]) return;

    const ok = confirm("Do you want to delete this meal?");
    if (!ok) return;

    delete meals[type];
    saveMeals();
    renderMeals();
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadMeals();
  renderMeals();
  setupAddButtons();
  setupPopupButtons();
  setupDeleteOnDetails();
});
