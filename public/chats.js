const root = document.getElementById("CHATS-PAGE");
const currentUser = root?.dataset?.currentUser?.trim() || "";
const socket = io();
const ringtone = new Audio("/mediafiles/sounds/ring1.mp3");
ringtone.loop = true;

const els = {
  contactsBody: document.getElementById("CONTACTS-BODY"),
  search: document.getElementById("CONTACTS-SEARCH"),
  chatView: document.getElementById("CHAT-VIEW"),
  back: document.getElementById("CHAT-BACK-BTN"),
  username: document.getElementById("CHAT-VIEW-USERNAME"),
  slogan: document.getElementById("CHAT-VIEW-SLOGAN"),
  profile: document.getElementById("CHAT-VIEW-PROFILEPIC"),
  scroll: document.getElementById("CHAT-SCROLL-REGION"),
  body: document.getElementById("chatBody"),
  message: document.getElementById("MESSAGE-INPUT"),
  send: document.getElementById("SEND-BTN"),
  fileIcon: document.getElementById("FILE-ICON"),
  mediaPopup: document.getElementById("mediaPopup"),
  picBtn: document.getElementById("PIC-BTN"),
  imageInput: document.getElementById("imageInput"),
  voiceCall: document.getElementById("VOICE-CALL"),
  videoCall: document.getElementById("VIDEO-CALL"),
  adminLock: document.querySelector(".admin-lock"),
  messageDiv: document.getElementById("MESSAGE-DIV"),
  callOverlay: document.getElementById("CALL-OVERLAY"),
  callTitle: document.getElementById("CALL-TITLE"),
  callStatus: document.getElementById("CALL-STATUS"),
  remoteAudio: document.getElementById("remoteAudio"),
  remoteVideo: document.getElementById("remoteVideo"),
  localVideo: document.getElementById("localVideo"),
  toggleCam: document.getElementById("toggleCam"),
  toggleMic: document.getElementById("toggleMic"),
  hangup: document.getElementById("hangup"),
  incoming: document.getElementById("incomingCallPopup"),
  incomingText: document.getElementById("incomingCallText"),
  acceptCall: document.getElementById("acceptCallBtn"),
  declineCall: document.getElementById("declineCallBtn"),
  modal: document.getElementById("create-group-modal"),
  nameInput: document.getElementById("group-name-input"),
  fileInput: document.getElementById("group-icon-file"),
  previewImg: document.getElementById("preview-img"),
  placeholderIcon:
    document.querySelector("#icon-preview .placeholder-icon") ||
    document.querySelector(".placeholder-icon"),
  cancelBtn: document.getElementById("create-group-cancel"),
  submitBtn: document.getElementById("create-group-submit"),
  fab: document.getElementById("fab-new-group"),
  groupsList: document.getElementById("groups-list"),
  groupsLoader: document.getElementById("groups-loader"),
};

const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.relay.metered.ca:80" },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "ed8ade22a5f3311aa8b5224c",
      credential: "ryeeze5nrrlbGFt0",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "ed8ade22a5f3311aa8b5224c",
      credential: "ryeeze5nrrlbGFt0",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "ed8ade22a5f3311aa8b5224c",
      credential: "ryeeze5nrrlbGFt0",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "ed8ade22a5f3311aa8b5224c",
      credential: "ryeeze5nrrlbGFt0",
    },
  ],
};

let contacts = [];
let activeChat = null;
let room = "";
let poller;
let pc = null;
let localStream = null;
let remoteStream = null;
let pendingCall = null;
let callMode = "audio";
let pendingIceCandidates = [];
let callTimeout = null;
let iceCandidateTimeout = null;
let callRetryCount = 0;
let connectionQuality = "good";
const MAX_CALL_RETRIES = 2;
const CALL_TIMEOUT_MS = 45000;
const ICE_TIMEOUT_MS = 10000;

if (currentUser) {
  localStorage.setItem("mainUser", JSON.stringify(currentUser));
  socket.emit("register", currentUser);
}

const esc = (v) =>
  String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const clock = () =>
  `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
const bubbleClass = (origin) =>
  origin === "sent" ? "SENDER-TEXT" : "RECEPIENT-TEXT";
const buildRoom = (a, b) =>
  [a, b]
    .map((v) =>
      String(v || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)
    .sort((x, y) => x.localeCompare(y))
    .join("--");

function scrollBottom(behavior = "smooth") {
  els.scroll?.scrollTo({ top: els.scroll.scrollHeight, behavior });
}

function renderBubble(data, origin) {
  const box = document.createElement("div");
  box.className = bubbleClass(origin);
  const type = data.msgType || data.type || "text";

  if (type === "image" || String(data.text || "").startsWith("image-")) {
    const url = type === "image" ? data.text : String(data.text).slice(6);
    box.innerHTML = `<img src="${url}" class="chat-img" alt="Shared image"><span class="TIME">${data.time || clock()}</span>`;
    return box;
  }

  box.innerHTML = `<span class="msgText">${esc(data.text || "")}</span><span class="TIME">${data.time || clock()}</span>`;
  return box;
}

async function markAsRead() {
  if (!activeChat?.username) return;
  try {
    await fetch("/markAsRead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mainUser: currentUser,
        receiver: activeChat.username,
      }),
    });
  } catch (err) {
    console.warn(err);
  }
}

async function loadContacts() {
  try {
    const res = await fetch("/chats/contacts");
    contacts = await res.json();
    paintContacts();
  } catch (err) {
    console.error(err);
  }
}

function paintContacts() {
  const query = els.search?.value?.trim().toLowerCase() || "";
  const list = query
    ? contacts.filter((c) =>
        [c.username, c.slogan, c.lastMessage].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(query),
        ),
      )
    : contacts;

  if (!list.length) {
    els.contactsBody.innerHTML = "";
    document.querySelector(".noticBanner")?.classList.remove("hidden");
    return;
  }
  document.querySelector(".noticBanner")?.classList.add("hidden");
  els.contactsBody.innerHTML = "";
  list.forEach((contact) => {
    let mark = contact.read? (contact.lastMessageFrom == currentUser? "🔵" : "") : (contact.lastMessageFrom == currentUser? "🟢" : "🟡");
    const card = document.createElement("div");
    card.className = "CONTACTS";
    card.innerHTML = `
      <div class="CONTACTS-PROFILEPIC" style="background-image:url('${contact.profileLink || ""}'); background-size:cover; background-position:center;"></div>
      <div class="CONTACTS-INFO">
        <div class="pageTexts">
          <div class="topItems">
            <h3 class="CONTACTS-USERNAME">${esc(contact.username)}</h3>
            <span class="BADGE" style="${contact.unreadCount ? "" : "display:none;"}">${contact.unreadCount ? `${contact.unreadCount} New` : ""}</span>
          </div>
          <h4 class="${contact.unreadCount ? "newMessage" : ""}">${esc(mark + " " + contact.lastMessage || "Start your conversation")}</h4>
        </div>
        <div class="CONTACTS-NOTE" style="${contact.slogan ? "" : "opacity:0;"}">${esc(contact.slogan || "")}</div>
      </div>
    `;

    card
      .querySelector(".CONTACTS-PROFILEPIC")
      .addEventListener("click", () => openUserProfile(contact.username));
    card
      .querySelector(".CONTACTS-INFO")
      .addEventListener("click", () => openChat(contact));
    els.contactsBody.appendChild(card);
  });
}

async function openChat(contact) {
  activeChat = {
    username: String(contact.username || "").trim(),
    profileLink: contact.profileLink || "",
    slogan: contact.slogan || "",
  };
  room = buildRoom(currentUser, activeChat.username);
  socket.emit("join-room", room);
  localStorage.setItem("chatInfo2", JSON.stringify(activeChat));

  els.chatView.classList.add("active");
  document.body.classList.add("chat-open");
  els.username.textContent = activeChat.username;
  els.slogan.textContent = activeChat.slogan || "Start talking";
  els.profile.style.backgroundImage = activeChat.profileLink
    ? `url(${activeChat.profileLink})`
    : "";
  els.profile.style.backgroundSize = "cover";
  els.profile.style.backgroundPosition = "center";

  const admin = activeChat.username === "Admin Control";
  els.messageDiv.style.display = admin ? "none" : "flex";
  els.adminLock.classList.toggle("hidden", !admin);

  try {
    const res = await fetch("/chat/path4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name2: activeChat.username }),
    });
    const data = await res.json();
    const all = [...(data.msgReceivedH || []), ...(data.msgSentH || [])].sort(
      (a, b) =>
        Number(String(a.time || "").replace(":", "")) -
        Number(String(b.time || "").replace(":", "")),
    );
    els.body.innerHTML = "";
    all.forEach((msg) => {
      const origin =
        String(msg.from || "").trim() === currentUser ? "sent" : "received";
      els.body.appendChild(renderBubble(msg, origin));
    });
    scrollBottom("auto");
    markAsRead();
  } catch (err) {
    console.error(err);
  }
}

function closeChat() {
  if (pc) endCall(false);
  activeChat = null;
  room = "";
  els.chatView.classList.remove("active");
  document.body.classList.remove("chat-open");
  els.body.innerHTML = "";
}

function sendMessage() {
  const text = els.message.value.trim();
  if (!text || !activeChat?.username) return;
  const time = clock();
  els.body.appendChild(renderBubble({ text, time, msgType: "text" }, "sent"));
  scrollBottom();
  els.message.value = "";
  els.message.style.height = "38px";
  socket.emit("message", {
    from: currentUser,
    to: activeChat.username,
    text,
    time,
    msgType: "text",
  });
}

async function uploadImage(file) {
  if (!activeChat?.username) return;
  const status = document.createElement("div");
  status.className = "SENDER-TEXT";
  status.innerHTML = `<div class="uploading-chip">Uploading image...</div>`;
  els.body.appendChild(status);
  scrollBottom();

  const formData = new FormData();
  formData.append("image", file);
  formData.append("from", currentUser);
  formData.append("to", activeChat.username);

  try {
    const res = await fetch("/upload-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Upload failed");
    const time = clock();
    status.innerHTML = `<img src="${data.url}" class="chat-img" alt="Uploaded image"><span class="TIME">${time}</span>`;
    socket.emit("message", {
      from: currentUser,
      to: activeChat.username,
      text: `image-${data.url}`,
      time,
      msgType: "image",
    });
  } catch (err) {
    status.innerHTML = `<div class="upload-error">${esc(err.message || "Upload failed")}</div>`;
  }
}

async function ensureLocalStream(mode) {
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: mode === "video",
  });
  els.localVideo.srcObject = mode === "video" ? localStream : null;
  els.localVideo.classList.toggle("hidden", mode !== "video");
  els.remoteVideo.classList.toggle("hidden", mode !== "video");
  els.toggleCam.classList.toggle("hidden", mode !== "video");
}

function createPeerConnection(mode) {
  callMode = mode;
  if (remoteStream) remoteStream.getTracks().forEach((t) => t.stop());
  remoteStream = new MediaStream();
  pc = new RTCPeerConnection(ICE_CONFIG);

  // Monitor ICE connection state and detect poor networks
  let iceGatheringStartTime = Date.now();

  pc.ontrack = (e) => {
    if (callTimeout) clearTimeout(callTimeout);

    e.streams[0].getTracks().forEach((track) => {
      if (!remoteStream.getTracks().find((t) => t.id === track.id))
        remoteStream.addTrack(track);
    });
    els.remoteAudio.srcObject = remoteStream;
    els.remoteAudio.play().catch(() => {});
    if (mode === "video") {
      els.remoteVideo.srcObject = remoteStream;
      els.remoteVideo.play().catch(() => {});
    }
    els.callStatus.textContent = "Connected ";
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("ice-candidate", { room, candidate: e.candidate });
    } else {
      // ICE gathering complete
      const gatherTime = Date.now() - iceGatheringStartTime;
    }
  };

  pc.onicecandidate = (e) => {
    if (e.candidate)
      socket.emit("ice-candidate", { room, candidate: e.candidate });
  };

  pc.onconnectionstatechange = () => {
    if (!pc) return;

    switch (pc.connectionState) {
      case "connected":
        if (callTimeout) clearTimeout(callTimeout);
        els.callStatus.textContent = "Connected ";
        break;
      case "disconnected":
        els.callStatus.textContent = "Reconnecting...";
        break;
      case "failed":
        els.callStatus.textContent =
          "Connection failed - attempting recovery...";
        setTimeout(() => {
          if (pc && pc.connectionState === "failed") endCall(false);
        }, 5000);
        break;
      case "closed":
        els.callStatus.textContent = "Call ended";
        break;
    }
  };

  pc.oniceconnectionstatechange = () => {
    if (!pc) return;

    switch (pc.iceConnectionState) {
      case "connected":
      case "completed":
        if (callTimeout) clearTimeout(callTimeout);
        connectionQuality = "good";
        break;
      case "checking":
        els.callStatus.textContent = "Connecting...";
        break;
      case "disconnected":
        els.callStatus.textContent = "Network unstable";
        connectionQuality = "poor";
        break;
      case "failed":
        els.callStatus.textContent = "Network connection failed";
        connectionQuality = "failed";
        break;
    }
  };

  // Handle RTC errors
  pc.onicecandidateerror = (event) => {
    console.warn("ICE candidate error:", event.errorCode, event.errorText);
    // Continue despite errors - some candidates may fail but others will work
  };
}

async function flushPendingIceCandidates() {
  if (!pc || !pendingIceCandidates.length) return;
  const queued = [...pendingIceCandidates];
  pendingIceCandidates = [];

  for (const candidate of queued) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("Failed to apply queued ICE candidate", err);
    }
  }
}

async function startCall(mode) {
  if (!activeChat?.username || !room) return;
  callRetryCount = 0;
  attemptCall(mode);
}

async function attemptCall(mode) {
  try {
    // Clear any existing timeout
    if (callTimeout) clearTimeout(callTimeout);

    await ensureLocalStream(mode);
    createPeerConnection(mode);
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    els.callTitle.textContent = `${mode === "video" ? "Video" : "Voice"} call with ${activeChat.username}`;
    els.callStatus.textContent = "Calling...";
    els.callOverlay.classList.add("active");
    socket.emit("video-offer", {
      room,
      offer,
      to: activeChat.username,
      from: currentUser,
      mediaType: mode,
    });

    // Set timeout for call response
    callTimeout = setTimeout(() => {
      if (
        callRetryCount < MAX_CALL_RETRIES &&
        pc &&
        pc.connectionState === "new"
      ) {
        callRetryCount++;
        els.callStatus.textContent = `Retrying... (${callRetryCount}/${MAX_CALL_RETRIES})`;
        endCall(false);
        setTimeout(() => attemptCall(mode), 1000);
      } else {
        els.callStatus.textContent = "Call timeout - No response";
        setTimeout(() => endCall(false), 2000);
      }
    }, CALL_TIMEOUT_MS);
  } catch (err) {
    console.error("Call start error:", err);
    if (err.name === "NotAllowedError") {
      els.callStatus.textContent = "Camera/Microphone permission denied";
    } else if (err.name === "NotFoundError") {
      els.callStatus.textContent = "No camera/microphone found";
    } else if (err.name === "NotReadableError") {
      els.callStatus.textContent = "Device already in use";
    } else {
      els.callStatus.textContent = "Failed to start call";
    }
  }
}

function endCall(emitLeave = true) {
  // Clear all timeouts
  if (callTimeout) clearTimeout(callTimeout);
  if (iceCandidateTimeout) clearTimeout(iceCandidateTimeout);

  ringtone.pause();
  ringtone.currentTime = 0;
  els.incoming.classList.remove("active");
  els.callOverlay.classList.remove("active");

  if (pc) {
    pc.close();
    pc = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach((t) => t.stop());
    remoteStream = null;
  }

  pendingIceCandidates = [];
  callRetryCount = 0;
  els.localVideo.srcObject = null;
  els.remoteVideo.srcObject = null;
  els.remoteAudio.srcObject = null;

  if (emitLeave && room) socket.emit("user-left", { room });
}
async function handleDeepLinkCall() {
  const urlParams = new URLSearchParams(window.location.search);
  
  const userFromUrl   = urlParams.get("user");
  const roomFromUrl   = urlParams.get("room");
  const mediaTypeFromUrl = urlParams.get("mediaType") || "audio";
  const action        = urlParams.get("action");

  if (!userFromUrl || !roomFromUrl || action !== "join-call") return;

  console.log(`📲 Deep link call from: ${userFromUrl}`);

  // Open the chat exactly like clicking a contact
  const contact = {
    username: userFromUrl,
    profileLink: "",
    slogan: ""
  };

  await openChat(contact);        // This reuses your existing function (best)

  // Set pending call (without offer yet)
  pendingCall = {
    offer: null,
    from: userFromUrl,
    room: roomFromUrl,
    mediaType: mediaTypeFromUrl
  };

  // Show ringing popup immediately
  ringtone.currentTime = 0;
  ringtone.play().catch(() => {});

  els.incomingText.textContent = `${userFromUrl} is calling (${mediaTypeFromUrl})`;
  els.incoming.classList.add("active");

  // Join room early
  socket.emit("join-room", roomFromUrl);

  // Clean URL
  window.history.replaceState({}, document.title, "/chats");
}

function openUserProfile(username) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/user";
  form.innerHTML = `<input type="hidden" name="username" value="${esc(username)}">`;
  document.body.appendChild(form);
  form.submit();
}

function showLoader(show = true) {
  if (els.groupsLoader) els.groupsLoader.style.display = show ? "flex" : "none";
}

async function loadMyGroups() {
  if (!els.groupsList) return;
  showLoader(true);
  els.groupsList.innerHTML = "";
  try {
    const res = await fetch("/api/groups/my-groups", {
      credentials: "include",
    });
    const groups = await res.json();
    (groups || []).forEach((group) => {
      const item = document.createElement("div");
      item.className = "group-item";
      item.innerHTML = `<div class="group-icon" style="${group.icon?.match?.(/^https?:\/\//) ? `background-image:url('${group.icon}'); background-size:cover; background-position:center;` : ""}">${group.icon?.match?.(/^https?:\/\//) ? "" : group.icon || '<span class="material-symbols-outlined">group</span>'}</div><div class="group-info"><div class="group-name">${esc(group.name || "Unnamed")}</div><div class="group-desc">${group.membersCount || group.members?.length || "?"} members</div></div>`;
      item.addEventListener(
        "click",
        () => group._id && (window.location.href = `/groupChats/${group._id}`),
      );
      els.groupsList.appendChild(item);
    });
  } catch (err) {
    console.error(err);
  } finally {
    showLoader(false);
  }
}

async function loadCallHistory() {
  const callsTab = document.getElementById("tab-calls");
  const placeholder = callsTab?.querySelector(".calls-placeholder");

  if (!placeholder) return;

  try {
    const res = await fetch("/api/call-history", {
      credentials: "include",   // ← Important for authentication
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const calls = data.calls || [];

    if (calls.length === 0) {
      placeholder.innerHTML = `
        <h3 style="text-align: center; color: #aaa; margin: 60px 20px 20px">
          No recent calls
        </h3>
        <p style="text-align: center; color: #666; margin: 10px 20px">
          Your call history will appear here
        </p>
      `;
      return;
    }

    // Clear and prepare for calls
    placeholder.innerHTML = `
      <h3 style="text-align: center; color: #aaa; margin: 20px 20px 10px">
        Recent calls
      </h3>
    `;

    calls.forEach((call) => {
      const callItem = document.createElement("div");
      callItem.className = `call-item ${call.isMissed ? "missed" : ""}`;

      // Time calculation
      const diffMs = Date.now() - new Date(call.timestamp);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      let timeString = diffDays > 0 
        ? (diffDays === 1 ? "Yesterday" : `${diffDays} days ago`)
        : diffHours > 0 
          ? `${diffHours}h ago`
          : diffMinutes > 0 
            ? `${diffMinutes}m ago` 
            : "Just now";

      // Add missed or duration info
      if (call.isMissed) {
        timeString += " • Missed";
      } else if (call.duration > 0) {
        const min = Math.floor(call.duration / 60);
        const sec = call.duration % 60;
        timeString += ` • ${min}:${sec.toString().padStart(2, "0")}`;
      }

      const icon = call.isMissed 
        ? "call_missed" 
        : call.type === "video" 
          ? "videocam" 
          : "call";

      callItem.innerHTML = `
        <div class="call-avatar" style="background: ${call.isMissed ? "#ff4444" : "#4CAF50"}"></div>
        <div class="call-info">
          <div class="call-name">${esc(call.user)} ${call.type === "video" ? "(Video)" : ""}</div>
          <div class="call-time">${timeString}</div>
        </div>
        <span class="call-type material-symbols-outlined">${icon}</span>
      `;

      // Click handler
      callItem.addEventListener("click", () => {
        const contact = contacts.find(c => c.username === call.user);
        
        openChat(contact || {
          username: call.user,
          profileLink: "",
          slogan: ""
        });
      });

      placeholder.appendChild(callItem);
    });

  } catch (err) {
    console.error("Failed to load call history:", err);
    placeholder.innerHTML = `
      <h3 style="text-align: center; color: #aaa; margin: 60px 20px 20px">
        Failed to load call history
      </h3>
    `;
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}s`;
}

async function createNewGroup() {
  const name = els.nameInput?.value?.trim();
  if (!name) return;
  const formData = new FormData();
  formData.append("name", name);
  if (els.fileInput?.files?.[0])
    formData.append("icon", els.fileInput.files[0]);

  try {
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "Creating...";
    const res = await fetch("/groups/create", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    els.modal?.classList.add("hidden");
    if (els.nameInput) els.nameInput.value = "";
    if (els.fileInput) els.fileInput.value = "";
    if (els.previewImg) els.previewImg.classList.add("hidden");
    els.placeholderIcon?.classList.remove("hidden");
    loadMyGroups();
  } catch (err) {
    console.error(err);
  } finally {
    els.submitBtn.disabled = false;
    els.submitBtn.textContent = "Create";
  }
}

socket.on("serverReply", (data) => {
  loadContacts();
  if (!activeChat?.username) return;
  const from = String(data.from || "").trim();
  const to = String(data.to || "").trim();
  if (from === currentUser) return;
  if (
    !(
      (from === activeChat.username && to === currentUser) ||
      (from === currentUser && to === activeChat.username)
    )
  )
    return;
  els.body.appendChild(renderBubble(data, "received"));
  scrollBottom();
  markAsRead();
});

socket.on("video-offer", async ({ offer, to, from, room: incomingRoom, mediaType }) => {
  if (to !== currentUser) return;

  const roomToUse = incomingRoom || buildRoom(currentUser, from);

  pendingCall = {
    offer: offer,           // Must have the real offer
    from: from,
    room: roomToUse,
    mediaType: mediaType || "audio"
  };

  ringtone.currentTime = 0;
  ringtone.play().catch(() => {});

  els.incomingText.textContent = `${from} is calling (${pendingCall.mediaType})`;
  els.incoming.classList.add("active");

  // Auto open chat if not already opened
  if (!activeChat || activeChat.username !== from) {
    const contact = contacts.find(c => c.username === from) || { username: from };
    openChat(contact);
  }
});
socket.on("video-answer", async ({ answer }) => {
  if (pc) {
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await flushPendingIceCandidates();
      els.callStatus.textContent = "Finishing connection...";
      if (callTimeout) clearTimeout(callTimeout);
    } catch (err) {
      console.error("Failed to set remote description:", err);
      els.callStatus.textContent = "Connection error - retrying...";
    }
  }
});

socket.on("ice-candidate", async ({ candidate }) => {
  if (!candidate) return;
  if (!pc || !pc.remoteDescription) {
    pendingIceCandidates.push(candidate);
    return;
  }

  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    // Ignore duplicate candidate errors
    if (!err.message.includes("Duplicate")) {
      console.warn("Failed to add ICE candidate", err);
      pendingIceCandidates.push(candidate);
    }
  }
});

socket.on("call-declined", () => {
  if (callTimeout) clearTimeout(callTimeout);
  els.callStatus.textContent = "Call declined";
  setTimeout(() => endCall(false), 1500);
});
socket.on("user-left", () => {
  if (callTimeout) clearTimeout(callTimeout);
  els.callStatus.textContent = "Other user ended call";
  setTimeout(() => endCall(false), 1500);
});

// Handle network changes
window.addEventListener("online", () => {
  if (pc && pc.connectionState === "failed") {
    els.callStatus.textContent = "Network restored, checking connection...";
  }
});

window.addEventListener("offline", () => {
  if (els.callOverlay.classList.contains("active")) {
    els.callStatus.textContent = "No network connection";
  }
});

els.send?.addEventListener("click", sendMessage);
els.back?.addEventListener("click", closeChat);
els.search?.addEventListener("input", paintContacts);
els.voiceCall?.addEventListener("click", () => startCall("audio"));
els.videoCall?.addEventListener("click", () => startCall("video"));
els.fileIcon?.addEventListener("click", () =>
  els.mediaPopup.classList.toggle("active"),
);
els.picBtn?.addEventListener("click", () => els.imageInput.click());
els.imageInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (file) uploadImage(file);
});
els.message?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
els.message?.addEventListener("input", () => {
  els.message.style.height = "auto";
  els.message.style.height = `${Math.min(els.message.scrollHeight, 95)}px`;
});
els.acceptCall?.addEventListener("click", async () => {
  if (!pendingCall) {
    console.error("No pending call data");
    return;
  }

  ringtone.pause();
  els.incoming.classList.remove("active");

  room = pendingCall.room;
  callMode = pendingCall.mediaType;

  try {
    await ensureLocalStream(callMode);
    createPeerConnection(callMode);
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    // CRITICAL: Check if we have the offer
    if (pendingCall.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(pendingCall.offer));
      await flushPendingIceCandidates();
    } else {
      console.warn("No offer received yet - waiting a bit...");
      await new Promise(resolve => setTimeout(resolve, 800)); // small grace period
      if (pendingCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingCall.offer));
      } else {
        els.callStatus.textContent = "Call failed - no offer received";
        setTimeout(() => endCall(false), 1500);
        return;
      }
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    els.callTitle.textContent = `${callMode === "video" ? "Video" : "Voice"} call with ${pendingCall.from}`;
    els.callStatus.textContent = "Connecting...";
    els.callOverlay.classList.add("active");

    socket.emit("video-answer", { 
      room, 
      answer, 
      mediaType: callMode 
    });

    pendingCall = null;

  } catch (err) {
    console.error("Accept call error:", err);
    els.callStatus.textContent = "Failed to accept call";
    setTimeout(() => endCall(false), 2000);
  }
});
els.declineCall?.addEventListener("click", () => {
  ringtone.pause();
  els.incoming.classList.remove("active");
  if (pendingCall?.room)
    socket.emit("call-declined", { room: pendingCall.room });
  pendingCall = null;
});
els.hangup?.addEventListener("click", () => endCall(true));
els.toggleMic?.addEventListener("click", () => {
  const track = localStream?.getAudioTracks?.()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  els.toggleMic.style.opacity = track.enabled ? "1" : "0.5";
});
els.toggleCam?.addEventListener("click", () => {
  const track = localStream?.getVideoTracks?.()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  els.toggleCam.style.opacity = track.enabled ? "1" : "0.5";
});

document.addEventListener("click", (e) => {
  if (
    els.mediaPopup &&
    els.fileIcon &&
    !els.mediaPopup.contains(e.target) &&
    e.target !== els.fileIcon
  ) {
    els.mediaPopup.classList.remove("active");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".nav-item")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.remove("active"));
      btn.classList.add("active");
      document
        .getElementById(`tab-${btn.dataset.tab}`)
        ?.classList.add("active");
      if (els.fab)
        els.fab.style.display =
          btn.dataset.tab === "communities" ? "flex" : "none";
      if (btn.dataset.tab === "communities") loadMyGroups();
      if (btn.dataset.tab === "calls") loadCallHistory();
    });
  });

  els.fab?.addEventListener("click", () => {
    els.modal?.classList.remove("hidden");
    els.nameInput?.focus();
  });

  els.cancelBtn?.addEventListener("click", () =>
    els.modal?.classList.add("hidden"),
  );
  els.submitBtn?.addEventListener("click", createNewGroup);
  els.modal?.addEventListener("click", (e) => {
    if (e.target === els.modal) els.modal.classList.add("hidden");
  });
  els.fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      els.previewImg.src = reader.result;
      els.previewImg.classList.remove("hidden");
      els.placeholderIcon?.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  });

setTimeout(handleDeepLinkCall, 700);
});

loadContacts();
poller = setInterval(loadContacts, 2000);
