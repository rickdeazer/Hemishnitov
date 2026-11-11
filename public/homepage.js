let head = document.querySelector('.styleSheet');
let body = document.querySelector('.body');
let mainSection = document.getElementById("mainSection");
let searchInput = document.getElementById("HOME-SEARCH");
let searchInputBtn = document.getElementById("searchInputBtn");
let postSwitchBtn = document.getElementById("CHATSH-BTN");
let postSwitchText = document.getElementById("mat2");
let headerAppname = document.getElementById("HEADER-APPNAME");
let commentModal = document.getElementById("COMMENT-MODAL");
let commentBody = document.getElementById("COMMENT-BODY");
let commentInput = document.getElementById("NEW-COMMENT");
let sendComment = document.getElementById("ADD-COMMENT");
let closeComments = document.getElementById("CLOSE-COMMENTS");
let header = document.getElementById("HEADER");
let homeSearch = document.getElementById("HOME-SEARCH");
let commentHeader = document.getElementById("COMMENT-HEADER");
let mainU = document.getElementById('username');
let mainUser = mainU.innerText;
let logo = document.getElementById("HEADER-LOGO");
let currentCommentUser = 'null';
let alertDiv = document.getElementById("alertDiv");
let profilePic = document.getElementById("HEADER-PROFILEPIC")
let rotation = 0;
let comments = [];
let filters = document.querySelector("#filters");
let institutionSelect = document.querySelector("#institutionSelect");
let courseSelect = document.querySelector("#courseSelect");
let yearSelect = document.querySelector("#yearSelect");
let basket = {
  campus: 'All',
  course: 'All',
  year: 'All'
};
  const checkerBg = (selectItemToChange)=>{
    if(selectItemToChange.value == "All"){
      selectItemToChange.style.background = "linear-gradient(rgba(22, 128, 4, 0.426),transparent,transparent)";
      selectItemToChange.style.backgroundColor = "#04203d";
    } else {
      selectItemToChange.style.background = "linear-gradient(rgba(232, 20, 207, 0.69),transparent,transparent)";
      selectItemToChange.style.backgroundColor = "#04203d";
    }
  }
institutionSelect.addEventListener('change',()=>{
  basket.campus = institutionSelect.value;
  checkerBg(institutionSelect);
  fetchHomepage();
});
courseSelect.addEventListener('change',()=>{
  basket.course = courseSelect.value;
  checkerBg(courseSelect);
  fetchHomepage();
});
yearSelect.addEventListener('change',()=>{
  basket.year = yearSelect.value;
  checkerBg(yearSelect);
  fetchHomepage();
})
const tomorrowMidnight = new Date();
tomorrowMidnight.setHours(24,0,0,0);
let scrollValue = 1;
const headerMenu = document.getElementById("HEADER-MENU-ICONS");
let fetched = [];
let exit = document.getElementById("exit");
const audioClick = document.getElementById('click');
const audioUnClick = document.getElementById('unClick');
const loaderB = document.getElementById("loaderB");

postSwitchBtn.addEventListener('click',()=>{
  if (postSwitchText.classList.contains("post")){
    postSwitchBtn.innerHTML = `
              <span class="material-symbols-outlined" id="mat2"><img class="imgSvg" src="/Assets/postsHomePage.svg" alt=""></span>`
    showPeople();
    postSwitchText = document.getElementById("mat2");
  } else {
    postSwitchBtn.innerHTML = `
              <span class="material-symbols-outlined post" id="mat2"><img class="imgSvg" src="/Assets/emoji_people_24dp_75FB4C_FILL0_wght400_GRAD0_opsz24.svg" alt=""></span>`;
    showPosts();
    postSwitchText = document.getElementById("mat2");
  }
})

function dateDefiner (daysAgo, dateValue){if(daysAgo <= 24){
        dateValue = `today: ${dateValue.toLocaleTimeString(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})}`
    } else if(daysAgo <= 48) {
      dateValue = "online Yesterday"
    } else if(daysAgo <= 72) {
      dateValue = "Yesterday"
    } else if(daysAgo <= 96){
      dateValue = "none"
    } else if(daysAgo <= 120){
      dateValue = "none"
    } else if(daysAgo <= 144){
      dateValue = "none"
    } else if(daysAgo <= 168){
      dateValue = "none"
    } else if(daysAgo <= 192){
      dateValue = "none"
    } else if(daysAgo <= 216){
      dateValue = "none"
    } else if(daysAgo <= 240){
      dateValue = "none"
    } else {
      dateValue = "none";
    }
    return {daysAgo, lastSeen: dateValue};
}

if (localStorage.getItem("backStyle")) {
  if (
    localStorage.getItem("backStyle") !== "0" &&
    localStorage.getItem("backStyle") !== "1"
  ) {
    localStorage.setItem("backStyle", 0);
  }
} else {
  localStorage.setItem("backStyle", 0);
}
let backStyle = Number(localStorage.getItem("backStyle"));

commentInput.hidden = true;
function renderHomepage(arr) {
  mainSection.innerHTML = ``;
  mainSection.appendChild(commentModal);
  let isArray = arr?.[0]? true : false;
  if(isArray){
    arr.forEach((u) => {
    let profileImg =
      u.profileLink && u.profileLink !== ""
        ? u.profileLink
        : "/uploads/defaultProfile3.png";

    let userDiv = document.createElement("div");
    userDiv.className = "MAIN-USERS";
    userDiv.style.position = "relative";
    
    let imgDiv = document.createElement("div");
    imgDiv.className = "MAIN-USERS-IMG";
    imgDiv.style.backgroundImage = `url('${profileImg}')`;
    imgDiv.style.backgroundSize = "cover";
    imgDiv.style.backgroundPosition = "center";
    let majorDiv = document.createElement("div");
    majorDiv.className = "slogan_seen"

    const lastSeen = new Date(u.lastSeen);
    
    const daysAgo = ( Math.floor((tomorrowMidnight - lastSeen)/3600000));

    
    const givenDates = dateDefiner(daysAgo, lastSeen);

        if(givenDates.lastSeen != "none"){
    const dateElement = document.createElement("div");
    dateElement.className = "lastSeen";
    dateElement.innerHTML = givenDates.lastSeen;
    dateElement.style.padding = "5px";
    majorDiv.appendChild(dateElement);
    }
    if(u.slogan){
      let userSlogan = document.createElement("div");
    userSlogan.className = "userSlogan";
    userSlogan.innerHTML = `<marquee class="marquee-div" behaviour direction="left" >${u.slogan}</marquee>`;
    majorDiv.appendChild(userSlogan)
    } else {
      majorDiv.style.width = "min-content"
    };
    imgDiv.appendChild(majorDiv);
    let institution = document.createElement("div");
    institution.className = "institution";
    institution.innerText = `${u.Institution || "MOI UNIVERSITY"}`;
    majorDiv.appendChild(institution);
    if(u.blogTitle){
      let blogTitle = document.createElement("div");
    blogTitle.className = "blogTitle";
    blogTitle.innerText = `${u.blogTitle}`;
    imgDiv.appendChild(blogTitle)
    };
  
    if (backStyle == 0) {
    imgDiv.classList.add("bg-fixed");
    } else {
      imgDiv.classList.add("bg-local");
    }



    let commentBtn = document.createElement("div");
    commentBtn.classList.add("openComment");
    commentBtn.innerHTML = `
    <svg class="neon-arrow" width="28" height="28" viewBox="0 0 24 24" fill="#04ffb8">
      <path d="M5 12L12 5L19 12" stroke="#00ff99" stroke-width="2" stroke-linecap="round"/>
    </svg><span>${u.comments || ""}</span>
    `;
    
    let vlabel = "";
    let usernameDiv = document.createElement("div");
    usernameDiv.className = "MAIN-USERS-USERNAME";
    let userLikeHeartBox = document.createElement("div");
    userLikeHeartBox.className = "userLikeHeartBox";
    let currentLikes = u.likesCount || "";
    let liked = u.liked;
    userLikeHeartBox.innerHTML = liked? `<img class="Jumper-${u.username}" src="/Assets/MMUN-red-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`:`<img class="Jumper-${u.username}" src="/Assets/MMUN-white-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`;
    userLikeHeartBox.addEventListener("click",(event)=>{
      event.stopPropagation();
      async function callLike(likeMode){
         await fetch("/likeUserProfile", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({viewedUser: u.username, likeMode: likeMode})
        })
      }
      if(liked){
        currentLikes --;
        currentLikes == 0? currentLikes = '': currentLikes = currentLikes;
        setTimeout(() => {
           userLikeHeartBox.innerHTML=`<img class="Jumper-${u.username}" src="/Assets/MMUN-white-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`;
            heart = document.querySelector(`.Jumper-${u.username}`);
        }, 200);
        heart.classList.remove("jumper");
        heart.classList.add("sweeper");
        callLike(false)
      } else {
        heart.classList.remove("sweeper")
        heart.classList.add("jumper");
        setTimeout(() => {
        currentLikes ++;
        userLikeHeartBox.innerHTML=`<img class="Jumper-${u.username}" src="/Assets/MMUN-red-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`;
        heart = document.querySelector(`.Jumper-${u.username}`);
        }, 500);
        callLike(true);
      }
      liked = liked == true? false: true;
    })
    if(u.viewsCount && typeof(u.viewsCount)=="number"){
    if (u.viewsCount < 2) {
      vlabel = "Vit";
    } else {
      vlabel = "Vits";
    }
    if (fetched.includes(u.username)) {
    } else {
      fetched.push(u.username);
    }
    }else{
      vlabel = ""
    }
    usernameDiv.innerHTML = `
      <span class="Username">${u.username}</span><div class="mainSet">
      <div class="setOne"><span class="MAIN-USERS-COURSE">${
        u.course || "Computer Science"
      }</span>
      <span class="MAIN-USERS-YEAR">${
        u.year || "First year"
      }</span></div> ${u.viewsCount? `<span class="MAIN-USERS-VIEWS">${
      u.viewsCount ? u.viewsCount + " " + vlabel : ""
    } </span>`: ""}
    
    `;
    userDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.setItem("forUsClicked",u.username)
      localStorage.setItem("pointerdown", `${u.username}`);
      userOpener(u.username);
    });

    imgDiv.appendChild(commentBtn);
    userDiv.appendChild(imgDiv);
    imgDiv.appendChild(userLikeHeartBox);
    userDiv.appendChild(usernameDiv);
    mainSection.appendChild(userDiv);
    let heart = document.querySelector(`.Jumper-${u.username}`);
    let displayComments = () => {
      usernameDiv.style.opacity = "0";
      exit.hidden = true;
      commentBtn.style.opacity = "0";
      currentCommentUser = u.username;
      commentModal.style.bottom = "0px";
      fetch("/obtainComments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCommentUser: currentCommentUser,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          comments = data.comments || [];
          renderCommentsContacts(currentCommentUser, u.comments);
        })
        .catch((err) => console.error(err));
      closeComments.addEventListener("click", () => {
        closeCommentsClick(usernameDiv);
      });
      commentHeader.addEventListener("click", () => {
        commentHeaderClick(usernameDiv, commentBtn);
      });
    };
    commentBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      commentModal.style.bottom = "0px"; 
      displayComments();
    });
  });
  } else {
    const noUsersDiv = document.createElement("div");
    noUsersDiv.innerHTML = `<h2 style="color:white; width: 75%; display: flex; text-align: center; background: radial-gradient(transparent, rgba(194, 1, 1, 0.77)); border-radius: 10px; justify-self: center; justify-content: center; align-self: center; height: 30px; align-items: center; font-size: 0.75rem; border: solid 1px #022801; color: #ffffffbd; font-family: 'Poppins', sans-serif;">!No users found matching your filters.</h2>`;
    mainSection.appendChild(noUsersDiv);

  }
}
function addHomepage(arr) {
  arr.forEach((u) => {
    if (fetched.includes(u.username)) {
      return;
    } else {
      fetched.push(u.username);
    }

    let profileImg =
      u.profileLink && u.profileLink !== ""
        ? u.profileLink
        : "/mediafiles/defaultProfile2.png";
    let userDiv = document.createElement("div");
    userDiv.className = "MAIN-USERS";
    userDiv.style.position = "relative";

    let imgDiv = document.createElement("div");
    let majorDiv = document.createElement("div");
    majorDiv.className = "slogan_seen"

    const lastSeen = new Date(u.lastSeen).toLocaleDateString();
    const daysAgo = ( Math.floor((new Date() - new Date(u.lastSeen))/3600000));
    
    const givenDates = dateDefiner(daysAgo, new Date(u.lastSeen));
    if(givenDates.lastSeen != "none"){
    const dateElement = document.createElement("div");
    dateElement.className = "lastSeen";
    dateElement.innerHTML = givenDates.lastSeen;
    dateElement.style.padding = "5px";
    majorDiv.appendChild(dateElement);
    }
    if(u.slogan){
      let userSlogan = document.createElement("div");
    userSlogan.className = "userSlogan";
    userSlogan.innerHTML = `<marquee class="marquee-div" behaviour direction="left" >${u.slogan}</marquee>`;
    majorDiv.appendChild(userSlogan)
    } else {
      majorDiv.style.width = "min-content"
    };;
    imgDiv.appendChild(majorDiv);
    let institution = document.createElement("div");
    institution.className = "institution";
    institution.innerText = `${u.Institution || "MOI UNIVERSITY"}`;
    majorDiv.appendChild(institution);
    if(u.blogTitle){
      let blogTitle = document.createElement("div");
    blogTitle.className = "blogTitle";
    blogTitle.innerText = `${u.blogTitle}`;
    imgDiv.appendChild(blogTitle)
    };
    imgDiv.className = "MAIN-USERS-IMG";
    imgDiv.style.backgroundImage = `url('${profileImg}')`;
    imgDiv.style.backgroundSize = "cover";
    imgDiv.style.backgroundPosition = "center";
    if (backStyle == 0) {
      imgDiv.style.backgroundAttachment = "fixed";
      body.style.backgroundAttachment = "fixed";
    } else {
      imgDiv.style.backgroundAttachment = "local";
      body.style.backgroundAttachment = "local";
    }

    let commentBtn = document.createElement("div");
    commentBtn.classList.add("openComment");
    commentBtn.innerHTML = `
<svg class="neon-arrow" width="28" height="28" viewBox="0 0 24 24" fill="#04ffb8">
  <path d="M5 12L12 5L19 12" stroke="#00ff99" stroke-width="2" stroke-linecap="round"/>
</svg><span>${u.comments || ""}</span>
`;

    let usernameDiv = document.createElement("div");
    usernameDiv.className = "MAIN-USERS-USERNAME";
        let userLikeHeartBox = document.createElement("div");
    userLikeHeartBox.className = "userLikeHeartBox";
    let currentLikes = u.likesCount || "";
    console.log(u)
    let liked = u.liked;
    userLikeHeartBox.innerHTML = liked? `<img class="Jumper-${u.username}" src="/Assets/MMUN-red-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`:`<img class="Jumper-${u.username}" src="/Assets/MMUN-white-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`;
    userLikeHeartBox.addEventListener("click",(event)=>{
      event.stopPropagation();
      async function callLike(likeMode){
         await fetch("/likeUserProfile", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({viewedUser: u.username, likeMode: likeMode})
        })
      };
    let heart = document.querySelector(`.Jumper-${u.username}`);
    console.log(heart,'is the real heart of the system');
      if(liked){
        currentLikes --;
        currentLikes == 0? currentLikes = '': currentLikes = currentLikes;
        setTimeout(() => {
           userLikeHeartBox.innerHTML=`<img class="Jumper-${u.username}" src="/Assets/MMUN-white-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`;
            heart = document.querySelector(`.Jumper-${u.username}`);
        }, 200);
        heart.classList.remove("jumper");
        heart.classList.add("sweeper");
        callLike(false)
      } else {
        heart.classList.remove("sweeper")
        heart.classList.add("jumper");
        setTimeout(() => {
        currentLikes ++;
        userLikeHeartBox.innerHTML=`<img class="Jumper-${u.username}" src="/Assets/MMUN-red-heart-svg.svg" alt="Like"> <span>${currentLikes}</span>`;
        heart = document.querySelector(`.Jumper-${u.username}`);
        }, 500);
        callLike(true);
      }
      liked = liked == true? false: true;
    })
    let vlabel = "";
    if (u.viewsCount < 2) {
      vlabel = "Vit";
    } else {
      vlabel = "Vits";
    }

    usernameDiv.innerHTML = `
      <span class="Username">${u.username}</span><div class="mainSet">
      <div class="setOne"><span class="MAIN-USERS-COURSE">${
        u.course || "COM"
      }</span> 
      <span class="MAIN-USERS-YEAR">${
        u.year || "1"
      }</span></div>${u.viewsCount? `<span class="MAIN-USERS-VIEWS">${
      u.viewsCount ? u.viewsCount + " " + vlabel : ""
    } </span>`: ""}
    </div>
    `;

    userDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.setItem("pointerdown", `${u.username}`);
      userOpener(u.username);
    });

    imgDiv.appendChild(commentBtn);
    userDiv.appendChild(imgDiv);
    imgDiv.appendChild(userLikeHeartBox);
    userDiv.appendChild(usernameDiv);
    mainSection.appendChild(userDiv);
    let displayComments = () => {
      usernameDiv.style.opacity = "0";
      exit.hidden = true;
      commentBtn.style.opacity = "0";
      currentCommentUser = u.username;
      commentModal.style.bottom = "0px";
      fetch("/obtainComments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCommentUser: currentCommentUser,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          comments = data.comments || [];
          renderCommentsContacts(currentCommentUser, u.comments);
        })
        .catch((err) => console.error(err));
      closeComments.addEventListener("click", () => {
        closeCommentsClick();
      });
      commentHeader.addEventListener("click", () => {
        commentHeaderClick(usernameDiv, commentBtn);
      });
    };
    commentBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      commentModal.style.bottom = "0px";
      displayComments();
    });
  });
}

const feedState = {
  cursor:  null,
  hasMore: true,
  loading: false
};

// ── Replaces your fetchHomepage() — same signature, same behaviour ─────────
function fetchHomepage(call = 'side') {
  const params = new URLSearchParams({
    campus: basket.campus,
    course: basket.course,
    year:   basket.year
  });

  fetch(`/homepage?${params}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cursor:  null,
      seenIds: []
    })
  })
    .then(res => res.json())
    .then(data => {
      // reset feed state on fresh load
      feedState.cursor  = data.pagination.nextCursor;
      feedState.hasMore = data.pagination.hasNextPage;
      feedState.loading = false;

      renderHomepage(data?.data);

      // your exact original updates/designer logic — untouched
      const updates = data?.updates?.updates;
      const Role    = data?.updates?.Role || "Student";

      if (call == 'parent') {
        let designer = false;
        updates[3] == '1' ? designer = true : designer = false;
        if (designer == false) {
          checkAndPromptUpdates(designer, Role);
        } else {
          checkAndPromptUpdates(designer, Role);
        }
      }
    })
    .catch(error => {
      console.error("fetchHomepage error:", error);
    });
}

// ── Replaces your fetchOthers() — same signature, same behaviour ───────────
function fetchOthers() {
      
  if (feedState.loading || !feedState.hasMore) return;

  // ✅ lock immediately — synchronous, before any async code
  feedState.loading = true;
  loaderB.style.display = "block";

  const params = new URLSearchParams({
    campus: basket.campus,
    course: basket.course,
    year:   basket.year
  });

  // ✅ snapshot cursor right now before anything changes
  const currentCursor  = feedState.cursor;
  const currentSeenIds = [...fetched];   // snapshot fetched at this moment

  fetch(`/homepage?${params}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cursor:  currentCursor,
      seenIds: currentSeenIds
    })
  })
    .then(res => res.json())
    .then(data => {
      let data2 = Array.from(
        new Map(
          data.data
            .filter(p => !fetched.includes(p.username))
            .map(p => [p.username, p])
        ).values()
      );

      addHomepage(data2);

      // ✅ update cursor immediately in .then, not in .finally
      feedState.cursor  = data.pagination.nextCursor;
      feedState.hasMore = data.pagination.hasNextPage;

      const updates = data?.updates?.updates;
      const Role    = data?.updates?.Role || "Student";

      if (updates && updates !== 'null') {
        let designer = updates[3] === '1';
        checkAndPromptUpdates(designer, Role);
      }
    })
    .catch(err => {
      console.error("Fetch others error:", err);
    })
    .finally(() => {
      setTimeout(() => {
        loaderB.style.display = "none";
        feedState.loading = false;  // ✅ unlock only after everything is done
      }, 500);
    });
}

const searchUsers = () => {
  let filter = searchInput.value.toLowerCase().trim();
  if (filter !== "") {
    fetch(`/everyone/${filter}`)
      .then((res) => res.json())
      .then((data) => {
        renderHomepage(
          data.data.filter((u) => u.username.toLowerCase().includes(filter))
        );
      });
    searchInput.value = "";
  } else {
    fetchHomepage();
  }
};

searchInputBtn.addEventListener("click", () => {
  showPeople();
  searchUsers();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    showPeople();
    searchUsers();
  }
});

function renderCommentsContacts(user, NOC) {
  if (NOC) {
  } else {
    NOC = "";
  }
  let Iname = "Insight";
  if (NOC == 1) {
    Iname = "Insight";
  } else {
    Iname = "Insights";
  }
  commentBody.innerHTML = "";
  commentHeader.innerHTML = ` <h3>${NOC} ${Iname} on ${user}</h3>
        <button id="CLOSE-COMMENTS"></button>`;
  comments
    .filter((c) => c.to === user)
    .forEach((c) => {
      let liked = c.likedBy?.includes(mainUser);
      let commentItem = document.createElement("div");
      commentItem.className = "COMMENT-ITEM";
      commentItem.innerHTML = `
        <div class="COMMENT-HEADER">
          <span class="COMMENT-USER" onclick="userOpener('${c.from}')">${
        c.from
      }</span>
          <div class="COMMENT-ACTIONS">
            <span class="COMMENT-TIME">${c.time}</span>
            <div class="COMMENT-LIKE" 
                 data-id="${c._id}" 
                 style="cursor:pointer; color:${liked ? "red" : "blue"}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${
                liked ? "red" : "blue"
              }">
                <path d="M12 21.35l-1.45-1.32C5 15 2 12 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h1.87C14.46 4.99 15.96 4 17.5 4 20 4 22 6 22 8.5c0 3.5-3 6.5-8.55 11.54L12 21.35z"/>
              </svg>
              <span class="LIKE-COUNT">${c.likes || 0}</span>
            </div>
          </div>
        </div>
        <div class="COMMENT-TEXT">${c.comment}</div>
      `;

      commentItem.addEventListener("contextmenu", (e) => {
        e.preventDefault();

        let menu = document.getElementById("commentContextMenu");
        let isOwner = c.from === mainUser;

        menu.style.top = `${e.clientY + 2}px`;
        menu.style.left = `${e.clientX}px`;
        menu.classList.remove("hidden");

        menu.dataset.commentId = c._id;
        menu.dataset.from = c.from;

        menu.querySelector('[data-action="delete"]').style.display = isOwner
          ? "block"
          : "none";

        document.addEventListener("click", () => {
          menu.classList.add("hidden");
        });
      });
      commentBody.appendChild(commentItem);
    });
  commentModal.appendChild(commentBody);
  mainSection.appendChild(commentModal);
  likeComment();
};


document
  .querySelector('#commentContextMenu [data-action="delete"]')
  .addEventListener("click", async () => {
    const menu = document.getElementById("commentContextMenu");
    const commentId = menu.dataset.commentId;

    if (!commentId) return;

    const res = await fetch("/deleteComment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });

    const data = await res.json();

    if (data.success) {
      comments = comments.filter((c) => c._id !== commentId);

      renderCommentsContacts(currentCommentUser);

      menu.classList.add("hidden");
    }
  });
function likeComment() {
  document.querySelectorAll(".COMMENT-LIKE").forEach((btn) => {
    btn.addEventListener("click", () => {
      let commentId = btn.dataset.id;
      fetch("/toggleLike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: commentId,
          username: mainUser,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          btn.style.color = data.liked ? "red" : "blue";

          btn
            .querySelector("svg")
            .setAttribute("fill", data.liked ? "red" : "blue");

          btn.querySelector(".LIKE-COUNT").textContent = data.likes;

          const index = comments.findIndex((c) => c._id == commentId);
          if (index !== -1) {
            comments[index].likes = data.likes;
            if (data.liked) {
              comments[index].likedBy.push(mainUser);
            } else {
              comments[index].likedBy = comments[index].likedBy.filter(
                (u) => u !== mainUser
              );
            }
          }
        });
    });
  });
}
sendComment.addEventListener("click", (e) => {
  e.preventDefault();
  commentBody.scrollTo(0, commentBody.scrollHeight);
  commentInput.hidden = false;
  let newComment = commentInput.value.trim();
  if (!newComment || !currentCommentUser) return;
  fetch("/post/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: currentCommentUser,
      comment: newComment,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      comments.push(data.comment);

      commentInput.value = "";
      renderCommentsContacts(currentCommentUser);
      commentBody.scrollTop = commentBody.scrollHeight;
    });
});
fetchHomepage('parent');
const userOpener = (user) => { //also equals visitUser
  let form = document.createElement("form");
  form.method = "POST";
  form.action = "/user";

  let input = document.createElement("input");
  input.type = "hidden";
  input.name = "username";
  input.value = user;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
};
let changeDisplay = (value, style) => {
  mainSection.style.opacity = 0.3;
  localStorage.setItem("backStyle", value);
  backStyle = value;
  alertDiv.style.display = "flex";
  let x = 5;
  let alertInterval = setInterval(() => {
    x--;
    alertDiv.innerHTML = `<span>Closing and Refreshing in: <span>${x}</span></span>Your Scroll Behaviour is now set to ${style}. Click on the logo again to toggle.`;
  }, 1000);
  setTimeout(() => {
    mainSection.style.opacity = 1;
    alertDiv.style.display = "none";
    alertInterval = 0;
    window.location.href = "/home";
  }, 5000);
};
logo.addEventListener("click", () => {
  if (backStyle) {
    changeDisplay(0, "Classic");
  } else {
    changeDisplay(1, "Normal");
  }
});
let storedValue = [];
let lastDirection = null;
let budgetStart = 0;
let rotationAtBudgetStart = 0;
let lastScrollTime = 0;

mainSection.addEventListener("scroll", () => {
  const now = Date.now();
  if (now - lastScrollTime < 16) return;
  lastScrollTime = now;

  const direction = mainSection.scrollTop < scrollValue ? "up" : "down";

  if (direction !== lastDirection) {
    budgetStart = mainSection.scrollTop;
    rotationAtBudgetStart = rotation;
    lastDirection = direction;
  }

  const budgetUsed = Math.abs(mainSection.scrollTop - budgetStart);

  if (budgetUsed <= 2000) {
    rotation = direction === "down"
      ? rotationAtBudgetStart + budgetUsed / 10
      : rotationAtBudgetStart - budgetUsed / 10;
    logo.style.transform = `rotateZ(${rotation}deg)`;
  } else {
    storedValue[0] = rotation;
  }

  if(mainSection.scrollTop < scrollValue){
    logo.style.animationName = "opposite";
    logo.style.transform = `rotateZ(${rotation}deg)`;
  }else {
    logo.style.animationName = "rotate";
  }  
  scrollValue = mainSection.scrollTop;
  if (mainSection.scrollTop >= 100) {
    profilePic.style.boxShadow = "0 0 10px black";
    filters.style.display = 'none';
    header.style.background = "rgba(0, 0, 0, 0.03)";
    header.style.animation = "none";
    headerMenu.style.top = "100px";
    homeSearch.style.borderColor = "rgba(2, 235, 234, 0.57)";
    header.style.borderBottom = 'transparent';
    logo.style.borderRadius = '50%';
    headerAppname.style.borderRadius = "20px";
    setAndroidHeaderColor('#1B5A7B');
    if (
      mainSection.scrollTop >=
      mainSection.scrollHeight - mainSection.clientHeight - 1200
    ) {
      setTimeout(() => {
        fetchOthers();
      }, 1000);
    }
  } else {
    atTopsets();
  }
  header.style.animation = "header";
});
function atTopsets (){
  profilePic.style.boxShadow = "0 0 5px green";
    headerMenu.style.top = "180px";
    logo.style.animation = "  transition: 2s ease";
    homeSearch.style.border = "groove 2px #078f2288";
    header.style.borderBottom = "groove 2px #285e33";
    homeSearch.style.borderRight = "solid 3px";
    homeSearch.style.borderLeft = "solid 3px";
    homeSearch.style.borderBottom = "solid 2px"
    logo.style.backgroundColor = "";
    logo.style.borderRadius = "35%"
    logo.style.border = "solid 1px rgba(190, 190, 190, 1)";
    header.style.background =
      'url("/mediafiles/signupBackground1.jpg")';
    headerAppname.style.borderRadius = "15px";
    headerAppname.style.borderBottomLeftRadius = "40%";
    headerAppname.style.borderBottomRightRadius = "20%";
    header.style.backgroundSize = "cover";
    filters.style.display = 'flex'
    setAndroidHeaderColor('#276f35',0);
}

function commentHeaderClick(usernameDiv, commentBtn){
        currentCommentUser = null;
        commentModal.style.bottom = "-500px";
        usernameDiv.style.opacity = "1";
        commentBtn.style.opacity = "1";
        commentInput.hidden = true;
        exit.hidden = false;
};
function closeCommentsClick(usernameDiv, commentBtn){
        currentCommentUser = null;
        usernameDiv.style.opacity = "1";
        commentModal.style.bottom = "-500px";
        commentBtn.hidden = false;
        exit.hidden = false;
};

const postsSection = document.getElementById("postsSection");


// postsSection.addEventListener("scroll", () => {
//   if(postsSection.scrollTop < scrollValue){
//     logo.style.animationName = "opposite";
//   }else {
//     logo.style.animationName = "rotate";
//   }
//   scrollValue = postsSection.scrollTop;
//   if (postsSection.scrollTop >= 100) {
//     profilePic.style.boxShadow = "0 0 10px black";
//     postsSection
//     header.style.animation = "none";
//     logo.style.border = "none";
//     homeSearch.style.borderColor = "rgba(255, 292, 203, 0.57)";
//     if (
//       postsSection.scrollTop >=
//       postsSection.scrollHeight - postsSection.clientHeight - 50
//     ) {
//       setTimeout(() => {
//         fetchOthers();
//       }, 1000);
//     }
//   } else {
//     profilePic.style.boxShadow = "0 0 5px green";
//     logo.style.animation = "  transition: 2s ease";
//     homeSearch.style.border = "solid 1px rgba(243, 181, 181, 1)";
//     logo.style.backgroundColor = "";
//     logo.style.border = "solid 1px rgba(218, 218, 218, 0.67)";
//     header.style.background =
//       'url("/mediafiles/signupBackground1.jpg"';
//     header.style.backgroundSize = "cover";
//   }
//   header.style.animation = "header";
// });

const createPostSection = document.getElementById("createPostSection");
let overlay = document.getElementById("overlay");

const commentDrawerP = document.getElementById("commentDrawerP");
const commentListP = document.getElementById("commentListP");
const closeCommentsP = document.getElementById("closeCommentsP");
const commentHeaderP = document.getElementById("commentHeaderP");
const sendCommentP = document.getElementById("sendCommentP");
const newCommentP = document.getElementById("newCommentP");
let addBtnCont = document.getElementById("addBtnCont");
let selectedFiles = [];


function showPosts (){
   mainSection.style.display = "none";
  postsSection.style.display = "flex";
  createPostSection.style.display = "none";
  championsSection.style.display = "none";
  addBtnCont.style.display = "none";
  atTopsets();
  filters.style.display = 'none';
  headerMenu.style.top = "100px";
}

function showChampions(){
mainSection.style.display = "none";
  postsSection.style.display = "none";
  createPostSection.style.display = "none";
  championsSection.style.display = "block";
  filters.style.display = 'none';
  headerMenu.style.top = "100px";
  filters.style.display = 'none';
  headerMenu.style.top = "100px";
}
function showCreatePosts(){
  createPostSection.style.display = "block";
  mainSection.style.display = "none";
  postsSection.style.display = "none";
  championsSection.style.display = "none";
  filters.style.display = 'none';
  headerMenu.style.top = "100px";
}
function showPeople (){
  mainSection.style.display = "grid";
  postsSection.style.display = "none";
  createPostSection.style.display = "none";
  championsSection.style.display = "none";
  addBtnCont.style.display = "none";
  filters.style.display = 'flex';
  headerMenu.style.top = "180px";
}

champsBtn.addEventListener("click", () => {
  openNav();
  showChampions();
});

const postsExamples = [
  {
    fromName: "Amani",
    fromPic: "/mediafiles/autumn-7517221_1920.jpg",
    imageorVid: "/mediafiles/darkgirl.jpg",
    description:
      "Hey everyone! Check out this awesome view I captured during my trip.",
    date: "3d ago",
  },
  {
    fromName: "Sara",
    fromPic: "/mediafiles/autumn-7517221_1920.jpg",
    imageorVid: "/mediafiles/roseFlower.jpg",
    description:
      "Just finished reading this amazing book, totally recommend it to everyone!",
    date: "1d ago",
  },
];

function timeAgo(postDate) {
  const now = new Date();
  const past = new Date(postDate);
  const diff = now - past;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  if (months < 12) return `${months}m ago`;
  return `${years}y ago`;
}

const postsContainer = document.querySelector(".POSTS-CONTENT");
function attachLikeListeners(post) {
  const btn = post.querySelector(".like-btn");
  const hypeText = post.querySelector(".hypeText");
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      const postId = this.dataset.postId;
      const countEl = this.querySelector(".pLikesCount");
      const currentUser = JSON.parse(localStorage.getItem("mainUser")); //fake holder

      if(hypeText.innerText == "LIKED"){
        hypeText.innerHTML = "LIKE";
      } else {
        hypeText.innerHTML = "LIKED";
      }
      const likedImg = this.querySelector(".truelikedImg");
      const falseImg = this.querySelector(".falselikedImg");
      if (likedImg.classList.contains("hidden")) {
        audioClick.play();
        btn.classList.toggle("liked");
      } else {
        audioUnClick.play();
        btn.classList.toggle("liked");
      }

      likedImg.classList.toggle("hidden");
      falseImg.classList.toggle("hidden");

      try {
        const response = await fetch(`/posts/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currentUser || null }),
        });

        const data = await response.json();
        countEl.textContent = data.likesCount;
      } catch (err) {
        console.error(error)
      }
    });
  
}


function attachShareListeners(post) {
  const button = post.querySelector(".share-btn");
  if (!button) return;

  button.addEventListener("click", async function (e) {
    e.preventDefault();

    const postUrl = this.dataset.postUrl;
    const shareTitle = "Check out this post on MMUN!";
    const shareText = "Someone shared something interesting on MMUN...";

    // 🚀 1. MMUN Android App (Native Bridge - Best Experience)
    // This triggers the Android select contact / share sheet instantly
    if (window.AndroidInterface && window.AndroidInterface.shareContent) {
      window.AndroidInterface.shareContent(shareTitle, postUrl);
      return;
    }

    // 🌐 2. Browser Web Share API (Standard Mobile Fallback)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: postUrl,
        });
        return; // Success
      } catch (err) {
        // If user didn't just cancel, proceed to copy fallback
        if (err.name !== "AbortError") {
          console.warn("Web Share failed:", err);
        } else {
          return; // User clicked 'cancel', stop here
        }
      }
    }

    // 📋 3. Final Fallback: Copy link to clipboard
    // Runs if not in app, not on a share-supported browser, or sharing failed
    if (typeof fallbackCopyLink === "function") {
      fallbackCopyLink(postUrl);
    } else {
      navigator.clipboard.writeText(postUrl);
    }
  });
}

function attachCommentLikeListeners(btnId) {
  const btnClicked = document.getElementById(`${btnId}`)
  if(!btnClicked){
    return
  }
  btnClicked.addEventListener("click", async function () {
      const commentId = this.dataset.commentId;
      const countEl = this.querySelector(".like-count");
      const svg = this.querySelector("svg");
      const currentUser = JSON.parse(localStorage.getItem("mainUser")) || "";

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
          body: JSON.stringify({ username: currentUser || null }),
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
}

function fallbackCopyLink(url) {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      // Show nice feedback
      const originalText = event.target.innerHTML;
      event.target.innerHTML = "Link Copied! ✓";
      event.target.style.color = "#4CAF50";

      setTimeout(() => {
        event.target.innerHTML = originalText;
        event.target.style.color = "";
      }, 2000);

    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}

function attachMoreMenuListeners(post) {
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".more-wrapper")) {
      document.querySelectorAll(".more-menu").forEach((menu) => {
        menu.style.display = "none";
      });
    }
  });

  const btn = post.querySelector(".more-btn");
  if (btn) {
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
  }

  const saveBtn = post.querySelector(".save-post-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function (e) {
      e.stopPropagation();

      const menu = this.closest(".more-menu");
      const postId = menu.dataset.postId;

      menu.style.display = "none";

      showSaveToast();
    });
  }
}

function openClickedUser(el, username) {
  let form = el.querySelector("form");
  if (!form) {
    form = document.createElement("form");
    form.method = "POST";
    form.action = "/user";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "username";
    input.value = username;

    form.appendChild(input);
    el.appendChild(form);
  }

  // store data
  localStorage.setItem("forUsClicked", username);
  localStorage.setItem("pointerdown", username);

  // submit immediately (no extra click needed)
  setTimeout(() => {
    form.submit();
  }, 200);
}

function showSaveToast() {
  // Remove existing toast if any
  const existing = document.querySelector(".save-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "save-toast";
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
    Post saved to My collections
  `;

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto hide after 2.5 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

async function renderPosts() {
  postsContainer.innerHTML = `<div id="postsBanner" class="nothing">
          <div class="addItem" id="1"><a href="#">
            <img src="/uploads/gallery/users.png" alt=""></a>
          </div>


          <div class="addItem" id="2">
           <a href="#"><img src="/uploads/gallery/messages.png" alt=""></a>
          </div>


          <div class="addItem" id="3"><a href="#"><Img src="/uploads/gallery/interests.png"></Img></a>
            
          </div>

          <div class="addItem" id="4">
           <a href="#"><img src="/uploads/gallery/notics.png" alt=""></a>
          </div>

          <div class="addItem" id="5">
           <a href="#"><img src="/uploads/gallery/jobs.png" alt=""></a>
          </div>

        </div>`;

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
      let hypeText =  "LIKE"
      if(postData.likedBy.includes(mainUser)){
        isLiked = true;
        hypeText = "LIKED";
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

        
const postsBanner = document.getElementById("postsBanner");
postsBanner.style.display = "flex"; /*important in hiding of the banner*/
const items = postsBanner.children;
let ItemScrollindex = 0;

setInterval(() => {
  const scrollX = items[ItemScrollindex].offsetLeft;

  postsBanner.scrollTo({
    left: scrollX,
    behavior: "smooth"
  });

  ItemScrollindex = (ItemScrollindex + 1) % items.length;
}, 3000);

    postsSection.scrollTop = 0;
  } catch (err) {
    console.error("Failed to load posts:", err);
    postsContainer.innerHTML = `<div style="color:#ff4444;padding:20px;text-align:center;">
          Failed to load posts. Please try again later.
      </div>`;
  }
}
renderPosts();


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
['click','wheel'].forEach((event)=>{
  overlay.addEventListener(event, ()=>{
    closePostComments();
  })
})
commentHeaderP.addEventListener("click",()=>{
  closePostComments();
})



function renderComments(post) {
  const postId = post.dataset.postId;

  const owner = post.querySelector(".POST-HEADER strong").textContent;
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
        const uniqueId = Date.now() + "-" + Math.random().toString(36).substring(2);

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

          <button id="${uniqueId}" class="like-comment-btn ${isLiked ? "liked" : ""}"
                  data-comment-id="${c._id}"
                  style="background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; gap:6px; color: ${isLiked ? "#ef4444" : "#64748b"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
              <path d="M7 11v9m-4-9v9h4m4-9v9m-4-9h4m-4 0v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4m-4 5h4"/>
            </svg>
            <span class="like-count">${c.likesCount || 0}</span>
          </button>
        `;

        commentListP.appendChild(div);
        attachCommentLikeListeners(uniqueId);
      });
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

const postText = document.getElementById("postText");
const postMedia = document.getElementById("postMedia");
const mediaPreview = document.getElementById("mediaPreview");
const mediaWrapper = document.getElementById("mediaWrapper");
const submitPost = document.getElementById("publishPost");

const addPostBtn = document.getElementById("addPostBtn");
const cancelCreatePost = document.getElementById("cancelCreatePost");

addPostBtn.addEventListener("click", () => {
  openNav();
  showCreatePosts();
});

cancelCreatePost.addEventListener("click", () => {
  createPostSection.style.display = "none";
  mainSection.style.display = "grid";
});

function renderMediaPreview() {
  mediaWrapper.innerHTML = "";
  mediaPreview.classList.remove("hidden");

  const count = selectedFiles.length;

  mediaWrapper.className = "";
  if (count === 1) mediaWrapper.classList.add("one");
  else if (count === 2) mediaWrapper.classList.add("two");
  else if (count === 3) mediaWrapper.classList.add("three");
  else mediaWrapper.classList.add("four");
  if (count > 4) mediaWrapper.classList.add("more");

  selectedFiles.slice(0, 4).forEach((file, index) => {
    const url = URL.createObjectURL(file);
    let media;

    if (file.type.startsWith("video")) {
      media = document.createElement("video");
      media.src = url;
      media.duration = media.duration;
      media.muted = true;
      media.play();
      media.loop = true;
      media.addEventListener("click",()=>{
        media.play();
      })
    } else {
      media = document.createElement("img");
      media.src = url;
    }

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.height = "150px";

    if (index === 3 && count > 4) {
      const overlay = document.createElement("div");
      overlay.className = "overlay-count";
      overlay.textContent = `+${count - 4}`;
      wrapper.appendChild(overlay);
    }

    wrapper.appendChild(media);
    mediaWrapper.appendChild(wrapper);
  });
}

function checkPostReady() {
  submitPost.disabled = !(
    postText.value.trim() || mediaWrapper.children.length
  );
}

postText.addEventListener("input", checkPostReady);

postMedia.addEventListener("change", () => {
  const files = Array.from(postMedia.files);
  if (!files.length) return;

  files.forEach((file) => {
    if (
      !selectedFiles.some((f) => f.name === file.name && f.size === file.size)
    ) {
      selectedFiles.push(file);
    }
  });

 renderMediaPreview();

  mediaBtn.classList.add("active");
  mediaBtn.innerHTML = "Add More Photos 🧐";
  postMedia.value = "";
  checkPostReady();
});

if (!submitPost) {
  console.error("publishPost button not found - check ID");
} else {
const submitPost = document.getElementById("publishPost");

if (!submitPost) {
  console.error("publishPost button not found!");
} else {
  // Function to attach the click handler (we'll reuse this)
  const attachUploadHandler = () => {
    submitPost.onclick = function () {
      if (!postText?.value?.trim() && (!selectedFiles || selectedFiles.length === 0)) {
        alert("Add text or media first!");
        return;
      }

      // IMPORTANT: Remove the event listener immediately to prevent double-click
      submitPost.onclick = null;  // ← blocks any further clicks

      // Show overlay
      const overlay = document.getElementById("uploadProgressOverlay");
      const progressBar = document.getElementById("uploadProgressBar");
      const percentText = document.getElementById("uploadPercent");
      const progressText = document.getElementById("progress-text");

      if (overlay) {
        overlay.style.display = "flex";
        if (progressBar) progressBar.style.width = "0%";
        if (percentText) percentText.textContent = "0%";
      }

      submitPost.disabled = true;
      submitPost.textContent = "Uploading....";

      const formData = new FormData();
      formData.append("description", postText.value.trim());

      selectedFiles.forEach(file => formData.append("media[]", file));

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/posts", true);

      xhr.upload.onprogress = event => {
        if (event.lengthComputable && progressBar && percentText) {
          let percent = Math.round((event.loaded / event.total) * 100);
          if (percent > 95) percent = 95;
          progressBar.style.width = percent + "%";
          percentText.textContent = percent + "%";
        }
      };

      xhr.upload.onload = () => {
        if (progressBar && percentText) {
          let current = 95;
          const interval = setInterval(() => {
            current += 1.2 + Math.random() * 2.5;
            if (current >= 100) {
              current = 100;
              clearInterval(interval);
              progressText.textContent = "Processing...";
            }
            progressBar.style.width = current + "%";
            percentText.textContent = Math.floor(current) + "%";
          }, 450);
        }
      };

      xhr.onload = function () {
        if (overlay) overlay.style.display = "none";
        submitPost.disabled = false;
        submitPost.textContent = "Post";

        // Re-attach the handler ONLY after upload is fully done
        attachUploadHandler();

        if (xhr.status >= 200 && xhr.status < 300) {
          renderPosts();
          sendAndroidNotification("Upload Complete!", "Your new post is now live.");
          postText.value = "";
          selectedFiles = [];
          mediaWrapper.innerHTML = "";
          mediaPreview.classList.add("hidden");
          document.getElementById("mediaBtn")?.classList.remove("active");
          submitPost.disabled = true; // your original disable-on-success

          createPostSection.style.display = "none";
          postsSection.style.display = "flex";
          mainSection.style.display = "none";
        } else {
          alert(`Post failed - Server status: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        if (overlay) overlay.style.display = "none";
        submitPost.disabled = false;
        submitPost.textContent = "Post";
        attachUploadHandler(); // re-attach on error
        alert("Network error.");
      };

      xhr.ontimeout = () => {
        if (overlay) overlay.style.display = "none";
        submitPost.disabled = false;
        submitPost.textContent = "Post";
        attachUploadHandler(); // re-attach on timeout
        alert("Upload timed out.");
      };

      xhr.timeout = 120000;
      xhr.send(formData);
    };
  };

  // Attach the handler initially
  attachUploadHandler();
}
}

const tbody = document.querySelector("#championsTable tbody");
function getBarColor(rating) {
  if (rating > 70) return "green";
  if (rating > 40) return "orange";
  if (rating > 18) return "yellow";
  return "red";
}
async function renderChampions() {
  tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

  try {
    const res = await fetch("/champions/data");
    if (!res.ok) throw new Error("Failed to fetch champions data");

    const data = await res.json();
    let champions = data.champions;

    if (!champions || !champions.length) {
      tbody.innerHTML = "<tr><td colspan='3'>No champions available</td></tr>";
      return;
    }

    champions = champions.map((player) => {
      const original = player.rating || player.viewsCount || 0;
      return {
        ...player,
        originalRating: original,
        sortRating: original,
      };
    });

    const groups = {};
    champions.forEach((p) => {
      const key = p.originalRating;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    Object.values(groups).forEach((group) => {
      if (group.length >= 2) {
        group.forEach((player) => {
          const penalty = Math.floor(Math.random() * 4) + 1;
          player.sortRating = Math.max(0, player.originalRating - penalty);
        });
      }
    });

    champions.sort((a, b) => {
      if (b.sortRating !== a.sortRating) {
        return b.sortRating - a.sortRating;
      }
      return a.username.localeCompare(b.username);
    });

    tbody.innerHTML = "";

    champions.forEach((player, index) => {
      const shownRating = player.originalRating;
      const barColor = getBarColor(shownRating);

      const row = document.createElement("tr");
      row.className = "champUser";
      row.addEventListener('click',()=>{
       visitUser(`${player.username || player.name}`,row)
      })
      row.innerHTML = `
        <td style="width: 15%">${index + 1}</td>
        <td>${player.username || player.name}</td>
        <td style="display: flex;flex-direction: column; align-items: end; padding-right: 20px">
          ${shownRating}
          <div class="bar">
            <div class="bar-fill ${barColor}"
                 style="width:${shownRating}%"></div>
          </div>
        </td>
      `;

      if (index === 0) row.classList.add("gold");
      if (index === 1) row.classList.add("silver");
      if (index === 2) row.classList.add("bronze");

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to fetch champions:", err);
    tbody.innerHTML = "<tr><td colspan='3'>Failed to load champions</td></tr>";
  }
}


renderChampions();
const countdownEl = document.getElementById("countdown");
const now = new Date();

const year = now.getFullYear();
const month = now.getMonth();

const lastDayOfMonth = new Date(year, month + 1, 0);

lastDayOfMonth.setHours(23, 59, 59, 999);

const endTime = lastDayOfMonth.getTime();


  const hiderBtn = document.getElementById("btnsHider");

  const menuItems = [
    document.getElementById("addBtnCont"),
    document.getElementById("champsBtnCont"),
  ];

  menuItems.forEach((item) => {
    item.style.display = "none";
    item.classList.remove("show");
  });

  let menuOpen = false;

  hiderBtn.addEventListener("click", () => {
  openNav();
  });
  function openNav (skip=false){
      menuOpen = !menuOpen;
      if (postsBanner.style.display === "flex") {
          postsBanner.style.display = "none";
          headerMenu.style.width = "95%";
          postsSection.style.paddingTop = "141px";
          filters.style.display = 'none';
          headerMenu.style.top = "100px";
          } else {
          postsSection.style.paddingTop = "89px";
          postsBanner.style.display = "flex";
          postsBanner.style.opacity = 0;
          headerMenu.style.width = "auto";
          postsBanner.style.opacity = 1;
          filters.style.display = 'flex';
          headerMenu.style.top = "180px";
          }
    menuItems.forEach((item, index) => {
      if (menuOpen) {
        item.style.display = "flex";
        item.classList.add("show");
      } else {
        item.classList.remove("show");
        item.style.display = "none";
      }
    });
  };
  function visitUser(data,Object){ //also equals openUser
    let form = document.createElement("form");
    form.method = "POST";
    form.action = "/user";

    let input = document.createElement("input");
    input.type = "hidden";
    input.name = "username";
    input.value = data;
    form.appendChild(input);
    Object.appendChild(form);
    form.submit();
};

window.onFcmTokenReceived = async function(token) {
    try {
        await fetch("/fcmTokenUpdater", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
        });
    } catch (error) {
        console.error("Failed to update FCM token:", error);
    }
};

if (window.AndroidInterface && window.AndroidInterface.requestFcmToken) {
    window.AndroidInterface.requestFcmToken();
} else {
    console.log("MMUN bridge not detected. User is on a web browser.");
}