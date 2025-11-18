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
  if (!totalEl) return;

  let total = 0;

  document.querySelectorAll(".meal-item").forEach(item => {
    const type = item.dataset.type;
    const details = item.querySelector(".meal-details");
    const data = meals[type];

    if (!details) return;

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
  const overlay = document.getElementById("eat");
  const title = document.getElementById("eatTitle");
  if (!overlay || !title) return;

  document.querySelectorAll(".meal-add-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // stop jumping to #eat in URL

      const row = btn.closest(".meal-item");
      if (!row) return;

      currentMealType = row.dataset.type || "meal";

      // "Did you eat Breakfast today?"
      const pretty =
        currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1);
      title.textContent = `Did you eat ${pretty} today?`;

      // show popup
      overlay.classList.add("show");
    });
  });
}

function setupPopupButtons() {
  const overlay = document.getElementById("eat");
  if (!overlay) return;

  const yesBtn = document.querySelector(".food-pill.ghost");
  const addBtn = document.querySelector(".food-pill.primary");
  const closeEls = document.querySelectorAll(".overlay-close, .close-modal");

  // "Yes, I did" just closes the popup
  if (yesBtn) {
    yesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.remove("show");
    });
  }

  // "Add a meal" -> prompts for name + calories
  if (addBtn) {
    addBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (!currentMealType) currentMealType = "meal";
      const existing = meals[currentMealType] || {};

      const name = prompt("What did you eat?", existing.name || "");
      if (!name) return;

      const calStr = prompt("Calories?", existing.calories ?? "");
      const calories = parseInt(calStr, 10);
      if (isNaN(calories) || calories <= 0) {
        alert("Please enter a valid number of calories.");
        return;
      }

      meals[currentMealType] = { name, calories };
      saveMeals();
      renderMeals();

      overlay.classList.remove("show");
    });
  }

  // X button and click-off area also close popup
  closeEls.forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.remove("show");
    });
  });
}

function setupDelete() {
  document.addEventListener("click", (e) => {
    const details = e.target;
    if (!details.classList.contains("meal-details")) return;

    const row = details.closest(".meal-item");
    if (!row) return;

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
