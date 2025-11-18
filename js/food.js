const DAILY_GOAL = 2000;
let meals = {};
let currentMealType = null;

function loadMeals() {
  meals = JSON.parse(localStorage.getItem("uf_meals")) || {};
}

function saveMeals() {
  localStorage.setItem("uf_meals", JSON.stringify(meals));
}

function renderMeals() {
  const totalEl = document.querySelector(".ft-calories strong");
  let total = 0;

  document.querySelectorAll(".ft-meal").forEach(row => {
    const type = row.dataset.type;
    const details = row.querySelector(".ft-details");
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
  document.querySelectorAll(".ft-add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const meal = btn.closest(".ft-meal");
      currentMealType = meal.dataset.type;

      const title = document.getElementById("ft-title");
      title.textContent = `Did you eat ${currentMealType}?`;
    });
  });
}

function setupPopupButtons() {
  // Close popup
  document.querySelector(".ft-btn-ghost").addEventListener("click", e => {
    e.preventDefault();
    window.location.hash = "";
  });

  // Add a meal
  document.querySelector(".ft-btn-primary").addEventListener("click", e => {
    e.preventDefault();

    const existing = meals[currentMealType] || {};

    const name = prompt("What did you eat?", existing.name || "");
    if (!name) return;

    const calories = parseInt(prompt("Calories?", existing.calories || ""), 10);
    if (isNaN(calories)) return alert("Invalid calories");

    meals[currentMealType] = { name, calories };
    saveMeals();
    renderMeals();

    window.location.hash = "";
  });
}

function setupDelete() {
  document.addEventListener("click", e => {
    if (!e.target.classList.contains("ft-details")) return;

    const row = e.target.closest(".ft-meal");
    const type = row.dataset.type;

    if (!meals[type]) return;

    if (confirm("Delete this meal?")) {
      delete meals[type];
      saveMeals();
      renderMeals();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadMeals();
  renderMeals();
  setupAddButtons();
  setupPopupButtons();
  setupDelete();
});
