const followersElement = document.getElementById("followersCount");
const mainUserDiv = document.getElementById("profName");
const mainUser = mainUserDiv.innerText;
const audioClick = document.getElementById('click');
const audioUnClick = document.getElementById('unClick');
const blogTitle = document.querySelector(".blogTitle");
blogTitle.addEventListener('click',()=>{blogChanger()});
function attachLikeListeners() {
  document.querySelectorAll(".like-btn").forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

 document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      const postId = this.dataset.postId;
      const countEl = this.querySelector(".pLikesCount");
      const svg = this.querySelector("svg");
      const currentUser = JSON.parse(localStorage.getItem("mainUser"));
      const likedImg = btn.querySelector(".truelikedImg");
      const falseImg = btn.querySelector(".falselikedImg");

      if (!currentUser) {
        alert("Please log in to like posts");
        return;
      }

      const wasLiked = this.classList.contains("liked");
      const nowLiked = !wasLiked;

      
      let newCount = parseInt(countEl.textContent) + (nowLiked ? +1 : -1);
      countEl.textContent = newCount;
      
      try {
        const response = await fetch(`/posts/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currentUser }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();

        countEl.textContent = data.likesCount;
      } catch (err) {
        console.error("Like failed:", err);

        countEl.textContent =
          parseInt(countEl.textContent) + (wasLiked ? +1 : -1);

        console.log("Couldn't update like. Please try again.");
      };
      if(likedImg.classList.contains("hidden")){
        audioClick.play();
      }else{
        audioUnClick.play()
      }
      likedImg.classList.toggle("hidden");
      falseImg.classList.toggle("hidden");
    });
  });
};

function attachShareListeners() {
  document.querySelectorAll(".share-btn").forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();

      const postUrl = this.dataset.postUrl;
      const postId = this.dataset.postId;
      async function shareContent(postUrl) {
  const shareTitle = "Check out this post!";
  const shareText = "Someone shared something interesting on the platform...";

  // 🚀 1. Priority: MMUN Android App Native Bridge
  if (window.AndroidInterface && window.AndroidInterface.shareContent) {
    try {
      // We pass the URL as the text so it's clickable in other apps
      window.AndroidInterface.shareContent(shareTitle, postUrl);
      console.log("Shared via MMUN Native Bridge");
      return; // Exit here as native share was triggered
    } catch (err) {
      console.error("Native share bridge failed:", err);
    }
  }

  // 🌐 2. Fallback: Web Share API (Standard Browsers)
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: postUrl,
      });
      console.log("Shared successfully via Web Share API");
    } catch (err) {
      // "AbortError" means the user just clicked 'cancel'
      if (err.name !== "AbortError") {
        console.warn("Web Share failed:", err);
        fallbackCopyLink(postUrl);
      }
    }
  } 
  // 📋 3. Final Fallback: Copy Link to Clipboard
  else {
    fallbackCopyLink(postUrl);
  }
}
    });
  });
};

function attachMoreMenuListeners() {
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".more-wrapper")) {
      document.querySelectorAll(".more-menu").forEach((menu) => {
        menu.style.display = "none";
      });
    }
  });

  document.querySelectorAll(".more-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();

      document.querySelectorAll(".more-menu").forEach((m) => {
        if (m !== this.nextElementSibling) {
          m.style.display = "none";
        }
      });

      const menu = this.nextElementSibling;
      menu.style.display = menu.style.display === "block" ? "none" : "block";

      const rect = this.getBoundingClientRect();
      menu.style.right = "0";
      menu.style.top = "30px";
    });
  });

  document.querySelectorAll(".save-post-btn").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.stopPropagation();

      const postId = this.closest(".more-menu").dataset.postId;

      // Hide menu
      this.closest(".more-menu").style.display = "none";

      // Show toast
      showSaveToast();
    });
  });
}
function attachCommentLikeListeners() {
  document.querySelectorAll(".like-comment-btn").forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  document.querySelectorAll(".like-comment-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const commentId = this.dataset.commentId;
      const countEl = this.querySelector(".like-count");
      const svg = this.querySelector("svg");
      const currentUser = JSON.parse(localStorage.getItem("mainUser"));

      if (!currentUser) {
        alert("Login to like comments");
        return;
      }

      const wasLiked = this.classList.contains("liked");
      const nowLiked = !wasLiked;

      this.classList.toggle("liked", nowLiked);
      this.style.color = nowLiked ? "#ef4444" : "#64748b";
      svg.setAttribute("fill", nowLiked ? "currentColor" : "none");

      let newCount = parseInt(countEl.textContent) + (nowLiked ? 1 : -1);
      countEl.textContent = newCount;

      try {
        const res = await fetch(`/comments/${commentId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currentUser }),
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        this.classList.toggle("liked", data.liked);
        this.style.color = data.liked ? "#ef4444" : "#64748b";
        svg.setAttribute("fill", data.liked ? "currentColor" : "none");
        countEl.textContent = data.likesCount;
      } catch (err) {
        console.error(err);
        this.classList.toggle("liked", wasLiked);
        this.style.color = wasLiked ? "#ef4444" : "#64748b";
        svg.setAttribute("fill", wasLiked ? "currentColor" : "none");
        countEl.textContent =
          parseInt(countEl.textContent) + (wasLiked ? 1 : -1);
      }
    });
  });
}
async function updateFollowers() {
    try {
        const response = await fetch("/followersCount");
        if (!response.ok) return;

        const data = await response.json();
        
        if (followersElement && data?.followersCount != null) {
            followersElement.innerHTML = `<br>${data.followersCount.toLocaleString()}`;
        }
    } catch (err) {
        console.log("→ followers update failed", err);
    }
}

// Initial load
updateFollowers();

// Refresh every 30 seconds
setInterval(updateFollowers, 30000);


// 1. Required DOM references
const postsContainer = document.querySelector(".POSTS-CONTENT");
const postsSection   = document.getElementById("postsSection");

// 2. Simple timeAgo function (you need this)
function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diff = now - past;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const weeks   = Math.floor(days / 7);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours   < 24) return `${hours}h ago`;
  if (days    < 7)  return `${days}d ago`;
  if (weeks   < 5)  return `${weeks}w ago`;
  return `${Math.floor(days / 30)}m ago`;
}

// 3. Media viewer functions (required by onclick handlers)

async function renderPosts() {
  try {
    const res = await fetch("/posts/data/false");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const posts = await res.json();

    posts.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });

    for (const postData of posts) {
      const post = document.createElement("div");
      post.classList.add("POST-ITEM");
      const postId = postData._id;
      post.dataset.postId = postId;

      let commentCount = 0;
      try {
        const commentsRes = await fetch("/obtain/commentsP", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: postId }),
        });

        if (commentsRes.ok) {
          const data = await commentsRes.json();
          const commentsArray =
            data.commentsData || data.comments || data.data || [];
          commentCount = Array.isArray(commentsArray)
            ? commentsArray.length
            : 0;
        }
      } catch (err) {
        console.warn(`Failed to load comments count for post ${postId}`, err);
      }

      let mediaArray = [];
      if (Array.isArray(postData.mediaLinks))
        mediaArray = postData.mediaLinks.filter(Boolean);
      else if (
        typeof postData.mediaLinks === "string" &&
        postData.mediaLinks.trim()
      )
        mediaArray = [postData.mediaLinks.trim()];
      else if (Array.isArray(postData.mediaLink))
        mediaArray = postData.mediaLink.filter(Boolean);
      else if (
        typeof postData.mediaLink === "string" &&
        postData.mediaLink.trim()
      )
        mediaArray = [postData.mediaLink.trim()];

      let mediaHTML = "";
      const mediaCount = mediaArray.length;
      if (mediaCount > 0) {
        const visibleMedia = mediaArray.slice(0, 4);
        const extra = mediaCount - 4;
        let isOneMedia= false;
        if (mediaArray.length==1){
          isOneMedia= true;
        };

        const bgStyle = mediaCount > 2
          ? `style="background-image: url('${mediaArray[mediaArray.length - 1]}'); background-size: cover; background-position: center;"`
          : "";

      mediaHTML = `
          <div ${bgStyle} class="fb-media media-${Math.min(mediaCount, 4)}">
            ${visibleMedia  
              .map((src, index) => {
                const isLast = index === 3 && extra > 0;
                const isVideo = src.match(/\.(mp4|webm|ogg)$/i)? 'video-1' : 'video-n';
                return`
                  <div class="media-box ${isOneMedia? `borderNone ${isVideo}`  :""} ${isLast ? "dark" : ""}">
                    ${(src.match(/\.(mp4|webm|ogg)$/i))? `<div id="loaderC" class="loads">
                <div class="loadB"></div>
              </div> <video class='${isOneMedia? "oneMedia": "notOneMedia"}' src="${src}" playsinline preload="metadata" loop data-index="${index}" onclick="${isOneMedia}? pauserPlayer(this) : openMediaViewer(this,${isOneMedia})" style="width:100%; height:100%; object-fit:cover;"></video>`
                        : `<img src="${src}" data-index="${index}" data-full="true" alt="Post media ${index + 1}" onclick="openMediaViewer(this)" loading="lazy"/>`
                    }
                    ${isLast ? `<div class="media-overlay">+${extra}</div>` : ""}
                  </div>
                `;
              })
              .join("")}
          </div>
        `;
      };
      const likesCount = postData.likes ?? postData.likesCount ?? 0;
      let isLiked = false;
      let hypeText =  "LIKE";
      if(postData.likedBy.includes(mainUser)){
        isLiked = true;
        hypeText = "LIKES";
      }

      post.innerHTML = `
        <div class="POST-HEADER" onclick="visitUser('${postData.fromName}',this)"
             style="display:flex;align-items:center;padding:10px 15px;">
          <img class="profileImg" src="${postData.fromPic || "/default-avatar.png"}" alt="${postData.fromName || "User"}">
          <div>
            <strong>${postData.fromName || "Unknown"}</strong><br>
            <small style="color:#aaa;">${postData.date || postData.createdAt ? timeAgo(postData.date || postData.createdAt) : "Just now"}</small>
          </div>
        </div>
    
        <div class="POST-DESCRIPTION">
          <p class="desc-text ${postData.description? "" : "hidden"}">${postData.description || ""}</p>
          <span class="see-more">See more</span>
        </div>
    
        <div class="POST-MEDIA">
          ${mediaHTML}
          <div class="media-viewer hidden">
            <span class="nav left" onclick="navigateMedia(-1)">❮</span>
            <img class="viewer-img" alt="Full screen media" />
            <span class="nav right" onclick="navigateMedia(1)">❯</span>
            <span class="close-viewer" onclick="closeMediaViewer()">✕</span>
          </div>
        </div>
    
        <div class="POST-ACTIONS";">
                  <button onClick="" class="like-btn ${isLiked ? "liked" : ""}"
                          data-post-id="${postId}"
                          data-liked="${isLiked}"
                          style="display:flex; align-items:center; gap:5px;">
                          
                          <img class="truelikedImg ${isLiked ? "" : "hidden"}" src="/Assets/liked.png"/>
                          
                          <img class="falselikedImg ${isLiked ? "hidden" : ""}" src="/Assets/unliked.png"/>
                          </svg> 

                      <span class="hypeText">${hypeText}</span><span class="pLikesCount" style="padding-right: 3px">${likesCount}</span>
                  </button>
    
          <button class="comment-btn" style="display:flex;align-items:center;gap:5px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"></path>
            </svg>
            Insights <span class="comment-count">${commentCount}</span>
          </button>

          <button class="share-btn" data-post-id="${postId}" data-post-url="${window.location.origin}/post/${postId}" title="Share this post" style="display:flex;align-items:center;gap:5px;border:none;background:none;cursor:pointer;padding:5px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>
    
          <div class="more-wrapper" style="position: relative;">
            <button class="more-btn" data-post-id="${postId}" style="font-size:18px;background:none;border:none;color:#aaa;cursor:pointer;padding:0 8px;">•••</button>
            <div class="more-menu" data-post-id="${postId}">
              <div class="more-menu-item save-post-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                Save post
              </div>
            </div>
          </div>
        </div>
      `;
      observeThis(post);
      postsContainer.appendChild(post);
      attachLikeListeners(post);
      attachShareListeners(post);
      attachMoreMenuListeners(post);
    }
  } catch (err) {
    console.error("Failed to load posts:", err);
    postsContainer.innerHTML = `<div style="color:#ff4444;padding:20px;text-align:center;">
          Failed to load posts. Please try again later.
      </div>`;
  }
}
renderPosts();


/* Very bad uproach. to be updated later on sooner _________================================================================================================================================================================================================================================================================================================================_______________________ */


postsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".comment-btn");
  if (!btn) return;

  const post = btn.closest(".POST-ITEM");

  commentDrawerP.dataset.activePostId = post.dataset.postId;
  renderComments(post);

  commentDrawerP.classList.add("show");
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
});
const closePostComments = ()=>{
  commentDrawerP.classList.remove("show");
  overlay.style.display = "none";
  document.body.style.overflow = "auto";
}
closeCommentsP.addEventListener("click", () => {
 closePostComments();
});
commentHeaderP.addEventListener("click",()=>{
  closePostComments();
})


function exit(){
  let editBeacon = localStorage.getItem('editAuthBeacon') || null;
  if(editBeacon){
    window.location.href = "/home";
    localStorage.removeItem("editAuthBeacon");
  } else {
    window.history.back()
  }
  
}
function renderComments(post) {
  const postId = post.dataset.postId;

  commentListP.innerHTML = "";

  fetch("/obtain/commentsP", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId }),
  })
    .then((res) => res.json())
    .then((data) => {
      let comments = data.commentsData;

          comments.forEach((c) => {
        const div = document.createElement("div");
        div.classList.add("comment-item");
        div.style.cssText = `
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          padding: 8px 12px;
        `;

        const isLiked = !!c.hasLiked;

        div.innerHTML = `
          <div class="comment-pic" style="
            width: 36px; height: 36px; border-radius: 50%;
            background: #3b82f6; color: white;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 16px;
          ">
            ${c.from[0].toUpperCase()}
          </div>

          <div style="flex: 1;">
            <strong>${c.from}</strong>
            <div style="margin-top: 2px;">${c.comment}</div>
            <small style="color: #888; font-size: 12px;">
              ${new Date(c.time).toLocaleString([], { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
            </small>
          </div>

          <button class="like-comment-btn ${isLiked ? "liked" : ""}"
                  data-comment-id="${c._id}"
                  style="background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; gap:6px; color: ${isLiked ? "#ef4444" : "#64748b"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
              <path d="M7 11v9m-4-9v9h4m4-9v9m-4-9h4m-4 0v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4m-4 5h4"/>
            </svg>
            <span class="like-count">${c.likesCount || 0}</span>
          </button>
        `;

        commentListP.appendChild(div);
      });
      
      attachCommentLikeListeners();
    });
}

sendCommentP.addEventListener("click", async () => {
  const text = newCommentP.value.trim();
  if (!text) return;

  const activePostId = commentDrawerP.dataset.activePostId;
  const postOwner = document.querySelector(
    `.POST-ITEM[data-post-id="${activePostId}"] .POST-HEADER strong`
  ).textContent;
  const mainUser = JSON.parse(localStorage.getItem("mainUser"));

  try {
    const res = await fetch("/post/commentsP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: activePostId,
        from: mainUser,
        to: postOwner,
        comment: text,
        time: new Date(),
      }),
    });

    if (!res.ok) throw new Error("Failed to post comment");

    newCommentP.value = "";
    renderComments(
      document.querySelector(`.POST-ITEM[data-post-id="${activePostId}"]`)
    );
    commentListP.scrollTop = commentListP.scrollHeight;
  } catch (err) {
    console.error(err);
    alert("Error posting comment.");
  }
});
const logOut = document.querySelector(".log-out");
logOut.addEventListener("click",()=>{
  localStorage.clear();
  window.location.href="/logout"
});
const showTonnerDiv = document.getElementById("showTonner");
const Handle = document.getElementById("Handle");
function showTonner(value){
  if(value.slice(0,2) =="no"){
    showTonnerDiv.innerHTML = value;
    showTonnerDiv.style.display = 'flex';
  } else {
    Handle.innerText = value;
    showTonnerDiv.style.display = 'flex';
  }
  setTimeout(() => {
    showTonnerDiv.style.display = "none";
  }, 1000);
}