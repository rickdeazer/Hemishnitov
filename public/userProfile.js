const followersElement=document.getElementById("followersCount"),mainUserDiv=document.getElementById("profName"),mainUser=mainUserDiv.innerText,audioClick=document.getElementById("click"),audioUnClick=document.getElementById("unClick"),blogTitle=document.querySelector(".blogTitle");blogTitle.addEventListener("click",()=>{blogChanger()});function attachLikeListeners(){document.querySelectorAll(".like-btn").forEach(t=>{const o=t.cloneNode(!0);t.parentNode.replaceChild(o,t)}),document.querySelectorAll(".like-btn").forEach(t=>{t.addEventListener("click",async function(o){o.preventDefault();const e=this.dataset.postId,s=this.querySelector(".pLikesCount"),n=this.querySelector("svg"),a=JSON.parse(localStorage.getItem("mainUser")),i=t.querySelector(".truelikedImg"),l=t.querySelector(".falselikedImg");if(!a){alert("Please log in to like posts");return}const r=this.classList.contains("liked"),c=!r;let u=parseInt(s.textContent)+(c?1:-1);s.textContent=u;try{const d=await fetch(`/posts/${e}/like`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:a})});if(!d.ok)throw new Error(`Server responded with ${d.status}`);const m=await d.json();s.textContent=m.likesCount}catch(d){console.error("Like failed:",d),s.textContent=parseInt(s.textContent)+(r?1:-1),console.log("Couldn't update like. Please try again.")}i.classList.contains("hidden")?audioClick.play():audioUnClick.play(),i.classList.toggle("hidden"),l.classList.toggle("hidden")})})}function attachShareListeners(){document.querySelectorAll(".share-btn").forEach(t=>{t.addEventListener("click",async function(o){o.preventDefault();const e=this.dataset.postUrl,s=this.dataset.postId;async function n(a){const i="Check out this post!",l="Someone shared something interesting on the platform...";if(window.AndroidInterface&&window.AndroidInterface.shareContent)try{window.AndroidInterface.shareContent(i,a),console.log("Shared via MMUN Native Bridge");return}catch(r){console.error("Native share bridge failed:",r)}if(navigator.share)try{await navigator.share({title:i,text:l,url:a}),console.log("Shared successfully via Web Share API")}catch(r){r.name!=="AbortError"&&(console.warn("Web Share failed:",r),fallbackCopyLink(a))}else fallbackCopyLink(a)}})})}function attachMoreMenuListeners(){document.addEventListener("click",function(t){t.target.closest(".more-wrapper")||document.querySelectorAll(".more-menu").forEach(o=>{o.style.display="none"})}),document.querySelectorAll(".more-btn").forEach(t=>{t.addEventListener("click",function(o){o.stopPropagation(),document.querySelectorAll(".more-menu").forEach(n=>{n!==this.nextElementSibling&&(n.style.display="none")});const e=this.nextElementSibling;e.style.display=e.style.display==="block"?"none":"block";const s=this.getBoundingClientRect();e.style.right="0",e.style.top="30px"})}),document.querySelectorAll(".save-post-btn").forEach(t=>{t.addEventListener("click",function(o){o.stopPropagation();const e=this.closest(".more-menu").dataset.postId;this.closest(".more-menu").style.display="none",showSaveToast()})})}function attachCommentLikeListeners(){document.querySelectorAll(".like-comment-btn").forEach(t=>{const o=t.cloneNode(!0);t.parentNode.replaceChild(o,t)}),document.querySelectorAll(".like-comment-btn").forEach(t=>{t.addEventListener("click",async function(){const o=this.dataset.commentId,e=this.querySelector(".like-count"),s=this.querySelector("svg"),n=JSON.parse(localStorage.getItem("mainUser"));if(!n){alert("Login to like comments");return}const a=this.classList.contains("liked"),i=!a;this.classList.toggle("liked",i),this.style.color=i?"#ef4444":"#64748b",s.setAttribute("fill",i?"currentColor":"none");let l=parseInt(e.textContent)+(i?1:-1);e.textContent=l;try{const r=await fetch(`/comments/${o}/like`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:n})});if(!r.ok)throw new Error("Failed");const c=await r.json();this.classList.toggle("liked",c.liked),this.style.color=c.liked?"#ef4444":"#64748b",s.setAttribute("fill",c.liked?"currentColor":"none"),e.textContent=c.likesCount}catch(r){console.error(r),this.classList.toggle("liked",a),this.style.color=a?"#ef4444":"#64748b",s.setAttribute("fill",a?"currentColor":"none"),e.textContent=parseInt(e.textContent)+(a?1:-1)}})})}async function updateFollowers(){try{const t=await fetch("/followersCount");if(!t.ok)return;const o=await t.json();followersElement&&o?.followersCount!=null&&(followersElement.innerHTML=`<br>${o.followersCount.toLocaleString()}`)}catch(t){console.log("\u2192 followers update failed",t)}}updateFollowers(),setInterval(updateFollowers,3e4);const postsContainer=document.querySelector(".POSTS-CONTENT"),postsSection=document.getElementById("postsSection");function timeAgo(t){const o=new Date,e=new Date(t),s=o-e,n=Math.floor(s/1e3),a=Math.floor(n/60),i=Math.floor(a/60),l=Math.floor(i/24),r=Math.floor(l/7);return n<60?"just now":a<60?`${a}m ago`:i<24?`${i}h ago`:l<7?`${l}d ago`:r<5?`${r}w ago`:`${Math.floor(l/30)}m ago`}async function renderPosts(){try{const t=await fetch("/posts/data/false");if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);const o=await t.json();o.sort((e,s)=>{const n=new Date(e.date||e.createdAt||0);return new Date(s.date||s.createdAt||0)-n});for(const e of o){const s=document.createElement("div");s.classList.add("POST-ITEM");const n=e._id;s.dataset.postId=n;let a=0;try{const m=await fetch("/obtain/commentsP",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId:n})});if(m.ok){const h=await m.json(),p=h.commentsData||h.comments||h.data||[];a=Array.isArray(p)?p.length:0}}catch(m){console.warn(`Failed to load comments count for post ${n}`,m)}let i=[];Array.isArray(e.mediaLinks)?i=e.mediaLinks.filter(Boolean):typeof e.mediaLinks=="string"&&e.mediaLinks.trim()?i=[e.mediaLinks.trim()]:Array.isArray(e.mediaLink)?i=e.mediaLink.filter(Boolean):typeof e.mediaLink=="string"&&e.mediaLink.trim()&&(i=[e.mediaLink.trim()]);let l="";const r=i.length;if(r>0){const m=i.slice(0,4),h=r-4;let p=!1;i.length==1&&(p=!0),l=`
          <div ${r>2?`style="background-image: url('${i[i.length-1]}'); background-size: cover; background-position: center;"`:""} class="fb-media media-${Math.min(r,4)}">
            ${m.map((g,f)=>{const y=f===3&&h>0,v=g.match(/\.(mp4|webm|ogg)$/i)?"video-1":"video-n";return`
                  <div class="media-box ${p?`borderNone ${v}`:""} ${y?"dark":""}">
                    ${g.match(/\.(mp4|webm|ogg)$/i)?`<div id="loaderC" class="loads">
                <div class="loadB"></div>
              </div> <video class='${p?"oneMedia":"notOneMedia"}' src="${g}" playsinline preload="metadata" loop data-index="${f}" onclick="${p}? pauserPlayer(this) : openMediaViewer(this,${p})" style="width:100%; height:100%; object-fit:cover;"></video>`:`<img src="${g}" data-index="${f}" data-full="true" alt="Post media ${f+1}" onclick="openMediaViewer(this)" loading="lazy"/>`}
                    ${y?`<div class="media-overlay">+${h}</div>`:""}
                  </div>
                `}).join("")}
          </div>
        `}const c=e.likes??e.likesCount??0;let u=!1,d="LIKE";e.likedBy.includes(mainUser)&&(u=!0,d="LIKES"),s.innerHTML=`
        <div class="POST-HEADER" onclick="visitUser('${e.fromName}',this)"
             style="display:flex;align-items:center;padding:10px 15px;">
          <img class="profileImg" src="${e.fromPic||"/default-avatar.png"}" alt="${e.fromName||"User"}">
          <div>
            <strong>${e.fromName||"Unknown"}</strong><br>
            <small style="color:#aaa;">${e.date||e.createdAt?timeAgo(e.date||e.createdAt):"Just now"}</small>
          </div>
        </div>
    
        <div class="POST-DESCRIPTION">
          <p class="desc-text ${e.description?"":"hidden"}">${e.description||""}</p>
          <span class="see-more">See more</span>
        </div>
    
        <div class="POST-MEDIA">
          ${l}
          <div class="media-viewer hidden">
            <span class="nav left" onclick="navigateMedia(-1)">\u276E</span>
            <img class="viewer-img" alt="Full screen media" />
            <span class="nav right" onclick="navigateMedia(1)">\u276F</span>
            <span class="close-viewer" onclick="closeMediaViewer()">\u2715</span>
          </div>
        </div>
    
        <div class="POST-ACTIONS";">
                  <button onClick="" class="like-btn ${u?"liked":""}"
                          data-post-id="${n}"
                          data-liked="${u}"
                          style="display:flex; align-items:center; gap:5px;">
                          
                          <img class="truelikedImg ${u?"":"hidden"}" src="/Assets/liked.png"/>
                          
                          <img class="falselikedImg ${u?"hidden":""}" src="/Assets/unliked.png"/>
                          </svg> 

                      <span class="hypeText">${d}</span><span class="pLikesCount" style="padding-right: 3px">${c}</span>
                  </button>
    
          <button class="comment-btn" style="display:flex;align-items:center;gap:5px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"></path>
            </svg>
            Insights <span class="comment-count">${a}</span>
          </button>

          <button class="share-btn" data-post-id="${n}" data-post-url="${window.location.origin}/post/${n}" title="Share this post" style="display:flex;align-items:center;gap:5px;border:none;background:none;cursor:pointer;padding:5px;">
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
            <button class="more-btn" data-post-id="${n}" style="font-size:18px;background:none;border:none;color:#aaa;cursor:pointer;padding:0 8px;">\u2022\u2022\u2022</button>
            <div class="more-menu" data-post-id="${n}">
              <div class="more-menu-item save-post-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                Save post
              </div>
            </div>
          </div>
        </div>
      `,observeThis(s),postsContainer.appendChild(s),attachLikeListeners(s),attachShareListeners(s),attachMoreMenuListeners(s)}}catch(t){console.error("Failed to load posts:",t),postsContainer.innerHTML=`<div style="color:#ff4444;padding:20px;text-align:center;">
          Failed to load posts. Please try again later.
      </div>`}}renderPosts(),postsContainer.addEventListener("click",t=>{const o=t.target.closest(".comment-btn");if(!o)return;const e=o.closest(".POST-ITEM");commentDrawerP.dataset.activePostId=e.dataset.postId,renderComments(e),commentDrawerP.classList.add("show"),overlay.style.display="block",document.body.style.overflow="hidden"});const closePostComments=()=>{commentDrawerP.classList.remove("show"),overlay.style.display="none",document.body.style.overflow="auto"};closeCommentsP.addEventListener("click",()=>{closePostComments()}),commentHeaderP.addEventListener("click",()=>{closePostComments()});function exit(){localStorage.getItem("editAuthBeacon")||null?(window.location.href="/home",localStorage.removeItem("editAuthBeacon")):window.history.back()}function renderComments(t){const o=t.dataset.postId;commentListP.innerHTML="",fetch("/obtain/commentsP",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId:o})}).then(e=>e.json()).then(e=>{e.commentsData.forEach(n=>{const a=document.createElement("div");a.classList.add("comment-item"),a.style.cssText=`
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          padding: 8px 12px;
        `;const i=!!n.hasLiked;a.innerHTML=`
          <div class="comment-pic" style="
            width: 36px; height: 36px; border-radius: 50%;
            background: #3b82f6; color: white;
            display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 16px;
          ">
            ${n.from[0].toUpperCase()}
          </div>

          <div style="flex: 1;">
            <strong>${n.from}</strong>
            <div style="margin-top: 2px;">${n.comment}</div>
            <small style="color: #888; font-size: 12px;">
              ${new Date(n.time).toLocaleString([],{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}
            </small>
          </div>

          <button class="like-comment-btn ${i?"liked":""}"
                  data-comment-id="${n._id}"
                  style="background:none; border:none; cursor:pointer; padding:6px; display:flex; align-items:center; gap:6px; color: ${i?"#ef4444":"#64748b"}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${i?"currentColor":"none"}" stroke="currentColor" stroke-width="2">
              <path d="M7 11v9m-4-9v9h4m4-9v9m-4-9h4m-4 0v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4m-4 5h4"/>
            </svg>
            <span class="like-count">${n.likesCount||0}</span>
          </button>
        `,commentListP.appendChild(a)}),attachCommentLikeListeners()})}sendCommentP.addEventListener("click",async()=>{const t=newCommentP.value.trim();if(!t)return;const o=commentDrawerP.dataset.activePostId,e=document.querySelector(`.POST-ITEM[data-post-id="${o}"] .POST-HEADER strong`).textContent,s=JSON.parse(localStorage.getItem("mainUser"));try{if(!(await fetch("/post/commentsP",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({postId:o,from:s,to:e,comment:t,time:new Date})})).ok)throw new Error("Failed to post comment");newCommentP.value="",renderComments(document.querySelector(`.POST-ITEM[data-post-id="${o}"]`)),commentListP.scrollTop=commentListP.scrollHeight}catch(n){console.error(n),alert("Error posting comment.")}});const logOut=document.querySelector(".log-out");logOut.addEventListener("click",()=>{localStorage.clear(),window.location.href="/logout"});const showTonnerDiv=document.getElementById("showTonner"),Handle=document.getElementById("Handle");function showTonner(t){t.slice(0,2)=="no"?(showTonnerDiv.innerHTML=t,showTonnerDiv.style.display="flex"):(Handle.innerText=t,showTonnerDiv.style.display="flex"),setTimeout(()=>{showTonnerDiv.style.display="none"},1e3)}
