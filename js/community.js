// community.js
// Renders posts from localStorage and seeds sample posts if none exist

// escape helper
function escapeHtml(str) {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

// relative time helper
function formatTimeAgo(ts) {
  const delta = Math.floor((Date.now() - ts) / 1000);
  if (delta < 60) return delta + 's';
  if (delta < 3600) return Math.floor(delta/60) + 'm';
  if (delta < 86400) return Math.floor(delta/3600) + 'h';
  return Math.floor(delta/86400) + 'd';
}

function loadCommunityPosts() {
  const raw = localStorage.getItem('communityPosts');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { console.error(e); return []; }
}
function saveCommunityPosts(posts) {
  localStorage.setItem('communityPosts', JSON.stringify(posts));
}

function seedSamplePostsIfEmpty() {
  const existing = loadCommunityPosts();
  if (existing.length) return;
  const samples = [
    {
      id: 's1',
      authorName: 'Ashley M.',
      avatar: 'assets/default-profile.png',
      timestamp: Date.now() - (1000*60*60*2),
      text: 'Morning HIIT finished! Swapped cereal for an egg-and-spinach breakfast — strong start.'
    },
    {
      id: 's2',
      authorName: 'Jordan K.',
      avatar: 'assets/default-profile.png',
      timestamp: Date.now() - (1000*60*60*6),
      text: 'Five nights of consistent sleep with a wind-down routine. Better energy today.'
    },
    {
      id: 's3',
      authorName: 'Riley P.',
      avatar: 'assets/default-profile.png',
      timestamp: Date.now() - (1000*60*60*24),
      text: 'Meal prep: chicken, roasted veg, quinoa. Macros are finally on track.'
    },
    {
      id: 's4',
      authorName: 'Chris L.',
      avatar: 'assets/default-profile.png',
      timestamp: Date.now() - (1000*60*60*30),
      text: 'Completed 5k run this morning. Felt great crossing the finish line.'
    }
  ];
  saveCommunityPosts(samples);
}

function renderCommunityPosts() {
  const container = document.getElementById('posts-list');
  if (!container) return;
  const posts = loadCommunityPosts();
  container.innerHTML = '';

  if (!posts.length) {
    container.innerHTML = '<div class="empty">No posts yet. Share something from your profile.</div>';
    return;
  }

  posts.forEach(post => {
    const art = document.createElement('article');
    art.className = 'post';
    art.innerHTML = `
      <img class="post-avatar" src="${escapeHtml(post.avatar)}" alt="${escapeHtml(post.authorName)}">
      <div class="post-body">
        <h4>${escapeHtml(post.authorName)}</h4>
        <div class="timestamp">${formatTimeAgo(post.timestamp)}</div>
        <p>${escapeHtml(post.text)}</p>
      </div>
    `;
    container.appendChild(art);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  seedSamplePostsIfEmpty();
  renderCommunityPosts();

  // update if another tab changes the posts
  window.addEventListener('storage', function (ev) {
    if (ev.key === 'communityPosts') {
      renderCommunityPosts();
    }
  });
});
