// login.js
// Handles login using user accounts stored in localStorage

// Load all accounts
function loadUsers() {
  const raw = localStorage.getItem("users");
  if (!raw) return [];
  try { return JSON.parse(raw); }
  catch (e) { return []; }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const err = document.getElementById("login-error");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    err.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    const users = loadUsers();
    const match = users.find(u => u.email === email && u.password === password);

    if (!match) {
      err.textContent = "Invalid email or password.";
      return;
    }

    // Save current user
    localStorage.setItem("currentUser", email);

    // Go to profile
    window.location.href = "profile.html";
  });
});
