// profile.js
// Handles the "Share to Community" form and localStorage persistence

// Utility: load posts from localStorage
function loadCommunityPosts() {
  const raw = localStorage.getItem('communityPosts');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch (e) { console.error('Invalid communityPosts JSON', e); return []; }
}

// Utility: save posts back to localStorage
function saveCommunityPosts(posts) {
  localStorage.setItem('communityPosts', JSON.stringify(posts));
}

document.addEventListener('DOMContentLoaded', function () {
  const shareForm = document.getElementById('share-form');
  const shareError = document.getElementById('share-error');

  if (!shareForm) return;

  shareForm.addEventListener('submit', function (ev) {
    ev.preventDefault();
    shareError.textContent = '';

    const text = (shareForm.text.value || '').trim();

    // FIXED: original code expected shareForm.author which does not exist.
    // We now pull the username directly from the profile page.
    const usernameEl = document.querySelector('.username');
    const author = usernameEl ? usernameEl.textContent.trim() : 'Anonymous';

    if (!text) {
      shareError.textContent = 'Please write something to share.';
      return;
    }

    const post = {
      id: Date.now().toString(),
      authorName: author,
      avatar: 'assets/default-profile.png',
      timestamp: Date.now(),
      text: text
    };

    const posts = loadCommunityPosts();
    posts.unshift(post);
    saveCommunityPosts(posts);

    // Redirect to community page to view the new post
    window.location.href = 'community.html';
  });
});
