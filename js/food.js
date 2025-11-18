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

function findMealRow(type) {
  return document.querySelector(`.meal[data-type="${type}"]`);
}

function renderMeals() {
  ["breakfast", "lunch", "dinner"].forEach(type => {
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

  const total = Object.values(meals).reduce((sum, m) => sum + (m?.calories || 0), 0);

  const totalStrong = document.querySelector(".food-subtext strong");
  if (totalStrong) {
    totalStrong.textContent = `${total} Kcal / ${DAILY_GOAL} kcal`;
  }
}

function saveMeals() {
  localStorage.setItem("uf_meals", JSON.stringify(meals));
}

function loadMeals() {
  const saved = localStorage.getItem("uf_meals");
  meals = saved ? JSON.parse(saved) : {};
}

function setupAddButtons() {
  document.querySelectorAll(".add").forEach(btn => {
    btn.addEventListener("click", () => {
      const label = btn.getAttribute("aria-label");
      currentMealType = getMealTypeFromLabel(label);

      const title = document.getElementById("eatTitle");
      title.textContent = `Did you eat ${currentMealType}?`;

      window.location.hash = "eat";
    });
  });
}

function setupPopupButtons() {
  document.querySelector(".pill-ghost").addEventListener("click", e => {
    e.preventDefault();
    window.location.hash = "";
  });

  document.querySelector(".pill-primary").addEventListener("click", e => {
    e.preventDefault();

    const existing = meals[currentMealType] || {};

    const name = prompt("What did you eat?", existing.name || "");
    if (!name) return;

    const calories = parseInt(prompt("Calories?", existing.calories || ""), 10);
    if (isNaN(calories) || calories <= 0) {
      alert("Invalid calories");
      return;
    }

    meals[currentMealType] = { name, calories };
    saveMeals();
    renderMeals();

    window.location.hash = "";
  });
}

function setupDeleteOnDetails() {
  document.addEventListener("click", e => {
    if (!e.target.classList.contains("details")) return;

    const row = e.target.closest(".meal");
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
  setupDeleteOnDetails();
});
