const STORAGE_KEY = "socialContentCalendarPosts";
const form = document.getElementById("postForm");
const postList = document.getElementById("postList");
const emptyState = document.getElementById("emptyState");
const formMessage = document.getElementById("formMessage");
const filterPlatform = document.getElementById("filterPlatform");
const filterStatus = document.getElementById("filterStatus");

let posts = loadPosts();

function loadPosts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

function readableDate(dateString) {
  if (!dateString) return "Date not set";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric"
  });
}

function renderPosts() {
  const platform = filterPlatform.value;
  const status = filterStatus.value;
  const filteredPosts = posts
    .filter(post => platform === "All" || post.platform === platform)
    .filter(post => status === "All" || post.status === status)
    .sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById("totalCount").textContent = posts.length;
  document.getElementById("scheduledCount").textContent = posts.filter(post => post.status === "Scheduled").length;
  document.getElementById("publishedCount").textContent = posts.filter(post => post.status === "Published").length;
  emptyState.hidden = filteredPosts.length > 0;
  postList.innerHTML = filteredPosts.map(post => `
    <article class="post-card">
      <div>
        <div class="post-top">
          <span class="pill">${escapeHTML(post.platform)}</span>
          <span class="pill type">${escapeHTML(post.type)}</span>
          <span class="pill">${escapeHTML(post.status)}</span>
        </div>
        <h3>${escapeHTML(post.title)}</h3>
        <p class="post-date">📅 ${escapeHTML(readableDate(post.date))}</p>
        ${post.caption ? `<p class="post-caption">${escapeHTML(post.caption)}</p>` : ""}
        ${post.hashtags ? `<p class="hashtags">${escapeHTML(post.hashtags)}</p>` : ""}
      </div>
      <div class="post-actions">
        <button class="small-btn" data-action="toggle" data-id="${escapeHTML(post.id)}">${post.status === "Scheduled" ? "Mark published" : "Mark scheduled"}</button>
        <button class="small-btn delete" data-action="delete" data-id="${escapeHTML(post.id)}">Delete</button>
      </div>
    </article>
  `).join("");
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const post = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: document.getElementById("title").value.trim(),
    platform: document.getElementById("platform").value,
    date: document.getElementById("date").value,
    type: document.getElementById("type").value,
    caption: document.getElementById("caption").value.trim(),
    hashtags: document.getElementById("hashtags").value.trim(),
    status: "Scheduled"
  };

  if (!post.title || !post.date) {
    formMessage.textContent = "Please add a title and publish date.";
    return;
  }

  posts.push(post);
  savePosts();
  renderPosts();
  form.reset();
  formMessage.textContent = "Post added to your calendar!";
  document.getElementById("title").focus();
  setTimeout(() => { formMessage.textContent = ""; }, 3000);
});

postList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;

  if (action === "delete") {
    posts = posts.filter(post => post.id !== id);
  } else if (action === "toggle") {
    posts = posts.map(post => post.id === id
      ? { ...post, status: post.status === "Scheduled" ? "Published" : "Scheduled" }
      : post);
  }

  savePosts();
  renderPosts();
});

filterPlatform.addEventListener("change", renderPosts);
filterStatus.addEventListener("change", renderPosts);

// Set the date field to today as a helpful default.
document.getElementById("date").value = new Date().toLocaleDateString("en-CA");
renderPosts();
