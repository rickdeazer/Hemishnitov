// let mainSection = document.getElementById("mainSection");
// let searchInput = document.getElementById("HOME-SEARCH");
// let searchInputBtn = document.getElementById("searchInputBtn");
// let commentModal = document.getElementById("COMMENT-MODAL");
// let commentBody = document.getElementById("COMMENT-BODY");
// let commentInput = document.getElementById("NEW-COMMENT");
// let sendComment = document.getElementById("ADD-COMMENT");
// let closeComments = document.getElementById("CLOSE-COMMENTS");
// let header = document.getElementById("HEADER");
// let homeSearch = document.getElementById("HOME-SEARCH");
// let commentHeader = document.getElementById("COMMENT-HEADER");
// let mainUser = JSON.parse(localStorage.getItem("mainUser"));
// let logo = document.getElementById("HEADER-LOGO");
// let currentCommentUser = null;
// let alertDiv = document.getElementById("alertDiv");
// let rotation = 0;
// let comments = [];
// let fetched = [];
// let exit = document.getElementById("exit");
// if (localStorage.getItem("backStyle")) {
//   if (
//     localStorage.getItem("backStyle") !== "0" &&
//     localStorage.getItem("backStyle") !== "1"
//   ) {
//     localStorage.setItem("backStyle", 0);
//   }
// } else {
//   localStorage.setItem("backStyle", 0);
// }
// let backStyle = Number(localStorage.getItem("backStyle"));

// commentInput.hidden = true;
// function renderHomepage(arr) {
//   mainSection.innerHTML = "";
//   arr.forEach((u) => {
//     let profileImg =
//       u.profileLink && u.profileLink !== ""
//         ? u.profileLink
//         : "/uploads/default.png";

//     let userDiv = document.createElement("div");
//     userDiv.className = "MAIN-USERS";
//     userDiv.style.position = "relative";

//     let imgDiv = document.createElement("div");
//     imgDiv.className = "MAIN-USERS-IMG";
//     imgDiv.style.backgroundImage = `url('${profileImg}')`;
//     imgDiv.style.backgroundSize = "cover";
//     imgDiv.style.backgroundPosition = "center";
//     if (backStyle == 0) {
//       imgDiv.style.backgroundAttachment = "fixed";
//     } else {
//       imgDiv.style.backgroundAttachment = "local";
//     }

//     let commentBtn = document.createElement("div");
//     commentBtn.classList.add("openComment");
//     commentBtn.innerHTML = `
// <svg class="neon-arrow" width="28" height="28" viewBox="0 0 24 24" fill="none">
//   <path d="M5 12L12 5L19 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
// </svg><span>${u.comments || ""}</span>
// `;

//     let usernameDiv = document.createElement("div");
//     usernameDiv.className = "MAIN-USERS-USERNAME";
//     let vlabel = "";
//     if (u.viewsCount < 2) {
//       vlabel = "Vit";
//     } else {
//       vlabel = "Vits";
//     }
//     if (fetched.includes(u.username)) {
//       return;
//     } else {
//       fetched.push(u.username);
//     }

//     usernameDiv.innerHTML = `
//       <span class="Username">${u.username}</span><div class="mainSet">
//       <div class="setOne"><span class="MAIN-USERS-COURSE">${
//         u.course || "COM"
//       }</span> 
//       <span class="MAIN-USERS-YEAR">${
//         u.year || "1"
//       }</span></div><span class="MAIN-USERS-VIEWS">${
//       u.viewsCount ? u.viewsCount + " " + vlabel : ""
//     } </span>
//     </div>
//     `;
//     let form = document.createElement("form");
//     form.method = "POST";
//     form.action = "/user";

//     let input = document.createElement("input");
//     input.type = "hidden";
//     input.name = "username";
//     input.value = u.username;

//     form.appendChild(input);
//     userDiv.appendChild(form);

//     userDiv.addEventListener("click", (e) => {
//       e.stopPropagation();
//       localStorage.setItem("pointerdown", `${u.username}`);
//       localStorage.setItem("forUsClicked", `${u.username}`);
//       setTimeout(() => {
//         form.submit();
//       }, 300);
//     });

//     imgDiv.appendChild(commentBtn);
//     userDiv.appendChild(imgDiv);
//     userDiv.appendChild(usernameDiv);
//     mainSection.appendChild(userDiv);
//     let displayComments = () => {
//       usernameDiv.style.opacity = "0";
//       exit.hidden = true;
//       commentBtn.style.opacity = "0";
//       currentCommentUser = u.username;
//       fetch("/obtainComments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           currentCommentUser: currentCommentUser,
//         }),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           comments = data.comments || [];
//           renderComments(currentCommentUser, u.comments);
//           commentModal.style.bottom = "0";
//         })
//         .catch((err) => console.error(err));
//       closeComments.addEventListener("click", () => {
//         currentCommentUser = null;
//         usernameDiv.style.opacity = "1";
//         commentModal.style.display = "none";
//         commentBtn.hidden = false;
//         exit.hidden = false;
//       });
//       commentHeader.addEventListener("click", () => {
//         currentCommentUser = null;
//         commentModal.style.display = "none";
//         usernameDiv.style.opacity = "1";
//         commentBtn.style.opacity = "1";
//         commentInput.hidden = true;
//         exit.hidden = false;
//       });
//     };
//     commentBtn.addEventListener("click", (e) => {
//       e.stopPropagation();
//       displayComments();
//     });
//   });
// }
// function addHomepage(arr) {
//   arr.forEach((u) => {
//     if (fetched.includes(u.username)) {
//       return;
//     } else {
//       fetched.push(u.username);
//     }

//     let profileImg =
//       u.profileLink && u.profileLink !== ""
//         ? u.profileLink
//         : "/uploads/default.png";

//     let userDiv = document.createElement("div");
//     userDiv.className = "MAIN-USERS";
//     userDiv.style.position = "relative";

//     let imgDiv = document.createElement("div");
//     imgDiv.className = "MAIN-USERS-IMG";
//     imgDiv.style.backgroundImage = `url('${profileImg}')`;
//     imgDiv.style.backgroundSize = "cover";
//     imgDiv.style.backgroundPosition = "center";
//     if (backStyle == 0) {
//       imgDiv.style.backgroundAttachment = "fixed";
//     } else {
//       imgDiv.style.backgroundAttachment = "local";
//     }

//     let commentBtn = document.createElement("div");
//     commentBtn.classList.add("openComment");
//     commentBtn.innerHTML = `
// <svg class="neon-arrow" width="28" height="28" viewBox="0 0 24 24" fill="none">
//   <path d="M5 12L12 5L19 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
// </svg><span>${u.comments || ""}</span>
// `;

//     let usernameDiv = document.createElement("div");
//     usernameDiv.className = "MAIN-USERS-USERNAME";
//     let vlabel = "";
//     if (u.viewsCount < 2) {
//       vlabel = "Vit";
//     } else {
//       vlabel = "Vits";
//     }

//     usernameDiv.innerHTML = `
//       <span class="Username">${u.username}</span><div class="mainSet">
//       <div class="setOne"><span class="MAIN-USERS-COURSE">${
//         u.course || "COM"
//       }</span> 
//       <span class="MAIN-USERS-YEAR">${
//         u.year || "1"
//       }</span></div><span class="MAIN-USERS-VIEWS">${
//       u.viewsCount ? u.viewsCount + " " + vlabel : ""
//     } </span>
//     </div>
//     `;
//     let form = document.createElement("form");
//     form.method = "POST";
//     form.action = "/user";

//     let input = document.createElement("input");
//     input.type = "hidden";
//     input.name = "username";
//     input.value = u.username;

//     form.appendChild(input);
//     userDiv.appendChild(form);

//     userDiv.addEventListener("click", (e) => {
//       e.stopPropagation();
//       localStorage.setItem("pointerdown", `${u.username}`);
//       localStorage.setItem("forUsClicked", `${u.username}`);
//       setTimeout(() => {
//         form.submit();
//       }, 300);
//     });

//     imgDiv.appendChild(commentBtn);
//     userDiv.appendChild(imgDiv);
//     userDiv.appendChild(usernameDiv);
//     mainSection.appendChild(userDiv);
//     let displayComments = () => {
//       usernameDiv.style.opacity = "0";
//       exit.hidden = true;
//       commentBtn.style.opacity = "0";
//       currentCommentUser = u.username;
//       fetch("/obtainComments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           currentCommentUser: currentCommentUser,
//         }),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           comments = data.comments || [];
//           renderComments(currentCommentUser, u.comments);
//           commentModal.style.bottom = "0";
//         })
//         .catch((err) => console.error(err));
//       closeComments.addEventListener("click", () => {
//         currentCommentUser = null;
//         usernameDiv.style.opacity = "1";
//         commentModal.style.display = "none";
//         commentBtn.hidden = false;
//         exit.hidden = false;
//       });
//       commentHeader.addEventListener("click", () => {
//         currentCommentUser = null;
//         commentModal.style.display = "none";
//         usernameDiv.style.opacity = "1";
//         commentBtn.style.opacity = "1";
//         commentInput.hidden = true;
//         exit.hidden = false;
//       });
//     };
//     commentBtn.addEventListener("click", (e) => {
//       e.stopPropagation();
//       displayComments();
//     });
//   });
// }

// function fetchHomepage() {
//   fetch("/homepage")
//     .then((res) => res.json())
//     .then((data) => {
//       renderHomepage(data.data);
//     });
// }
// function fetchOthers() {
//   fetch("/others")
//     .then((res) => res.json())
//     .then((data) => {
//       let data2 = Array.from(
//         new Map(
//           data.data
//             .filter((p) => !fetched.includes(p.username))
//             .map((p) => [p.username, p])
//         ).values()
//       );
//       addHomepage(data2);
//     });
// }
// const searchUsers = () => {
//   let filter = searchInput.value.toLowerCase();
//   if (filter !== "") {
//     fetch("/everyone")
//       .then((res) => res.json())
//       .then((data) => {
//         renderHomepage(
//           data.data.filter((u) => u.username.toLowerCase().includes(filter))
//         );
//       });
//     searchInput.value = "";
//   } else {
//     fetchHomepage();
//   }
// };

// searchInputBtn.addEventListener("click", () => {
//   searchUsers();
// });

// searchInput.addEventListener("keydown", (event) => {
//   if (event.key == "Enter") {
//     searchUsers();
//   }
// });

// function renderComments(user, NOC) {
//   if (NOC) {
//   } else {
//     NOC = "";
//   }
//   let Iname = "";
//   if (NOC == 1) {
//     Iname = "Insight";
//   } else {
//     Iname = "Insights";
//   }
//   commentBody.innerHTML = "";
//   commentHeader.innerHTML = ` <h3>${NOC} ${Iname} on ${user}</h3>
//         <button id="CLOSE-COMMENTS"></button>`;
//   comments
//     .filter((c) => c.to === user)
//     .forEach((c) => {
//       let liked = c.likedBy?.includes(mainUser);
//       let commentItem = document.createElement("div");
//       commentItem.className = "COMMENT-ITEM";
//       commentItem.innerHTML = `
//         <div class="COMMENT-HEADER">
//           <span class="COMMENT-USER" onclick="userOpener('${c.from}')">${
//         c.from
//       }</span>
//           <div class="COMMENT-ACTIONS">
//             <span class="COMMENT-TIME">${c.time}</span>
//             <div class="COMMENT-LIKE" 
//                  data-id="${c._id}" 
//                  style="cursor:pointer; color:${liked ? "red" : "blue"}">
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="${
//                 liked ? "red" : "blue"
//               }">
//                 <path d="M12 21.35l-1.45-1.32C5 15 2 12 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h1.87C14.46 4.99 15.96 4 17.5 4 20 4 22 6 22 8.5c0 3.5-3 6.5-8.55 11.54L12 21.35z"/>
//               </svg>
//               <span class="LIKE-COUNT">${c.likes || 0}</span>
//             </div>
//           </div>
//         </div>
//         <div class="COMMENT-TEXT">${c.comment}</div>
//       `;
//       commentItem.addEventListener("contextmenu", (e) => {
//         e.preventDefault();

//         let menu = document.getElementById("commentContextMenu");
//         let isOwner = c.from === mainUser;

//         menu.style.top = `${e.clientY + 2}px`;
//         menu.style.left = `${e.clientX}px`;
//         menu.classList.remove("hidden");

//         menu.dataset.commentId = c._id;
//         menu.dataset.from = c.from;

//         menu.querySelector('[data-action="delete"]').style.display = isOwner
//           ? "block"
//           : "none";

//         document.addEventListener("click", () => {
//           menu.classList.add("hidden");
//         });

//         window.addEventListener("scroll", () => {
//           menu.classList.add("hidden");
//         });
//       });

//       commentBody.appendChild(commentItem);
//     });
//   commentModal.appendChild(commentBody);
//   commentModal.style.display = "flex";
//   mainSection.appendChild(commentModal);
//   likeComment();
// }
// document
//   .querySelector('#commentContextMenu [data-action="delete"]')
//   .addEventListener("click", async () => {
//     const menu = document.getElementById("commentContextMenu");
//     const commentId = menu.dataset.commentId;

//     if (!commentId) return;

//     const res = await fetch("/deleteComment", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ commentId }),
//     });

//     const data = await res.json();

//     if (data.success) {
//       comments = comments.filter((c) => c._id !== commentId);

//       renderComments(currentCommentUser);

//       menu.classList.add("hidden");
//     }
//   });

// function likeComment() {
//   document.querySelectorAll(".COMMENT-LIKE").forEach((btn) => {
//     btn.addEventListener("click", () => {
//       let commentId = btn.dataset.id;
//       fetch("/toggleLike", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           commentId: commentId,
//           username: mainUser,
//         }),
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           btn.style.color = data.liked ? "red" : "blue";

//           btn
//             .querySelector("svg")
//             .setAttribute("fill", data.liked ? "red" : "blue");

//           btn.querySelector(".LIKE-COUNT").textContent = data.likes;

//           const index = comments.findIndex((c) => c._id == commentId);
//           if (index !== -1) {
//             comments[index].likes = data.likes;
//             if (data.liked) {
//               comments[index].likedBy.push(mainUser);
//             } else {
//               comments[index].likedBy = comments[index].likedBy.filter(
//                 (u) => u !== mainUser
//               );
//             }
//           }
//         });
//     });
//   });
// }
// sendComment.addEventListener("click", (e) => {
//   e.preventDefault();
//   commentBody.scrollTo(0, commentBody.scrollHeight);
//   commentInput.hidden = false;
//   let newComment = commentInput.value.trim();
//   if (!newComment || !currentCommentUser) return;
//   fetch("/post/comments", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       to: currentCommentUser,
//       comment: newComment,
//     }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       comments.push(data.comment);

//       commentInput.value = "";
//       renderComments(currentCommentUser);
//       commentBody.scrollTop = commentBody.scrollHeight;
//     });
// });
// fetchHomepage();
// const userOpener = (user) => {
//   let form = document.createElement("form");
//   form.method = "POST";
//   form.action = "/user";

//   let input = document.createElement("input");
//   input.type = "hidden";
//   input.name = "username";
//   input.value = user;

//   form.appendChild(input);
//   document.body.appendChild(form);
//   form.submit();
// };
// let changeDisplay = (value, style) => {
//   mainSection.style.opacity = 0.3;
//   localStorage.setItem("backStyle", value);
//   backStyle = value;
//   alertDiv.style.display = "flex";
//   let x = 5;
//   let alertInterval = setInterval(() => {
//     x--;
//     alertDiv.innerHTML = `<span>Closing and Refreshing in: <span>${x}</span></span>Your Scroll Behaviour is now set to ${style}. Click on the logo again to toggle.`;
//   }, 1000);
//   setTimeout(() => {
//     mainSection.style.opacity = 1;
//     alertDiv.style.display = "none";
//     alertInterval = 0;
//     window.location.href = "/home";
//   }, 5000);
// };
// logo.addEventListener("click", () => {
//   if (backStyle) {
//     changeDisplay(0, "Classic");
//   } else {
//     changeDisplay(1, "Normal");
//   }
// });
// mainSection.addEventListener("scroll", () => {
//   rotation = mainSection.scrollTop / 10;
//   logo.style.transform = `rotateZ(${rotation}deg)`;
//   if (mainSection.scrollTop >= 5) {
//     header.style.background = "rgba(0, 0, 0, 0.571)";
//     header.style.animation = "none";
//     logo.style.border = "none";
//     logo.style.animation = "";
//     homeSearch.style.border = " rgba(128, 128, 128, 0.507)";
//     if (
//       mainSection.scrollTop >=
//       mainSection.scrollHeight - mainSection.clientHeight - 50
//     ) {
//       setTimeout(() => {
//         fetchOthers();
//       }, 1000);
//     }
//   } else {
//     logo.style.animation = "  transition: 2s ease";
//     homeSearch.style.border = "solid 1px rgba(190, 190, 190, 1)";
//     logo.style.backgroundColor = "";
//     logo.style.border = "solid 1px rgba(218, 218, 218, 0.67)";
//     header.style.background =
//       "linear-gradient( 80deg,rgba(191, 87, 165, 0.397),black,rgba(0, 0, 0, 0.616),black,rgba(191, 87, 165, 0.397))";
//   }
//   header.style.animation = "header";
// });

// const postsBtn = document.getElementById("postsBtn");
// const peopleBtn = document.getElementById("peopleBtn");
// const postsSection = document.getElementById("postsSection");
// const createPostSection = document.getElementById("createPostSection");
// let overlay = document.getElementById("overlay");

// const commentDrawerP = document.getElementById("commentDrawerP");
// const commentListP = document.getElementById("commentListP");
// const closeCommentsP = document.getElementById("closeCommentsP");
// const sendCommentP = document.getElementById("sendCommentP");
// const newCommentP = document.getElementById("newCommentP");
// let postsBtnCont = document.getElementById("postsBtnCont");
// let peopleBtnCont = document.getElementById("peopleBtnCont");
// let addBtnCont = document.getElementById("addBtnCont");
// let selectedFiles = [];

// postsBtn.addEventListener("click", () => {
//   mainSection.style.display = "none";
//   postsSection.style.display = "flex";
//   createPostSection.style.display = "none";
//   championsSection.style.display = "none";
//   peopleBtnCont.style.display = "block";
//   postsBtnCont.style.display = "none";
//   addBtnCont.style.display = "block";
// });

// peopleBtn.addEventListener("click", () => {
//   mainSection.style.display = "grid";
//   postsSection.style.display = "none";
//   createPostSection.style.display = "none";
//   championsSection.style.display = "none";
//   peopleBtnCont.style.display = "none";
//   postsBtnCont.style.display = "block";
//   addBtnCont.style.display = "block";
// });

// champsBtn.addEventListener("click", () => {
//   mainSection.style.display = "none";
//   postsSection.style.display = "none";
//   createPostSection.style.display = "none";
//   championsSection.style.display = "block";
// });

// const postsExamples = [
//   {
//     fromName: "Amani",
//     fromPic: "/mediafiles/autumn-7517221_1920.jpg",
//     imageorVid: "/mediafiles/darkgirl.jpg",
//     description:
//       "Hey everyone! Check out this awesome view I captured during my trip.",
//     date: "3d ago",
//   },
//   {
//     fromName: "Sara",
//     fromPic: "/mediafiles/autumn-7517221_1920.jpg",
//     imageorVid: "/mediafiles/roseFlower.jpg",
//     description:
//       "Just finished reading this amazing book, totally recommend it to everyone!",
//     date: "1d ago",
//   },
// ];

// function timeAgo(postDate) {
//   const now = new Date();
//   const past = new Date(postDate);
//   const diff = now - past;

//   const seconds = Math.floor(diff / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);
//   const days = Math.floor(hours / 24);
//   const weeks = Math.floor(days / 7);
//   const months = Math.floor(days / 30);
//   const years = Math.floor(days / 365);

//   if (seconds < 60) return "just now";
//   if (minutes < 60) return `${minutes}m ago`;
//   if (hours < 24) return `${hours}h ago`;
//   if (days < 7) return `${days}d ago`;
//   if (weeks < 5) return `${weeks}w ago`;
//   if (months < 12) return `${months}m ago`;
//   return `${years}y ago`;
// }

// let activeMedia = [];
// let currentIndex = 0;
// let activePostMedia = null;

// function openMediaViewer(img) {
//   const post = img.closest(".POST-MEDIA");
//   activePostMedia = post;

//   const imgs = post.querySelectorAll(".fb-media img");
//   activeMedia = [...imgs].map((i) => i.src);
//   currentIndex = Number(img.dataset.index);

//   post.querySelector(".fb-media").classList.add("hidden");

//   const viewer = post.querySelector(".media-viewer");
//   viewer.classList.remove("hidden");

//   updateViewer();
// }

// function updateViewer() {
//   const img = activePostMedia.querySelector(".viewer-img");
//   img.src = activeMedia[currentIndex];
// }

// function navigateMedia(dir) {
//   currentIndex += dir;

//   if (currentIndex < 0) currentIndex = activeMedia.length - 1;
//   if (currentIndex >= activeMedia.length) currentIndex = 0;

//   updateViewer();
// }

// function closeMediaViewer() {
//   activePostMedia.querySelector(".media-viewer").classList.add("hidden");
//   activePostMedia.querySelector(".fb-media").classList.remove("hidden");
// }

// const postsContainer = document.querySelector(".POSTS-CONTENT");

// function attachLikeListeners() {
//   document.querySelectorAll(".like-btn").forEach((btn) => {
//     btn.addEventListener("click", async function () {
//       const postId = this.dataset.postId;
//       const countEl = this.querySelector(".pLikesCount");
//       const currentUser = JSON.parse(localStorage.getItem("mainUser"));

//       try {
//         const res = await fetch(`/posts/${postId}/like`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ username: currentUser }),
//         });

//         if (!res.ok) throw new Error("Like failed");

//         const data = await res.json();

//         this.dataset.liked = data.liked;
//         this.classList.toggle("liked", data.liked);

//         const svg = this.querySelector("svg");
//         btn.classList.toggle("liked", data.liked);

//         countEl.textContent = data.likesCount;
//       } catch (err) {
//         console.error("Like error:", err);
//       }
//     });
//   });
// }

// function attachShareListeners() {
//   document.querySelectorAll(".share-btn").forEach((button) => {
//     button.addEventListener("click", async function (e) {
//       e.preventDefault();

//       const postUrl = this.dataset.postUrl;
//       const postId = this.dataset.postId;

//       // 1. Try modern Web Share API (works great on mobile + many desktop browsers now)
//       if (navigator.share) {
//         try {
//           await navigator.share({
//             title: "Check out this post!",
//             text: "Someone shared something interesting on the platform...",
//             url: postUrl,
//           });
//           console.log("Post shared successfully via Web Share API");
//           // Optional: you could animate button or show toast "Shared!"
//         } catch (err) {
//           if (err.name !== "AbortError") {
//             // user cancelled is normal
//             console.warn("Web Share failed:", err);
//             fallbackCopyLink(postUrl);
//           }
//         }
//       }
//       // 2. Fallback: copy link to clipboard
//       else {
//         fallbackCopyLink(postUrl);
//       }
//     });
//   });
// }

// function fallbackCopyLink(url) {
//   navigator.clipboard
//     .writeText(url)
//     .then(() => {
//       // Show nice feedback
//       const originalText = event.target.innerHTML;
//       event.target.innerHTML = "Link Copied! ✓";
//       event.target.style.color = "#4CAF50";

//       setTimeout(() => {
//         event.target.innerHTML = originalText;
//         event.target.style.color = "";
//       }, 2000);

//       console.log("Link copied to clipboard");
//     })
//     .catch((err) => {
//       console.error("Failed to copy: ", err);
//       alert("Could not copy link. Please copy manually:\n" + url);
//     });
// }

// function attachMoreMenuListeners() {
//   // Close menu when clicking anywhere else
//   document.addEventListener("click", function (e) {
//     if (!e.target.closest(".more-wrapper")) {
//       document.querySelectorAll(".more-menu").forEach((menu) => {
//         menu.style.display = "none";
//       });
//     }
//   });

//   // Toggle menu on ••• click
//   document.querySelectorAll(".more-btn").forEach((btn) => {
//     btn.addEventListener("click", function (e) {
//       e.stopPropagation();

//       // Close all other menus first
//       document.querySelectorAll(".more-menu").forEach((m) => {
//         if (m !== this.nextElementSibling) {
//           m.style.display = "none";
//         }
//       });

//       const menu = this.nextElementSibling;
//       menu.style.display = menu.style.display === "block" ? "none" : "block";

//       // Position better (optional improvement)
//       const rect = this.getBoundingClientRect();
//       menu.style.right = "0";
//       menu.style.top = "30px";
//     });
//   });

//   // Save post click handler (fake save)
//   document.querySelectorAll(".save-post-btn").forEach((item) => {
//     item.addEventListener("click", function (e) {
//       e.stopPropagation();

//       const postId = this.closest(".more-menu").dataset.postId;

//       // Hide menu
//       this.closest(".more-menu").style.display = "none";

//       // Show toast
//       showSaveToast();
//     });
//   });
// }

// function showSaveToast() {
//   // Remove existing toast if any
//   const existing = document.querySelector(".save-toast");
//   if (existing) existing.remove();

//   const toast = document.createElement("div");
//   toast.className = "save-toast";
//   toast.innerHTML = `
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
//     </svg>
//     Post saved to My collections
//   `;

//   document.body.appendChild(toast);

//   // Trigger animation
//   setTimeout(() => toast.classList.add("show"), 10);

//   // Auto hide after 2.5 seconds
//   setTimeout(() => {
//     toast.classList.remove("show");
//     setTimeout(() => toast.remove(), 400);
//   }, 2500);
// }

// async function renderPosts() {
//   postsContainer.innerHTML = "";

//   try {
//     const res = await fetch("/posts/data");
//     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//     const posts = await res.json();

//     // Sort by date (newest first) - make sure date field exists
//     posts.sort((a, b) => {
//       const dateA = new Date(a.date || a.createdAt || 0);
//       const dateB = new Date(b.date || b.createdAt || 0);
//       return dateB - dateA;
//     });

//     posts.forEach((postData) => {
//       const post = document.createElement("div");
//       post.classList.add("POST-ITEM");
//       const postId = postData._id;

//       post.dataset.postId = postId;

//       // Media handling - more robust
//       let mediaArray = [];
//       if (Array.isArray(postData.mediaLinks)) {
//         mediaArray = postData.mediaLinks.filter(Boolean);
//       } else if (
//         typeof postData.mediaLinks === "string" &&
//         postData.mediaLinks.trim()
//       ) {
//         mediaArray = [postData.mediaLinks.trim()];
//       } else if (Array.isArray(postData.mediaLink)) {
//         mediaArray = postData.mediaLink.filter(Boolean);
//       } else if (
//         typeof postData.mediaLink === "string" &&
//         postData.mediaLink.trim()
//       ) {
//         mediaArray = [postData.mediaLink.trim()];
//       }

//       let mediaHTML = "";
//       const count = mediaArray.length;
//       if (count > 0) {
//         const visible = mediaArray.slice(0, 4);
//         const extra = count - 4;

//         mediaHTML = `
//                   <div class="fb-media media-${Math.min(count, 4)}">
//                       ${visible
//                         .map((src, index) => {
//                           const isLast = index === 3 && extra > 0;
//                           return `
//                                   <div class="media-box ${
//                                     isLast ? "dark" : ""
//                                   }">
//                                       <img 
//                                           src="${src}" 
//                                           data-index="${index}" 
//                                           data-full="true" 
//                                           alt="Post media ${index + 1}"
//                                           onclick="openMediaViewer(this)"
//                                           loading="lazy"
//                                       />
//                                       ${
//                                         isLast
//                                           ? `<div class="media-overlay">+${extra}</div>`
//                                           : ""
//                                       }
//                                   </div>
//                               `;
//                         })
//                         .join("")}
//                   </div>
//               `;
//       }

//       // Use the correct field names coming from backend
//       const likesCount = postData.likes ?? postData.likesCount ?? 0;
//       const isLiked = !!postData.hasLiked; // will be false if undefined

//       post.innerHTML = `
//               <div class="POST-HEADER" style="display:flex;align-items:center;padding:10px 15px;">
//                   <img src="${postData.fromPic || "/default-avatar.png"}"
//                        style="width:40px;height:40px;border-radius:50%;margin-right:10px;"
//                        alt="${postData.fromName || "User"}">
//                   <div>
//                       <strong>${postData.fromName || "Unknown"}</strong><br>
//                       <small style="color:#aaa;">
//                           ${
//                             postData.date || postData.createdAt
//                               ? timeAgo(postData.date || postData.createdAt)
//                               : "Just now"
//                           }
//                       </small>
//                   </div>
//               </div>

//               <div class="POST-DESCRIPTION">
//                   <p class="desc-text">${postData.description || ""}</p>
//                   <span class="see-more">See more</span>
//               </div>

//               <div class="POST-MEDIA">
//                   ${mediaHTML}
//                   <div class="media-viewer hidden">
//                       <span class="nav left" onclick="navigateMedia(-1)">❮</span>
//                       <img class="viewer-img" alt="Full screen media" />
//                       <span class="nav right" onclick="navigateMedia(1)">❯</span>
//                       <span class="close-viewer" onclick="closeMediaViewer()">✕</span>
//                   </div>
//               </div>

//               <div class="POST-ACTIONS" style="display:flex;justify-content:space-around;padding:10px 0;border-top:1px solid #555;border-bottom:1px solid #555;">
//                   <button class="like-btn ${isLiked ? "liked" : ""}"
//                           data-post-id="${postId}"
//                           data-liked="${isLiked}"
//                           style="display:flex; align-items:center; gap:5px;">
//                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
//                            fill="${isLiked ? "currentColor" : "none"}" 
//                            stroke="currentColor" 
//                            stroke-width="${isLiked ? "0" : "2"}">
//                           <path d="M2 21h4V9H2v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.21 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.48.14-.73v-1.78z"/>
//                       </svg>
//                       Like <span class="pLikesCount">${likesCount}</span>
//                   </button>

//                   <button class="comment-btn" style="display:flex;align-items:center;gap:5px;">
//                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"></path>
//                       </svg>
//                       Comment
//                   </button>

//                   <button class="share-btn" 
//         data-post-id="${postId}"
//         data-post-url="${window.location.origin}/post/${postId}"
//         title="Share this post"
//         style="display:flex;align-items:center;gap:5px;border:none;background:none;cursor:pointer;padding:5px;">
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//         <circle cx="18" cy="5" r="3"></circle>
//         <circle cx="6" cy="12" r="3"></circle>
//         <circle cx="18" cy="19" r="3"></circle>
//         <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
//         <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
//     </svg>
//     <span>Share</span>
// </button>


//                   <div class="more-wrapper" style="position: relative;">
//   <button class="more-btn" 
//           data-post-id="${postId}"
//           style="font-size: 18px; background:none; border:none; color:#aaa; cursor:pointer; padding:0 8px;">
//     •••
//   </button>
  
//   <div class="more-menu" data-post-id="${postId}">
//     <div class="more-menu-item save-post-btn">
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//         <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
//       </svg>
//       Save post
//     </div>
//   </div>
// </div>
//               </div>
//           `;

//       // Mock comments fallback
//       post.mockComments = postData.comments ||
//         postData.mockComments || [
//           {
//             from: "Amani",
//             to: "Sara",
//             comment: "Wow, amazing!",
//             time: "3h ago",
//           },
//           { from: "John", to: "Mike", comment: "Love this!", time: "2h ago" },
//           { from: "Sara", to: "Amani", comment: "Thank you!", time: "1h ago" },
//         ];

//       postsContainer.appendChild(post);
//     });

//     // See more / See less functionality
//     document.querySelectorAll(".see-more").forEach((btn) => {
//       btn.onclick = () => {
//         const p = btn.previousElementSibling;
//         const isOpen = p.style.webkitLineClamp === "unset";
//         p.style.webkitLineClamp = isOpen ? "3" : "unset";
//         btn.textContent = isOpen ? "See more" : "See less";
//       };
//     });

//     postsSection.scrollTop = 0;
//   } catch (err) {
//     console.error("Failed to load posts:", err);
//     postsContainer.innerHTML = `<div style="color:#ff4444;padding:20px;text-align:center;">
//           Failed to load posts. Please try again later.
//       </div>`;
//   }

//   attachLikeListeners();
//   attachShareListeners();
//   attachMoreMenuListeners();
// }
// renderPosts();
// postsContainer.addEventListener("click", (e) => {
//   const btn = e.target.closest(".comment-btn");
//   if (!btn) return;

//   const post = btn.closest(".POST-ITEM");

//   commentDrawerP.dataset.activePostId = post.dataset.postId;
//   renderComments(post);

//   commentDrawerP.classList.add("show");
//   overlay.style.display = "block";
//   document.body.style.overflow = "hidden";
// });

// closeCommentsP.addEventListener("click", () => {
//   commentDrawerP.classList.remove("show");
//   overlay.style.display = "none";
//   document.body.style.overflow = "auto";
// });

// function renderComments(post) {
//   const postId = post.dataset.postId;

//   const owner = post.querySelector(".POST-HEADER strong").textContent;

//   fetch("/obtain/commentsP", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ postId }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       let comments = data.commentsData;
//       commentListP.innerHTML = "";

//       comments.forEach((c) => {
//         const div = document.createElement("div");
//         div.classList.add("comment-item");
//         div.style.display = "flex";
//         div.style.alignItems = "center";
//         div.style.gap = "10px";
//         div.style.marginBottom = "8px";

//         div.innerHTML = `
//                 <div class="comment-pic" style="
//                     width: 30px;
//                     height: 30px;
//                     border-radius: 50%;
//                     background-color: #3b82f6; /* blue circle */
//                     display: flex;
//                     justify-content: center;
//                     align-items: center;
//                     color: white;
//                     font-size: 14px;
//                     font-weight: bold;
//                 ">
//                   ${c.from[0].toUpperCase()}
//                 </div>
//                 <div class="comment-text" style="flex:1;">
//                   <strong>${c.from}</strong> ${c.comment} <br>
//                   <small style="color:#aaa; font-size:11px;">${new Date(
//                     c.time
//                   ).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}</small>
//                 </div>
//                 <button class="like-comment-btn" style="
//                   background:none;
//                   border:none;
//                   cursor:pointer;
//                   color:#3b82f6;
//                   font-weight:bold;
//                 ">👍 <span class="like-count">0</span></button>
//               `;

//         const likeBtn = div.querySelector(".like-comment-btn");
//         const likeCount = div.querySelector(".like-count");
//         likeBtn.addEventListener("click", () => {
//           let count = parseInt(likeCount.textContent);
//           count++;
//           likeCount.textContent = count;
//         });

//         commentListP.appendChild(div);
//       });
//     });
// }

// sendCommentP.addEventListener("click", async () => {
//   const text = newCommentP.value.trim();
//   if (!text) return;

//   const activePostId = commentDrawerP.dataset.activePostId;
//   const postOwner = document.querySelector(
//     `.POST-ITEM[data-post-id="${activePostId}"] .POST-HEADER strong`
//   ).textContent;
//   const mainUser = JSON.parse(localStorage.getItem("mainUser"));

//   try {
//     const res = await fetch("/post/commentsP", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         postId: activePostId,
//         from: mainUser,
//         to: postOwner,
//         comment: text,
//         time: new Date(),
//       }),
//     });

//     if (!res.ok) throw new Error("Failed to post comment");

//     newCommentP.value = "";
//     renderComments(
//       document.querySelector(`.POST-ITEM[data-post-id="${activePostId}"]`)
//     );
//     commentListP.scrollTop = commentListP.scrollHeight;
//   } catch (err) {
//     console.error(err);
//     alert("Error posting comment.");
//   }
// });

// const postText = document.getElementById("postText");
// const postMedia = document.getElementById("postMedia");
// const mediaPreview = document.getElementById("mediaPreview");
// const mediaWrapper = document.getElementById("mediaWrapper");
// const submitPost = document.getElementById("publishPost");

// const addPostBtn = document.getElementById("addPostBtn");
// const cancelCreatePost = document.getElementById("cancelCreatePost");

// addPostBtn.addEventListener("click", () => {
//   createPostSection.style.display = "block";
//   mainSection.style.display = "none";
//   postsSection.style.display = "none";
//   championsSection.style.display = "none";
// });

// cancelCreatePost.addEventListener("click", () => {
//   createPostSection.style.display = "none";
//   mainSection.style.display = "grid";
// });

// function renderMediaPreview() {
//   mediaWrapper.innerHTML = "";
//   mediaPreview.classList.remove("hidden");

//   const count = selectedFiles.length;

//   mediaWrapper.className = "";
//   if (count === 1) mediaWrapper.classList.add("one");
//   else if (count === 2) mediaWrapper.classList.add("two");
//   else if (count === 3) mediaWrapper.classList.add("three");
//   else mediaWrapper.classList.add("four");
//   if (count > 4) mediaWrapper.classList.add("more");

//   selectedFiles.slice(0, 4).forEach((file, index) => {
//     const url = URL.createObjectURL(file);
//     let media;

//     if (file.type.startsWith("video")) {
//       media = document.createElement("video");
//       media.src = url;
//       media.muted = true;
//       media.autoplay = true;
//       media.loop = true;
//     } else {
//       media = document.createElement("img");
//       media.src = url;
//     }

//     const wrapper = document.createElement("div");
//     wrapper.style.position = "relative";
//     wrapper.style.height = "150px";

//     if (index === 3 && count > 4) {
//       const overlay = document.createElement("div");
//       overlay.className = "overlay-count";
//       overlay.textContent = `+${count - 4}`;
//       wrapper.appendChild(overlay);
//     }

//     wrapper.appendChild(media);
//     mediaWrapper.appendChild(wrapper);
//   });
// }

// function checkPostReady() {
//   submitPost.disabled = !(
//     postText.value.trim() || mediaWrapper.children.length
//   );
// }

// postText.addEventListener("input", checkPostReady);

// postMedia.addEventListener("change", () => {
//   const files = Array.from(postMedia.files);
//   if (!files.length) return;

//   files.forEach((file) => {
//     if (
//       !selectedFiles.some((f) => f.name === file.name && f.size === file.size)
//     ) {
//       selectedFiles.push(file);
//     }
//   });

//   renderMediaPreview();

//   mediaBtn.classList.add("active");
//   mediaBtn.innerHTML = "Add More Media 🧐";
//   postMedia.value = "";
//   checkPostReady();
// });

// submitPost.onclick = async () => {
//   const formData = new FormData();
//   formData.append("description", postText.value);

//   selectedFiles.forEach((file) => {
//     formData.append("media[]", file);
//   });

//   try {
//     const response = await fetch("/posts", {
//       method: "POST",
//       body: formData,
//     });

//     if (!response.ok) throw new Error("Failed to post.");

//     await renderPosts();

//     postText.value = "";
//     selectedFiles = [];
//     mediaWrapper.innerHTML = "";
//     mediaPreview.classList.add("hidden");
//     document.getElementById("mediaBtn").classList.remove("active");
//     submitPost.disabled = true;

//     createPostSection.style.display = "none";
//     postsSection.style.display = "flex";
//     mainSection.style.display = "none";
//   } catch (err) {
//     console.error(err);
//     alert("Error posting. Try again!");
//   }
// };

// const tbody = document.querySelector("#championsTable tbody");
// function getBarColor(rating) {
//   if (rating > 70) return "green";
//   if (rating > 40) return "orange";
//   if (rating > 18) return "yellow";
//   return "red";
// }
// async function renderChampions() {
//   tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

//   try {
//     const res = await fetch("/champions/data");
//     if (!res.ok) throw new Error("Failed to fetch champions data");

//     const data = await res.json();
//     const champions = data.champions;

//     if (!champions || !champions.length) {
//       tbody.innerHTML = "<tr><td colspan='3'>No champions available</td></tr>";
//       return;
//     }

//     tbody.innerHTML = "";

//     champions.sort((a, b) => b.rating - a.rating);

//     champions.forEach((player, index) => {
//       const row = document.createElement("tr");

//       row.innerHTML = `
//   <td>${index + 1}</td>
//   <td>${player.username || player.name}</td>
//   <td>
//     ${player.rating || player.viewsCount || 0}
//     <div class="bar">
//       <div class="bar-fill ${getBarColor(player.rating || player.viewsCount)}"
//            style="width:${player.rating || player.viewsCount}%"></div>
//     </div>
//   </td>
// `;

//       if (index === 0) row.classList.add("gold");
//       if (index === 1) row.classList.add("silver");
//       if (index === 2) row.classList.add("bronze");

//       tbody.appendChild(row);
//     });
//   } catch (err) {
//     console.error("Failed to fetch champions:", err);
//     tbody.innerHTML = "<tr><td colspan='3'>Failed to load champions</td></tr>";
//   }
// }

// renderChampions();
// const countdownEl = document.getElementById("countdown");
// const endTime = Date.now() + 30 * 24 * 60 * 60 * 1000;

// setInterval(() => {
//   const diff = endTime - Date.now();
//   if (diff <= 0) {
//     countdownEl.textContent = "🏁 Awards time!";
//     return;
//   }

//   const d = Math.floor(diff / (1000 * 60 * 60 * 24));
//   const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
//   const m = Math.floor((diff / (1000 * 60)) % 60);
//   const s = Math.floor((diff / 1000) % 60);

//   countdownEl.textContent = `⏳ Award in: ${d}d ${h}h ${m}m ${s}s`;
// }, 1000);
