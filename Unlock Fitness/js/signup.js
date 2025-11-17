// signup.js
// Handles creating new accounts in localStorage (multiple users supported)

// Load existing users
function loadUsers() {
  const raw = localStorage.getItem("users");
  if (!raw) return [];
  try { return JSON.parse(raw); }
  catch (e) { return []; }
}

// Save updated users
function saveUsers(arr) {
  localStorage.setItem("users", JSON.stringify(arr));
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signup-form");
  const err = document.getElementById("signup-error");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirm = form.confirmPassword.value.trim();

    if (password !== confirm) {
      err.textContent = "Passwords do not match.";
      return;
    }

    const users = loadUsers();
    const exists = users.find(u => u.email === email);

    if (exists) {
      err.textContent = "This email is already registered.";
      return;
    }

    // Add new user
    users.push({ email, password });
    saveUsers(users);

    // Redirect to login
    window.location.href = "login.html";
  });
});
