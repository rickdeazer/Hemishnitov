let sendBtn = document.getElementById("SEND-BTN");
let txtInput = document.getElementById("MESSAGE-INPUT");
let userName = document.getElementById("H-USERNAME");
let chat = document.getElementById("chatBody");
let mainSection = document.getElementById("mainSection");
let bottomBar = document.getElementById("BOTTOMBAR");
let userPic = document.getElementById("HEADER-PROFILEPIC");
let headerLogo = document.getElementById("HEADER-LOGO");
const formBtn = document.getElementById("FORM-BTN");
let videoCallBtn = document.getElementById("VIDEO-CALL");
let slogan = document.querySelector(".slogan");
let fileIcon = document.getElementById("FILE-ICON");
const picBtn = document.querySelector(".media-btn:nth-child(3)");
const imageInput = document.getElementById("imageInput");
const chatsPageRoot = document.getElementById("CHATS-PAGE");

let info1 =
  chatsPageRoot?.dataset?.currentUser?.trim() ||
  JSON.parse(localStorage.getItem("mainUser"));
let info2 = JSON.parse(localStorage.getItem("chatInfo2") || "{}");
info1 = typeof info1 === "string" ? info1.trim() : info1;
if (info2 && info2.username) info2.username = info2.username.trim();

let page = io();
let room = "";

function buildPrivateRoom(userA, userB) {
  return [userA, userB]
    .map((value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join("--");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

if (info1) {
  localStorage.setItem("mainUser", JSON.stringify(info1));
}

if (info1 && info2?.username) {
  room = buildPrivateRoom(info1, info2.username);
}

let ringtone = new Audio("/mediafiles/sounds/ring1.mp3");
ringtone.loop = true;

if (info1) {
  page.emit("register", info1);
}

if (room) {
  page.emit("join-room", room);
}

headerLogo.addEventListener("click", () => {
  headerLogo.style.animation = "headerLogo";
});

async function markAsRead() {
  if (!info1 || !info2?.username) return;
  try {
    await fetch("/markAsRead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mainUser: info1,
        receiver: info2.username,
      }),
    });
  } catch (err) {
    console.warn("markAsRead failed", err);
  }
}

function normalizeTime(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.replace(/[^0-9]/g, "");
  if (cleaned.length < 3) return 0;
  const hh = parseInt(cleaned.slice(0, -2), 10) || 0;
  const mm = parseInt(cleaned.slice(-2), 10) || 0;
  return hh * 60 + mm;
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const cleaned = timeStr.replace(/[^0-9]/g, "");
  if (cleaned.length !== 4) return timeStr;
  return cleaned.slice(0, 2) + ":" + cleaned.slice(2);
}

async function openChat() {
  try {
    const res = await fetch("/chat/path4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name2: info2.username }),
    });

    if (!res.ok) throw new Error("Chat load failed");

    const data = await res.json();
    chat.innerHTML = "";

    const received = (data.msgReceivedH || []).map((m) => ({
      ...m,
      origin: "received",
    }));
    const sent = (data.msgSentH || []).map((m) => ({ ...m, origin: "sent" }));

    const allMsgs = [...received, ...sent];

    allMsgs.sort((a, b) => normalizeTime(a.time) - normalizeTime(b.time));

    let index = 0;

    function showNext() {
      if (index >= allMsgs.length) {
        scrollToBottom();
        chat.style.opacity = "1";
        return;
      }

      const msg = allMsgs[index];
      const bubble = document.createElement("div");
      bubble.className =
        msg.origin === "sent" ? "SENDER-TEXT" : "RECEPIENT-TEXT";

      if (msg.msgType === "form") {
        bubble.innerHTML = `
          <strong>Form #${msg.formId || "Unknown"} ${msg.origin === "sent" ? "Sent" : "Received"} ❤️</strong><br><br>
          ${msg.questions
            .map((q) => `• <b>${q.question}:</b> ${q.answer || "N/A"}`)
            .join("<br>")}
          <span class="TIME">${formatTime(msg.time)}</span>
        `;
      } else if (msg.text && msg.text.startsWith("image-")) {
        const url = msg.text.slice(6);
        bubble.innerHTML = `
          <img src="${url}" class="chat-img" />
          <span class="TIME">${formatTime(msg.time)}</span>
        `;
      } else {
        bubble.innerHTML = `
          <span class="msgText">${escapeHtml(msg.text || "")}</span>
          <span class="TIME">${formatTime(msg.time)}</span>
        `;
      }

      chat.appendChild(bubble);
      index++;
      setTimeout(showNext, 20);
    }

    showNext();
  } catch (err) {
    console.error(err);
    chat.innerHTML = `
      <div style="padding:20px;text-align:center;color:#888;">
        Could not load messages
      </div>
    `;
  }

  markAsRead();
}

fileIcon.addEventListener("click", () => {
  mediaPopup.style.display =
    mediaPopup.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", (e) => {
  if (!mediaPopup.contains(e.target) && e.target !== fileIcon) {
    mediaPopup.style.display = "none";
  }
});

function scrollToBottom() {
  setTimeout(() => {
    mainSection.scrollTo({
      top: mainSection.scrollHeight,
      behavior: "smooth",
    });
  }, 50);
}

openChat();

if (info2?.username === "Admin Control") {
  sendBtn.style.display = "none";
  txtInput.style.display = "none";
  bottomBar.innerHTML = "@Admin Control- 2025: You cannot reply to this chat";
}

if (info2?.username) userName.innerHTML = info2.username;
if (info2?.profileLink) {
  userPic.style.background = `url(${info2.profileLink})`;
  userPic.style.backgroundSize = "cover";
}
if (info2?.slogan) {
  slogan.innerText = info2.slogan;
}
userPic.addEventListener("click", () => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/user";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "username";
  input.value = info2?.username || "";

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
});

function send() {
  const text = txtInput.value.trim();
  if (!text) return;

  txtInput.style.height = "20px";

  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const bubble = document.createElement("div");
  bubble.className = "SENDER-TEXT";
  bubble.innerHTML = `
    <span class="msgText">${escapeHtml(text)}</span>
    <span class="TIME">${time}</span>
  `;

  chat.appendChild(bubble);
  scrollToBottom();

  txtInput.value = "";

  page.emit("message", {
    from: info1,
    to: info2.username,
    text: text,
    time: time,
    msgType: "text",
  });
}

sendBtn.addEventListener("click", send);

txtInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

txtInput.addEventListener("input", () => {
  txtInput.style.height = "auto";
  const h = txtInput.scrollHeight;
  txtInput.style.height = Math.min(h, 95) + "px";
});

page.on("serverReply", (data) => {
  if (data.to === info1 && data.from === info2.username) {
    const time =
      data.time ||
      `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;

    const bubble = document.createElement("div");
    bubble.className = "RECEPIENT-TEXT";

    if (data.msgType === "form") {
      bubble.innerHTML = `
        <strong>Form #${data.formId || "Unknown"} Received ❤️</strong><br><br>
        ${data.questions
          .map((q) => `• <b>${q.question}:</b> ${q.answer || "N/A"}`)
          .join("<br>")}
        <span class="TIME">${time}</span>
      `;
    } else if (
      data.msgType === "image" ||
      (data.text && data.text.startsWith("image-"))
    ) {
      const url = data.msgType === "image" ? data.text : data.text.slice(6);
      bubble.innerHTML = `
        <img src="${url}" class="chat-img" />
        <span class="TIME">${time}</span>
      `;
    } else {
      bubble.innerHTML = `
        <span class="msgText">${escapeHtml(data.text || "")}</span>
        <span class="TIME">${time}</span>
      `;
    }

    chat.appendChild(bubble);
    scrollToBottom();
    markAsRead();
  }
});

const previewModal = document.createElement("div");
previewModal.id = "image-preview-modal";
previewModal.style.cssText = `
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  display: none; flex-direction: column; align-items: center; justify-content: center; z-index: 2000;
  color: white;
`;
document.body.appendChild(previewModal);

picBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  imageInput.value = "";

  const reader = new FileReader();
  reader.onload = (ev) => {
    previewModal.innerHTML = `
      <img src="${ev.target.result}" style="max-width:85vw; max-height:65vh; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.7);" />
      <div style="margin-top:24px; display:flex; gap:40px;">
        <button id="sendImageBtn" style="padding:12px 40px; background:#00a884; color:white; border:none; border-radius:999px; font-weight:bold; cursor:pointer;">Send</button>
        <button id="cancelImageBtn" style="padding:12px 40px; background:transparent; color:white; border:2px solid white; border-radius:999px; cursor:pointer;">Cancel</button>
      </div>
    `;
    previewModal.style.display = "flex";

    document.getElementById("sendImageBtn").onclick = async () => {
      previewModal.style.display = "none";

      const tempBubble = document.createElement("div");
      tempBubble.className = "SENDER-TEXT";
      tempBubble.innerHTML = `<div style="padding:12px 20px; background:#e0f7fa; border-radius:18px;">Uploading image...</div>`;
      chat.appendChild(tempBubble);
      scrollToBottom();

      const formData = new FormData();
      formData.append("image", file);
      formData.append("from", info1);
      formData.append("to", info2.username);

      try {
        const res = await fetch("/upload-image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Upload failed");

        const timeStr = `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;

        tempBubble.innerHTML = `
          <img src="${data.url}" class="chat-img" />
          <span class="TIME">${timeStr}</span>
        `;

        page.emit("message", {
          from: info1,
          to: info2.username,
          text: `image-${data.url}`,
          time: timeStr,
          msgType: "image",
        });

        scrollToBottom();
      } catch (err) {
        console.error("Image upload/send failed:", err);
        tempBubble.innerHTML = `
          <div style="padding:12px 20px; background:#ffebee; color:#c62828; border-radius:18px;">
            Failed to send • ${err.message || "Try again"}
          </div>
        `;
      }
    };

    document.getElementById("cancelImageBtn").onclick = () => {
      previewModal.style.display = "none";
    };
  };
  reader.readAsDataURL(file);
});

formBtn.addEventListener("click", () => {
  const formId = Date.now();

  const bubble = document.createElement("div");
  bubble.className = "SENDER-TEXT";
  bubble.innerHTML = `
    <div class="editable-form">
      <div class="form-header">Form #${formId} (Edit & Submit Your Answers)</div>
      <div class="questions-container" id="questions-${formId}"></div>
      <div class="form-actions">
        <button type="button" class="add-question-btn">+ Add Question</button>
        <button type="button" class="send-form-btn">Submit</button>
        <button type="button" class="cancel-form-btn">Cancel</button>
      </div>
    </div>
  `;

  chat.appendChild(bubble);
  scrollToBottom();

  const questionsContainer = bubble.querySelector(`#questions-${formId}`);

  const defaultQuestions = [
    {
      question: "What is your name?",
      type: "text",
      placeholder: "Your name...",
    },
    {
      question: "What is your age?",
      type: "number",
      placeholder: "Your age...",
    },
    {
      question: "Where do you live?",
      type: "text",
      placeholder: "Your location...",
    },
    {
      question: "Institution / Occupation?",
      type: "text",
      placeholder: "School or job...",
    },
    {
      question: "Are you single?",
      type: "select",
      options: ["Select...", "Yes", "No", "It's complicated"],
    },
    {
      question: "What are you looking for in a partner?",
      type: "text",
      placeholder: "Your answer...",
    },
    {
      question: "Your hobbies?",
      type: "text",
      placeholder: "List your hobbies...",
    },
    {
      question: "Your love language?",
      type: "text",
      placeholder: "Affection? Gifts? Time?",
    },
    { question: "Your religion?", type: "text", placeholder: "Religion..." },
    {
      question: "Anything else?",
      type: "text",
      placeholder: "Optional message...",
    },
  ];

  function renderQuestions() {
    questionsContainer.innerHTML = "";
    defaultQuestions.forEach((q, idx) => {
      const wrapper = document.createElement("div");
      wrapper.className = "question-wrapper";
      wrapper.innerHTML = `
        <label>${q.question}</label>
        ${
          q.type === "select"
            ? `<select class="question">${q.options.map((opt) => `<option>${opt}</option>`).join("")}</select>`
            : `<input type="${q.type}" class="question" placeholder="${q.placeholder || ""}" />`
        }
        <button class="delete-q-btn" data-idx="${idx}">🗑️</button>
      `;
      questionsContainer.appendChild(wrapper);

      wrapper.querySelector(".delete-q-btn").onclick = () => {
        defaultQuestions.splice(idx, 1);
        renderQuestions();
      };
    });
  }

  renderQuestions();

  bubble.querySelector(".add-question-btn").onclick = () => {
    const newQ = prompt("Enter new question text:");
    if (newQ) {
      defaultQuestions.push({
        question: newQ,
        type: "text",
        placeholder: "Your answer...",
      });
      renderQuestions();
    }
  };

  bubble.querySelector(".cancel-form-btn").onclick = () => bubble.remove();

  bubble.querySelector(".send-form-btn").onclick = async (e) => {
    e.preventDefault();

    const questions = defaultQuestions.map((q, i) => {
      const input = questionsContainer.querySelectorAll(".question")[i];
      return {
        question: q.question,
        answer: input.value.trim() || "No answer",
      };
    });

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const formData = {
      from: info1,
      to: info2.username,
      msgType: "form",
      formId,
      questions,
      time,
    };

    try {
      await fetch("/saveFormMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      page.emit("form-message", formData);

      bubble.innerHTML = `
        <strong>Form #${formId} Sent ❤️</strong><br><br>
        ${formData.questions.map((q) => `• <b>${q.question}:</b> ${q.answer}`).join("<br>")}
        <span class="TIME">${time}</span>
      `;
      scrollToBottom();
    } catch (err) {
      console.error(err);
      bubble.innerHTML +=
        '<br><span style="color:#e74c3c">Failed to send</span>';
    }
  };
});

page.on("form-message", (data) => {
  if (data.to === info1 && data.from === info2.username) {
    const bubble = document.createElement("div");
    bubble.className = "RECEPIENT-TEXT";
    bubble.innerHTML = `
      <strong>Form #${data.formId || "Unknown"} Received ❤️</strong><br><br>
      ${data.questions.map((q) => `• <b>${q.question}:</b> ${q.answer || "N/A"}`).join("<br>")}
      <span class="TIME">${data.time}</span>
    `;
    chat.appendChild(bubble);
    scrollToBottom();
    markAsRead();
  }
});

let pc = null;
let localStream = null;
let remoteStream = null;
let pendingOffer = null;

const statusEl = document.getElementById("statusEl");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const toggleCamBtn = document.getElementById("toggleCam");
const toggleMicBtn = document.getElementById("toggleMic");
const hangupBtn = document.getElementById("hangup");
const videoCallPopup = document.getElementById("videoCallPopup");
const acceptCallBtn = document.getElementById("acceptCallBtn");
const declineCallBtn = document.getElementById("declineCallBtn");
const video2Page = document.getElementById("video2Page");
const chatsPage = document.getElementById("CHATS-PAGE");

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

async function ensureLocalStream() {
  try {
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = localStream;
    localVideo.muted = true;
    await localVideo.play();
    return true;
  } catch (err) {
    console.error("media error", err);
    statusEl.textContent = "Camera/mic access denied ❌";
    return false;
  }
}

function createPeerConnection() {
  pc = new RTCPeerConnection(ICE_CONFIG);

  pc.ontrack = (e) => {
    if (!remoteStream) remoteStream = new MediaStream();
    e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play().catch(() => {});
    statusEl.textContent = "Connected 🎥";
  };

  pc.onicecandidate = (e) => {
    if (e.candidate)
      page.emit("ice-candidate", { room, candidate: e.candidate });
  };

  pc.oniceconnectionstatechange = () => {
    if (
      pc.iceConnectionState === "disconnected" ||
      pc.iceConnectionState === "failed"
    ) {
      statusEl.textContent = "Connection lost 🔌";
    }
  };
}

toggleCamBtn.onclick = () => {
  if (localStream) {
    const vt = localStream.getVideoTracks()[0];
    if (vt) {
      vt.enabled = !vt.enabled;
      toggleCamBtn.style.opacity = vt.enabled ? "1" : "0.5";
    }
  }
};

toggleMicBtn.onclick = () => {
  if (localStream) {
    const at = localStream.getAudioTracks()[0];
    if (at) {
      at.enabled = !at.enabled;
      toggleMicBtn.style.opacity = at.enabled ? "1" : "0.5";
    }
  }
};

hangupBtn.onclick = () => {
  if (pc) pc.close();
  pc = null;
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
  if (remoteStream) remoteStream.getTracks().forEach((t) => t.stop());
  localStream = remoteStream = null;
  localVideo.srcObject = remoteVideo.srcObject = null;
  statusEl.textContent = "Call ended ❌";
  page.emit("user-left", { room });
  video2Page.classList.remove("active");
  setTimeout(() => {
    video2Page.style.display = "none";
    chatsPage.style.display = "flex";
  }, 300);
};

videoCallBtn.addEventListener("click", async () => {
  if (!info2?.username) return;
  if (!(await ensureLocalStream())) return;

  createPeerConnection();
  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  page.emit("video-offer", { room, offer, to: info2.username, from: info1 });

  video2Page.classList.add("active");
  chatsPage.style.display = "none";
  statusEl.textContent = "Calling... 📞";
});

const voiceCallBtn = document.getElementById("VOICE-CALL");
voiceCallBtn?.addEventListener("click", async () => {
  if (!info2?.username) return;

  try {
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    createPeerConnection();
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    page.emit("audio-call", { room, offer, to: info2.username, from: info1 });

    statusEl.textContent = "Audio call connecting... 📞";
  } catch (err) {
    console.error("Audio call error:", err);
    alert("Microphone access denied or unavailable");
  }
});

page.on("video-offer", ({ offer, to, from }) => {
  if (to === info1) {
    pendingOffer = offer;
    ringtone.currentTime = 0;
    ringtone.play();
    videoCallPopup.style.display = "flex";
    videoCallPopup
      .querySelector("p")
      ?.setAttribute("innerText", `📞 ${from} is calling...`);
    statusEl.textContent = "Incoming call... 📞";
  }
});

acceptCallBtn.addEventListener("click", async () => {
  ringtone.pause();
  videoCallPopup.style.display = "none";
  if (!pendingOffer) return;

  if (!(await ensureLocalStream())) return;

  createPeerConnection();
  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

  await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  page.emit("video-answer", { room, answer });

  pendingOffer = null;
  video2Page.classList.add("active");
  video2Page.style.display = "flex";
  chatsPage.style.display = "none";
  statusEl.textContent = "Connected 🎥";
});

declineCallBtn.addEventListener("click", () => {
  videoCallPopup.style.display = "none";
  ringtone.pause();
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
  localStream = null;
  pendingOffer = null;
  page.emit("call-declined", { to: info2.username });
  statusEl.textContent = "Call declined ❌";
});

page.on("video-answer", async ({ answer }) => {
  if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  statusEl.textContent = "Connected 🎥";
});

page.on("ice-candidate", async ({ candidate }) => {
  if (candidate && pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

page.on("user-left", () => {
  ringtone.pause();
  if (pc) pc.close();
  pc = null;
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
  localStream = null;
  statusEl.textContent = "Caller left 👋";
  video2Page.classList.remove("active");
  video2Page.style.display = "none";
  chatsPage.style.display = "flex";
  setTimeout(() => {
    video2Page.classList.remove("active");
  }, 100);
});

page.on("call-declined", () => {
  ringtone.pause();
  if (pc) pc.close();
  pc = null;
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
  localStream = null;
  statusEl.textContent = "Call was declined ❌";
  video2Page.classList.remove("active");
  video2Page.style.display = "none";
  chatsPage.style.display = "flex";
});
