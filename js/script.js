
const STORAGE_KEY = "workouts";

function getWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWorkouts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}




const modal = document.getElementById("addWorkoutModal");
const overlay = modal.querySelector(".modal-overlay");

const openBtn = document.getElementById("openAddModalBtn");
const closeBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const saveMsg = document.getElementById("saveMsg");
const form = document.getElementById("addWorkoutForm");

const addExerciseBtn = document.getElementById("addExerciseBtn");
const exercisesList = document.getElementById("exercisesList");

const workoutList = document.getElementById("workoutList");

const confirmPopup = document.getElementById("confirmPopup");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let editingId = null;
let deleteIndex = null;




function openAddModal() {
  editingId = null;
  form.reset();
  exercisesList.innerHTML = "";
  addExerciseRow();

  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

function openEditModal(workout) {
  editingId = workout.id;
  form.reset();
  exercisesList.innerHTML = "";

  form.workoutName.value = workout.name ?? "";
  form.workoutDate.value = workout.date ?? "";
  form.muscleGroup.value = workout.muscleGroup ?? "";

  if (Array.isArray(workout.exercises) && workout.exercises.length > 0) {
    workout.exercises.forEach(ex => {
      addExerciseRow({
        name: ex.name ?? "",
        sets: ex.sets ?? "",
        reps: ex.reps ?? "",
        weight: ex.weight ?? ""
      });
    });
  } else {
    addExerciseRow();
  }

  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("show");
  document.body.classList.remove("modal-open");
}

openBtn.addEventListener("click", openAddModal);
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

window.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});




function addExerciseRow(prefill = {}) {
  const row = document.createElement("div");
  row.className = "ex-row";

  row.innerHTML = `
    <label class="field wide">
      <span>Exercise</span>
      <input type="text" name="exName" required placeholder="Bench Press" value="${prefill.name || ""}">
    </label>

    <label class="field">
      <span>Sets</span>
      <input type="number" name="exSets" min="1" step="1" required value="${prefill.sets || ""}">
    </label>

    <label class="field">
      <span>Reps</span>
      <input type="number" name="exReps" min="1" step="1" required value="${prefill.reps || ""}">
    </label>

    <label class="field">
      <span>Weight (lbs)</span>
      <input type="number" name="exWeight" min="0" step="1" value="${prefill.weight || ""}">
    </label>

    <button type="button" class="remove-ex">Remove</button>
  `;

  row.querySelector(".remove-ex").addEventListener("click", () => row.remove());
  exercisesList.appendChild(row);
}

addExerciseBtn.addEventListener("click", () => addExerciseRow());



form.addEventListener("submit", e => {
  e.preventDefault();

  const name = form.workoutName.value.trim();
  if (!name) return toast("Please enter a workout name.", true);

  const rows = [...exercisesList.querySelectorAll(".ex-row")];
  if (rows.length === 0) return toast("You must add at least one exercise.", true);

  const exercises = rows.map(r => {
    const exName = r.querySelector('input[name="exName"]').value.trim();
    const sets = r.querySelector('input[name="exSets"]').value;
    const reps = r.querySelector('input[name="exReps"]').value;
    const weightValue = r.querySelector('input[name="exWeight"]').value;

    return {
      name: exName,
      sets: Number(sets),
      reps: Number(reps),
      weight: weightValue === "" ? null : Number(weightValue)
    };
  });

  const newWorkout = {
    id: editingId || Date.now(),
    name,
    date: form.workoutDate.value || null,
    muscleGroup: form.muscleGroup.value || null,
    exercises
  };

  const list = getWorkouts();

  if (editingId) {
    const index = list.findIndex(w => w.id === editingId);
    if (index !== -1) list[index] = newWorkout;
    toast(`Saved "${newWorkout.name}".`);
  } else {
    list.unshift(newWorkout);
    toast(`Saved "${newWorkout.name}".`);
  }

  saveWorkouts(list);
  renderWorkouts();
  closeModal();
});



let toastTimer = null;

function toast(message, isError = false) {
  clearTimeout(toastTimer);
  saveMsg.textContent = message;
  saveMsg.style.color = isError ? "#991b1b" : "#065f46";

  toastTimer = setTimeout(() => {
    saveMsg.textContent = "";
  }, 3500);
}




function renderWorkouts() {
  const workouts = getWorkouts();
  workoutList.innerHTML = "";

  workouts.forEach((w, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "workout-item";

    const date = w.date ? ` – ${new Date(w.date).toLocaleDateString()}` : "";

    wrapper.innerHTML = `
      <span class="workout-name">${w.name}${date}</span>
      <button class="delete-workout-btn" data-index="${i}">✕</button>
    `;

    wrapper
      .querySelector(".workout-name")
      .addEventListener("click", () => openEditModal(w));

    workoutList.appendChild(wrapper);
  });
}

renderWorkouts();




document.addEventListener("click", e => {
  if (e.target.classList.contains("delete-workout-btn")) {
    deleteIndex = Number(e.target.dataset.index);
    confirmPopup.classList.remove("hidden");
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  deleteIndex = null;
  confirmPopup.classList.add("hidden");
});

confirmDeleteBtn.addEventListener("click", () => {
  if (deleteIndex !== null) {
    const list = getWorkouts();
    list.splice(deleteIndex, 1);
    saveWorkouts(list);
    renderWorkouts();
  }

  deleteIndex = null;
  confirmPopup.classList.add("hidden");
});
// ========================================================
// AUTO-ADD WORKOUT WHEN URL HAS ?add=top
// ========================================================
function autoAddTopWorkout() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("add") !== "top") return;

  const list = getWorkouts();

  const topWorkout = {
    id: Date.now(),
    name: "Top Ranked Workout",
    date: new Date().toISOString().split("T")[0],
    muscleGroup: "Full Body",
    exercises: [
      { name: "Squats", sets: 4, reps: 10, weight: 135 },
      { name: "Bench Press", sets: 4, reps: 8, weight: 95 },
      { name: "Deadlift", sets: 3, reps: 5, weight: 155 }
    ]
  };

  list.unshift(topWorkout);
  saveWorkouts(list);
  renderWorkouts();
  toast("Top Ranked Workout added!");


  window.history.replaceState({}, "", "workout.html");
}

autoAddTopWorkout();




