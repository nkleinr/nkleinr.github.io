const DAILY_GOAL = 2000;
let meals = {};
let currentMealType = null;

function loadMeals() {
  const saved = localStorage.getItem("uf_meals");
  meals = saved ? JSON.parse(saved) : {};
}

function saveMeals() {
  localStorage.setItem("uf_meals", JSON.stringify(meals));
}

function renderMeals() {
  const totalEl = document.querySelector(".food-subtext strong");
  let total = 0;

  document.querySelectorAll(".meal-item").forEach(item => {
    const type = item.dataset.type;
    const details = item.querySelector(".meal-details");
    const data = meals[type];

    if (data) {
      details.textContent = `${data.name} – ${data.calories} kcal`;
      details.style.opacity = "1";
      total += data.calories;
    } else {
      details.textContent = "No meal logged yet.";
      details.style.opacity = "0.6";
    }
  });

  totalEl.textContent = `${total} Kcal / ${DAILY_GOAL} kcal`;
}

function setupAddButtons() {
  document.querySelectorAll(".meal-add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".meal-item");
      currentMealType = row.dataset.type;

      const title = document.getElementById("eatTitle");
      title.textContent =
        `Did you eat ${currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1)} today?`;

      // Force popup open
      window.location.hash = "eat";
    });
  });
}

function setupPopupButtons() {
  document.querySelector(".food-pill.ghost").addEventListener("click", e => {
    e.preventDefault();
    window.location.hash = "";
  });

  document.querySelector(".food-pill.primary").addEventListener("click", e => {
    e.preventDefault();

    const existing = meals[currentMealType] || {};

    const name = prompt("What did you eat?", existing.name || "");
    if (!name) return;

    const calories = parseInt(
      prompt("Calories?", existing.calories || ""),
      10
    );

    if (isNaN(calories)) return alert("Invalid calories");

    meals[currentMealType] = { name, calories };
    saveMeals();
    renderMeals();
    window.location.hash = "";
  });
}

function setupDelete() {
  document.addEventListener("click", e => {
    if (!e.target.classList.contains("meal-details")) return;

    const row = e.target.closest(".meal-item");
    const type = row.dataset.type;

    if (!meals[type]) return;

    if (confirm("Delete this meal?")) {
      delete meals[type];
      saveMeals();
      renderMeals();
    }
  });
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  loadMeals();
  renderMeals();
  setupAddButtons();
  setupPopupButtons();
  setupDelete();
});
