// Loads community posts from localStorage
function loadCommunityPosts() {
  const raw = localStorage.getItem('communityPosts');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch {
    return [];
  }
}

// Escape HTML helper
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Format "time ago"
function formatTimeAgo(ts) {
  const delta = Math.floor((Date.now() - ts) / 1000);
  if (delta < 60) return delta + "s";
  if (delta < 3600) return Math.floor(delta / 60) + "m";
  if (delta < 86400) return Math.floor(delta / 3600) + "h";
  return Math.floor(delta / 86400) + "d";
}

function renderFeaturedPosts() {
  const container = document.getElementById("featured-posts");
  if (!container) return;

  const posts = loadCommunityPosts();

  // show only the first 3
  const top3 = posts.slice(0, 3);

  container.innerHTML = "";

  top3.forEach(post => {
    const card = document.createElement("div");
    card.className = "community-card post";

    card.innerHTML = `
      <img class="post-avatar" src="${escapeHtml(post.avatar)}" alt="${escapeHtml(post.authorName)}">
      <div class="post-body">
        <h4>${escapeHtml(post.authorName)}</h4>
        <div class="timestamp">${formatTimeAgo(post.timestamp)}</div>
        <p>${escapeHtml(post.text)}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderFeaturedPosts);
