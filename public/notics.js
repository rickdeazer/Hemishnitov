/* ============================================================
   notics.js  –  PRODUCTION VERSION
   ============================================================ */

"use strict";

/* ── Shared helpers ─────────────────────────────────────── */

async function _post(url, body = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}`);
  return res.json();
}

async function _del(url) {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${url} → ${res.status}`);
  return res.json();
}

function _makeModal(id, innerHTML) {
  let m = document.getElementById(id);
  if (!m) {
    m = document.createElement("div");
    m.id = id;
    m.style.cssText =
      "display:none; position:fixed; inset:0; z-index:10000;" +
      "align-items:center; justify-content:center;" +
      "background:rgba(8,2,12,0.94);";
    m.innerHTML = innerHTML;
    document.body.appendChild(m);
  }
  return m;
}

function _showModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "flex";
}

function _hideModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = "none";
}

/* ── Notics (system / social notifications) ─────────────── */

const Notics = (() => {

  function viewArena(btn, arenaId) {
    Arenas.viewArena(btn, arenaId);
  }

  function viewFriendRequest(btn, senderId) {
    alert(`Viewing friend request from: ${senderId}`);
  }

  function viewEvent(btn, arenaId) {
    Arenas.viewArena(btn, arenaId);
  }

  async function followBack(btn, targetUserId) {
    btn.disabled = true;
    try {
      await _post(`/follow/${targetUserId}`);
      btn.textContent = "Following";
    } catch {
      alert("Could not follow back.");
    } finally {
      btn.disabled = false;
    }
  }

  function init() { /* no top-level bindings needed for Notics */ }

  return { viewArena, viewFriendRequest, viewEvent, followBack, init };
})();

/* ── Arenas ─────────────────────────────────────────────── */

const Arenas = (() => {

  async function viewArena(btn, arenaId) {
    try {
      const res = await fetch(`/arenas/${arenaId}`);
      if (!res.ok) throw new Error("Failed to fetch arena details.");
      const arena = await res.json();

      const html = `
        <div class="arena-modal">
          <div class="modal-content" style="max-width:480px;">
            <div class="modal-header">
              <div class="modal-title">🏟️ ${arena.title}</div>
              <button class="close-btn" onclick="Arenas.closeArenaModal()">✕</button>
            </div>
            <div class="modal-body">
              <p>${arena.description}</p>
              <p><strong>Attendees:</strong> <span class="attendee-count">${arena.attendees}</span></p>
              <p><strong>Inspired:</strong> <span class="inspire-count">${arena.inspired}</span></p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" onclick="Arenas.closeArenaModal()">Close</button>
              <button class="btn-action" onclick="Arenas.joinArena(this, '${arena._id}')">Join Arena</button>
              <button class="btn-action${arena.userInspired ? " inspired" : ""}"
                      onclick="Arenas.toggleInspire(this, '${arena._id}')">
                ${arena.userInspired ? "Inspired" : "Inspire"}
              </button>
            </div>
          </div>
        </div>`;

      _makeModal("arena-view-modal", html);
      _showModal("arena-view-modal");
    } catch (err) {
      alert(err.message);
    }
  }

  function closeArenaModal() {
    _hideModal("arena-view-modal");
  }

  async function joinArena(btn, arenaId) {
    btn.disabled = true;
    try {
      await _post(`/arenas/${arenaId}/join`);
      const countEl = document.querySelector(".arena-modal .attendee-count");
      if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
      btn.textContent = "Joined!";
    } catch {
      alert("Could not join arena.");
      btn.disabled = false;
    }
  }

  async function toggleInspire(btn, arenaId) {
    const isInspired = btn.classList.contains("inspired");
    try {
      if (isInspired) {
        await _del(`/arenas/${arenaId}/inspire`);
      } else {
        await _post(`/arenas/${arenaId}/inspire`);
      }
      btn.classList.toggle("inspired");
      btn.textContent = isInspired ? "Inspire" : "Inspired";
      const countEl = document.querySelector(".arena-modal .inspire-count");
      if (countEl) {
        countEl.textContent = parseInt(countEl.textContent) + (isInspired ? -1 : 1);
      }
    } catch {
      alert("Failed to toggle inspire.");
    }
  }

  function openPostModal() {
    const html = `
      <div class="arena-modal small-popup">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">🏟️ Post New Arena</div>
            <button class="close-btn" onclick="Arenas.closePostModal()">✕</button>
          </div>
          <div class="modal-body">
            <input type="text" id="arena-title" placeholder="Arena Title"
                   style="width:100%; padding:10px; margin-bottom:10px;">
            <textarea id="arena-desc" rows="4" placeholder="Description…"
                      style="width:100%; padding:10px;"></textarea>
            <div id="arena-error" style="color:red; display:none; margin-top:10px;"></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" onclick="Arenas.closePostModal()">Cancel</button>
            <button class="btn-action" onclick="Arenas.submitArena()">Post Arena</button>
          </div>
        </div>
      </div>`;

    _makeModal("arena-post-modal", html);
    _showModal("arena-post-modal");
  }

  function closePostModal() {
    _hideModal("arena-post-modal");
  }

  async function submitArena() {
    const title   = document.getElementById("arena-title").value.trim();
    const desc    = document.getElementById("arena-desc").value.trim();
    const errorEl = document.getElementById("arena-error");
    const btn     = document.querySelector("#arena-post-modal .btn-action");

    errorEl.style.display = "none";

    if (!title) {
      errorEl.textContent = "Title is required.";
      errorEl.style.display = "block";
      return;
    }
    if (!desc) {
      errorEl.textContent = "Description is required.";
      errorEl.style.display = "block";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Posting…";

    try {
      const newArena = await _post("/arenas", { title, description: desc });
      if (!newArena._id) throw new Error("Arena not created.");
      closePostModal();
      Nounces.showToast("Arena posted successfully!", "success");
      // Optionally: dynamically prepend a new arena card here
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = "block";
      btn.disabled = false;
      btn.textContent = "Post Arena";
    }
  }

  function init() {
    const postBtn = document.querySelector(".btn-post-arena");
    if (postBtn && !postBtn.dataset.wired) {
      postBtn.addEventListener("click", openPostModal);
      postBtn.dataset.wired = "true";
    }
  }

  return {
    viewArena,
    closeArenaModal,
    joinArena,
    toggleInspire,
    openPostModal,
    closePostModal,
    submitArena,
    init,
  };
})();

/* ── Nounces (announcements, subscriptions, timetables) ──── */

const Nounces = (() => {

  /* ── Toast ── */
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("visible"), 10);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ── Keep / Unkeep ── */
  async function toggleKeep(btn) {
    const id = btn.dataset.announcementId;
    if (!id) return;
    const isKept = btn.classList.contains("kept");
    btn.disabled = true;
    try {
      if (isKept) {
        await _del(`/announcements/${id}/keep`);
        btn.classList.remove("kept");
        btn.textContent = "Keep";
      } else {
        await _post(`/announcements/${id}/keep`);
        btn.classList.add("kept");
        btn.textContent = "Kept";
      }
    } catch {
      alert("Could not update keep status.");
    } finally {
      btn.disabled = false;
    }
  }

  /* ── Announce options (opens the announcement modal) ── */
  function showAnnounceOptions() {
    openAnnounceModal();
  }

  /* ── Announcement modal ── */
  function openAnnounceModal() {
    const html = `
      <div class="announce-modal small-popup">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">📢 New Announcement</div>
            <button class="close-btn" onclick="Nounces.closeAnnounceModal()">✕</button>
          </div>
          <div class="modal-body">
            <input type="text" id="ann-title" placeholder="Announcement title" maxlength="100">
            <textarea id="ann-body" rows="5" placeholder="Write your announcement here…"></textarea>
            <div class="ends-on">
              <label>Ends on</label>
              <input type="datetime-local" id="ann-ends">
            </div>
            <label class="custom-file-btn">
              📎 Attach image (optional)
              <input type="file" id="ann-image" accept="image/*"
                     onchange="Nounces.handleAnnImageChange()">
            </label>
            <div id="ann-preview" class="image-preview" style="display:none;">
              <img id="ann-preview-img" alt="Preview">
              <button type="button" onclick="Nounces.removeAnnImage()">Remove</button>
            </div>
            <div id="ann-error" class="ann-error" style="display:none;"></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" onclick="Nounces.closeAnnounceModal()">Cancel</button>
            <button class="btn-post-announce" onclick="Nounces.submitAnnouncement()">📢 Post</button>
          </div>
        </div>
      </div>`;

    _makeModal("announce-modal", html);
    _showModal("announce-modal");
  }

  function closeAnnounceModal() {
    _hideModal("announce-modal");
  }

  /* ── Image preview helpers ── */
  function handleAnnImageChange() {
    const fileInput    = document.getElementById("ann-image");
    const previewWrap  = document.getElementById("ann-preview");
    const previewImg   = document.getElementById("ann-preview-img");
    if (!fileInput || !previewWrap || !previewImg) return;

    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewWrap.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      previewWrap.style.display = "none";
      previewImg.src = "";
    }
  }

  function removeAnnImage() {
    const fileInput   = document.getElementById("ann-image");
    const previewWrap = document.getElementById("ann-preview");
    const previewImg  = document.getElementById("ann-preview-img");
    if (!fileInput || !previewWrap || !previewImg) return;
    fileInput.value = "";
    previewWrap.style.display = "none";
    previewImg.src = "";
  }

  /* ── Submit announcement ── */
  async function submitAnnouncement() {
    const title     = document.getElementById("ann-title").value.trim();
    const body      = document.getElementById("ann-body").value.trim();
    const endsAt    = document.getElementById("ann-ends").value;
    const imgFile   = document.getElementById("ann-image").files[0];
    const errorEl   = document.getElementById("ann-error");
    const submitBtn = document.querySelector(".btn-post-announce");

    errorEl.style.display = "none";

    if (!body) {
      errorEl.textContent = "Announcement text cannot be empty.";
      errorEl.style.display = "block";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Posting…";

    try {
      const fd = new FormData();
      fd.append("title",  title);
      fd.append("body",   body);
      fd.append("endsAt", endsAt);
      if (imgFile) fd.append("image", imgFile);

      const res = await fetch("/announcements", { method: "POST", body: fd });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post.");
      }

      const newAnn = await res.json();
      closeAnnounceModal();
      appendToFeed(newAnn);
      showToast("Announcement posted successfully!", "success");
    } catch (err) {
      console.error("Submit Announcement Error:", err);
      errorEl.textContent = `Could not post announcement: ${err.message}`;
      errorEl.style.display = "block";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "📢 Post";
    }
  }

  /* ── Append new announcement card to feed ── */
  function appendToFeed(ann) {
    const feed = document.getElementById("announcements-feed");
    if (!feed) return;

    const card = document.createElement("div");
    card.className = "announcement-post";
    card.dataset.announcementId = ann._id;
    card.innerHTML = `
      <div class="announcement-header">
        <div class="announcement-profile"
             style="background-image:url('${ann.author.profileLink || "/mediafiles/defaultProfile.png"}');"></div>
        <div>
          <div class="announcement-username">${ann.author.username}</div>
          <div class="announcement-time">Posted just now</div>
        </div>
      </div>
      <div class="announcement-body">
        ${ann.title
          ? `<h3 style="font-weight:bold;font-size:1.2rem;margin-bottom:8px;
                        color:var(--accent-magenta);">${ann.title}</h3>`
          : ""}
        <p style="line-height:1.6;">${ann.body}</p>
        ${ann.image
          ? `<img src="${ann.image}" alt="Announcement image"
                  style="max-width:100%;margin-top:10px;border-radius:8px;">`
          : ""}
      </div>
      <div class="announcement-footer">
        <div class="end-time">
          Ends: ${ann.endsAt ? new Date(ann.endsAt).toDateString() : "N/A"}
        </div>
        <button class="keep-btn" data-announcement-id="${ann._id}">Keep</button>
      </div>`;

    const keepBtn = card.querySelector(".keep-btn");
    if (keepBtn) keepBtn.onclick = function () { Nounces.toggleKeep(this); };

    feed.prepend(card);
  }

  /* ── Subscribe to announcer ── */
  function showSubscribeModal() {
    const html = `
      <div class="announce-modal small-popup">
        <div class="modal-content" style="max-width:380px;">
          <div class="modal-header">
            <div class="modal-title">🔖 Subscribe to Announcer</div>
            <button class="close-btn" onclick="Nounces.closeSubscribeModal()">✕</button>
          </div>
          <div class="modal-body">
            <input type="text" id="subscribe-username"
                   placeholder="Enter username (e.g. RickDeazer)">
            <div id="subscribe-error" style="color:red;margin-top:10px;display:none;"></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" onclick="Nounces.closeSubscribeModal()">Cancel</button>
            <button class="btn-post-announce" onclick="Nounces.subscribeToUser()">Subscribe</button>
          </div>
        </div>
      </div>`;

    _makeModal("subscribe-modal", html);
    _showModal("subscribe-modal");
  }

  function closeSubscribeModal() {
    _hideModal("subscribe-modal");
  }

  async function subscribeToUser() {
    const username = document.getElementById("subscribe-username").value.trim();
    const errorEl  = document.getElementById("subscribe-error");

    errorEl.style.display = "none";

    if (!username) {
      errorEl.textContent = "Please enter a username.";
      errorEl.style.display = "block";
      return;
    }
    try {
      await _post("/subscribe/announcer", { username });
      closeSubscribeModal();
      showToast(`Successfully subscribed to ${username}!`, "success");
    } catch {
      errorEl.textContent = "Failed to subscribe. User may not exist.";
      errorEl.style.display = "block";
    }
  }

  /* ── Filter kept announcements ── */
  function filterKept() {
    const feed      = document.getElementById("announcements-feed");
    const keptView  = document.getElementById("kept-view");
    const timetableView = document.getElementById("timetable-view");
    if (!feed || !keptView) return;

    feed.style.display = "none";
    if (timetableView) timetableView.style.display = "none";
    keptView.style.display = "block";
    keptView.innerHTML = "";

    const keptBtns = feed.querySelectorAll(".announcement-post .keep-btn.kept");
    if (!keptBtns.length) {
      keptView.innerHTML =
        `<div style="text-align:center;color:gray;padding:40px;">
           You haven't kept any announcements yet.
         </div>`;
      return;
    }

    keptBtns.forEach((btn) => {
      const card = btn.closest(".announcement-post").cloneNode(true);
      card.querySelector(".keep-btn").onclick = function () {
        Nounces.toggleKeep(this);
      };
      keptView.appendChild(card);
    });
  }

  /* ── Timetable view ── */
  async function showTimetable(btn) {
    const feed          = document.getElementById("announcements-feed");
    const keptView      = document.getElementById("kept-view");
    const timetableView = document.getElementById("timetable-view");
    if (!feed || !keptView || !timetableView) return;

    // Toggle off if already active
    if (btn && btn.classList.contains("active")) {
      feed.style.display          = "block";
      keptView.style.display      = "none";
      timetableView.style.display = "none";
      btn.classList.remove("active");
      return;
    }

    feed.style.display          = "none";
    keptView.style.display      = "none";
    timetableView.style.display = "block";
    if (btn) btn.classList.add("active");

    timetableView.innerHTML =
      `<div class="loading-spinner">Loading Timetables…</div>`;

    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add Timetable";
    addBtn.className   = "option-btn announce-btn";
    addBtn.style.cssText =
      "margin-bottom:20px;width:100%;border-radius:12px;padding:12px;";
    addBtn.onclick = () => Nounces.openTimetableModal();

    try {
      const res        = await fetch("/timetables");
      if (!res.ok) throw new Error("Failed to load timetables.");
      const timetables = await res.json();

      timetableView.innerHTML = "";
      timetableView.appendChild(addBtn);

      if (!timetables.length) {
        timetableView.innerHTML +=
          `<div style="text-align:center;color:gray;padding:40px;
                       font-family:'Lora';">No timetables found.</div>`;
        return;
      }

      timetables.forEach((t) => {
        const card = document.createElement("div");
        card.className = "announcement-post";
        card.innerHTML = `
          <div class="announcement-header">
            <div class="announcement-profile"
                 style="background-image:url('${t.author.profileLink || "/mediafiles/defaultProfile.png"}');"></div>
            <div>
              <div class="announcement-username">${t.author.username}</div>
              <div class="announcement-time">
                Posted ${new Date(t.postedDate).toDateString()}
              </div>
            </div>
          </div>
          <div class="announcement-body">
            <h3 style="font-weight:bold;font-size:1.2rem;margin-bottom:8px;
                       color:var(--accent-magenta);">${t.title}</h3>
            <p style="line-height:1.6;">${t.description}</p>
          </div>
          <div class="announcement-footer">
            <div class="end-time">
              Runs till: ${t.runsTill ? new Date(t.runsTill).toDateString() : "N/A"}
            </div>
          </div>`;
        timetableView.appendChild(card);
      });
    } catch (err) {
      timetableView.innerHTML =
        `<div style="color:red;text-align:center;padding:40px;">
           ${err.message}
         </div>`;
    }
  }

  /* ── Timetable modal ── */
  function openTimetableModal() {
    const html = `
      <div class="announce-modal small-popup">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">📅 New Timetable</div>
            <button class="close-btn" onclick="Nounces.closeTimetableModal()">✕</button>
          </div>
          <div class="modal-body">
            <input type="text" id="tt-title" placeholder="Timetable Title">
            <textarea id="tt-desc" rows="4" placeholder="Description…"></textarea>
            <div class="ends-on">
              <label>Runs till</label>
              <input type="date" id="tt-runs">
            </div>
            <div id="tt-error" style="color:red;display:none;margin-top:10px;"></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" onclick="Nounces.closeTimetableModal()">Cancel</button>
            <button class="btn-post-announce" onclick="Nounces.submitTimetable()">Post Timetable</button>
          </div>
        </div>
      </div>`;

    _makeModal("timetable-modal", html);
    _showModal("timetable-modal");
  }

  function closeTimetableModal() {
    _hideModal("timetable-modal");
  }

  async function submitTimetable() {
    const title       = document.getElementById("tt-title").value.trim();
    const description = document.getElementById("tt-desc").value.trim();
    const runsTill    = document.getElementById("tt-runs").value;
    const errorEl     = document.getElementById("tt-error");
    const submitBtn   = document.querySelector("#timetable-modal .btn-post-announce");

    errorEl.style.display = "none";

    if (!title) {
      errorEl.textContent = "Title is required.";
      errorEl.style.display = "block";
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = "Posting…";

    try {
      await _post("/timetables", { title, description, runsTill });
      closeTimetableModal();
      showToast("Timetable posted!", "success");
      await showTimetable(document.querySelector(".btn-timetable")); // refresh view
    } catch {
      errorEl.textContent = "Failed to post timetable.";
      errorEl.style.display = "block";
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = "Post Timetable";
    }
  }

  /* ── Init ── */
  function init() {
    const bindings = {
      ".btn-kept":      filterKept,
      ".btn-announce":  showAnnounceOptions,
      ".btn-subscribe": showSubscribeModal,
      ".btn-timetable": (e) => showTimetable(e.currentTarget),
    };

    Object.entries(bindings).forEach(([sel, fn]) => {
      const el = document.querySelector(sel);
      if (el && !el.dataset.wired) {
        el.addEventListener("click", fn);
        el.dataset.wired = "true";
      }
    });
  }

  return {
    showToast,
    toggleKeep,
    showAnnounceOptions,
    openAnnounceModal,
    closeAnnounceModal,
    handleAnnImageChange,
    removeAnnImage,
    submitAnnouncement,
    appendToFeed,
    showSubscribeModal,
    closeSubscribeModal,
    subscribeToUser,
    filterKept,
    showTimetable,
    openTimetableModal,
    closeTimetableModal,
    submitTimetable,
    init,
  };
})();

/* ── Bootstrap ──────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  Arenas.init();
  Nounces.init();
});