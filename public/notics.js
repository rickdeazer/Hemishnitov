"use strict";async function _post(s,c={}){const r=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)});if(!r.ok)throw new Error(`POST ${s} \u2192 ${r.status}`);return r.json()}async function _del(s){const c=await fetch(s,{method:"DELETE"});if(!c.ok)throw new Error(`DELETE ${s} \u2192 ${c.status}`);return c.json()}function _makeModal(s,c){let r=document.getElementById(s);return r||(r=document.createElement("div"),r.id=s,r.style.cssText="display:none; position:fixed; inset:0; z-index:10000;align-items:center; justify-content:center;background:rgba(8,2,12,0.94);",r.innerHTML=c,document.body.appendChild(r)),r}function _showModal(s){const c=document.getElementById(s);c&&(c.style.display="flex")}function _hideModal(s){const c=document.getElementById(s);c&&(c.style.display="none")}const Notics=(()=>{function s(m,b){Arenas.viewArena(m,b)}function c(m,b){alert(`Viewing friend request from: ${b}`)}function r(m,b){Arenas.viewArena(m,b)}async function h(m,b){m.disabled=!0;try{await _post(`/follow/${b}`),m.textContent="Following"}catch{alert("Could not follow back.")}finally{m.disabled=!1}}function f(){}return{viewArena:s,viewFriendRequest:c,viewEvent:r,followBack:h,init:f}})(),Arenas=(()=>{async function s(l,p){try{const a=await fetch(`/arenas/${p}`);if(!a.ok)throw new Error("Failed to fetch arena details.");const d=await a.json(),g=`
        <div class="arena-modal">
          <div class="modal-content" style="max-width:480px;">
            <div class="modal-header">
              <div class="modal-title">\u{1F3DF}\uFE0F ${d.title}</div>
              <button class="close-btn" onclick="Arenas.closeArenaModal()">\u2715</button>
            </div>
            <div class="modal-body">
              <p>${d.description}</p>
              <p><strong>Attendees:</strong> <span class="attendee-count">${d.attendees}</span></p>
              <p><strong>Inspired:</strong> <span class="inspire-count">${d.inspired}</span></p>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" onclick="Arenas.closeArenaModal()">Close</button>
              <button class="btn-action" onclick="Arenas.joinArena(this, '${d._id}')">Join Arena</button>
              <button class="btn-action${d.userInspired?" inspired":""}"
                      onclick="Arenas.toggleInspire(this, '${d._id}')">
                ${d.userInspired?"Inspired":"Inspire"}
              </button>
            </div>
          </div>
        </div>`;_makeModal("arena-view-modal",g),_showModal("arena-view-modal")}catch(a){alert(a.message)}}function c(){_hideModal("arena-view-modal")}async function r(l,p){l.disabled=!0;try{await _post(`/arenas/${p}/join`);const a=document.querySelector(".arena-modal .attendee-count");a&&(a.textContent=parseInt(a.textContent)+1),l.textContent="Joined!"}catch{alert("Could not join arena."),l.disabled=!1}}async function h(l,p){const a=l.classList.contains("inspired");try{a?await _del(`/arenas/${p}/inspire`):await _post(`/arenas/${p}/inspire`),l.classList.toggle("inspired"),l.textContent=a?"Inspire":"Inspired";const d=document.querySelector(".arena-modal .inspire-count");d&&(d.textContent=parseInt(d.textContent)+(a?-1:1))}catch{alert("Failed to toggle inspire.")}}function f(){_makeModal("arena-post-modal",`
      <div class="arena-modal small-popup">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">\u{1F3DF}\uFE0F Post New Arena</div>
            <button class="close-btn" onclick="Arenas.closePostModal()">\u2715</button>
          </div>
          <div class="modal-body">
            <input type="text" id="arena-title" placeholder="Arena Title"
                   style="width:100%; padding:10px; margin-bottom:10px;">
            <textarea id="arena-desc" rows="4" placeholder="Description\u2026"
                      style="width:100%; padding:10px;"></textarea>
            <div id="arena-error" style="color:red; display:none; margin-top:10px;"></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" onclick="Arenas.closePostModal()">Cancel</button>
            <button class="btn-action" onclick="Arenas.submitArena()">Post Arena</button>
          </div>
        </div>
      </div>`),_showModal("arena-post-modal")}function m(){_hideModal("arena-post-modal")}async function b(){const l=document.getElementById("arena-title").value.trim(),p=document.getElementById("arena-desc").value.trim(),a=document.getElementById("arena-error"),d=document.querySelector("#arena-post-modal .btn-action");if(a.style.display="none",!l){a.textContent="Title is required.",a.style.display="block";return}if(!p){a.textContent="Description is required.",a.style.display="block";return}d.disabled=!0,d.textContent="Posting\u2026";try{if(!(await _post("/arenas",{title:l,description:p}))._id)throw new Error("Arena not created.");m(),Nounces.showToast("Arena posted successfully!","success")}catch(g){a.textContent=g.message,a.style.display="block",d.disabled=!1,d.textContent="Post Arena"}}function k(){const l=document.querySelector(".btn-post-arena");l&&!l.dataset.wired&&(l.addEventListener("click",f),l.dataset.wired="true")}return{viewArena:s,closeArenaModal:c,joinArena:r,toggleInspire:h,openPostModal:f,closePostModal:m,submitArena:b,init:k}})(),Nounces=(()=>{function s(e,t="info"){const n=document.createElement("div");n.className=`toast toast-${t}`,n.textContent=e,document.body.appendChild(n),setTimeout(()=>n.classList.add("visible"),10),setTimeout(()=>n.remove(),3e3)}async function c(e){const t=e.dataset.announcementId;if(!t)return;const n=e.classList.contains("kept");e.disabled=!0;try{n?(await _del(`/announcements/${t}/keep`),e.classList.remove("kept"),e.textContent="Keep"):(await _post(`/announcements/${t}/keep`),e.classList.add("kept"),e.textContent="Kept")}catch{alert("Could not update keep status.")}finally{e.disabled=!1}}function r(){h()}function h(){_makeModal("announce-modal",`
      <div class="announce-modal small-popup">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">\u{1F4E2} New Announcement</div>
            <button class="close-btn" onclick="Nounces.closeAnnounceModal()">\u2715</button>
          </div>
          <div class="modal-body">
            <input type="text" id="ann-title" placeholder="Announcement title" maxlength="100">
            <textarea id="ann-body" rows="5" placeholder="Write your announcement here\u2026"></textarea>
            <div class="ends-on">
              <label>Ends on</label>
              <input type="datetime-local" id="ann-ends">
            </div>
            <label class="custom-file-btn">
              \u{1F4CE} Attach image (optional)
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
            <button class="btn-post-announce" onclick="Nounces.submitAnnouncement()">\u{1F4E2} Post</button>
          </div>
        </div>
      </div>`),_showModal("announce-modal")}function f(){_hideModal("announce-modal")}function m(){const e=document.getElementById("ann-image"),t=document.getElementById("ann-preview"),n=document.getElementById("ann-preview-img");if(!e||!t||!n)return;const o=e.files[0];if(o){const i=new FileReader;i.onload=u=>{n.src=u.target.result,t.style.display="block"},i.readAsDataURL(o)}else t.style.display="none",n.src=""}function b(){const e=document.getElementById("ann-image"),t=document.getElementById("ann-preview"),n=document.getElementById("ann-preview-img");!e||!t||!n||(e.value="",t.style.display="none",n.src="")}async function k(){const e=document.getElementById("ann-title").value.trim(),t=document.getElementById("ann-body").value.trim(),n=document.getElementById("ann-ends").value,o=document.getElementById("ann-image").files[0],i=document.getElementById("ann-error"),u=document.querySelector(".btn-post-announce");if(i.style.display="none",!t){i.textContent="Announcement text cannot be empty.",i.style.display="block";return}u.disabled=!0,u.textContent="Posting\u2026";try{const y=new FormData;y.append("title",e),y.append("body",t),y.append("endsAt",n),o&&y.append("image",o);const v=await fetch("/announcements",{method:"POST",body:y});if(!v.ok){const C=await v.json();throw new Error(C.error||"Failed to post.")}const w=await v.json();f(),l(w),s("Announcement posted successfully!","success")}catch(y){console.error("Submit Announcement Error:",y),i.textContent=`Could not post announcement: ${y.message}`,i.style.display="block"}finally{u.disabled=!1,u.textContent="\u{1F4E2} Post"}}function l(e){const t=document.getElementById("announcements-feed");if(!t)return;const n=document.createElement("div");n.className="announcement-post",n.dataset.announcementId=e._id,n.innerHTML=`
      <div class="announcement-header">
        <div class="announcement-profile"
             style="background-image:url('${e.author.profileLink||"/mediafiles/defaultProfile.png"}');"></div>
        <div>
          <div class="announcement-username">${e.author.username}</div>
          <div class="announcement-time">Posted just now</div>
        </div>
      </div>
      <div class="announcement-body">
        ${e.title?`<h3 style="font-weight:bold;font-size:1.2rem;margin-bottom:8px;
                        color:var(--accent-magenta);">${e.title}</h3>`:""}
        <p style="line-height:1.6;">${e.body}</p>
        ${e.image?`<img src="${e.image}" alt="Announcement image"
                  style="max-width:100%;margin-top:10px;border-radius:8px;">`:""}
      </div>
      <div class="announcement-footer">
        <div class="end-time">
          Ends: ${e.endsAt?new Date(e.endsAt).toDateString():"N/A"}
        </div>
        <button class="keep-btn" data-announcement-id="${e._id}">Keep</button>
      </div>`;const o=n.querySelector(".keep-btn");o&&(o.onclick=function(){Nounces.toggleKeep(this)}),t.prepend(n)}function p(){_makeModal("subscribe-modal",`
      <div class="announce-modal small-popup">
        <div class="modal-content" style="max-width:380px;">
          <div class="modal-header">
            <div class="modal-title">\u{1F516} Subscribe to Announcer</div>
            <button class="close-btn" onclick="Nounces.closeSubscribeModal()">\u2715</button>
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
      </div>`),_showModal("subscribe-modal")}function a(){_hideModal("subscribe-modal")}async function d(){const e=document.getElementById("subscribe-username").value.trim(),t=document.getElementById("subscribe-error");if(t.style.display="none",!e){t.textContent="Please enter a username.",t.style.display="block";return}try{await _post("/subscribe/announcer",{username:e}),a(),s(`Successfully subscribed to ${e}!`,"success")}catch{t.textContent="Failed to subscribe. User may not exist.",t.style.display="block"}}function g(){const e=document.getElementById("announcements-feed"),t=document.getElementById("kept-view"),n=document.getElementById("timetable-view");if(!e||!t)return;e.style.display="none",n&&(n.style.display="none"),t.style.display="block",t.innerHTML="";const o=e.querySelectorAll(".announcement-post .keep-btn.kept");if(!o.length){t.innerHTML=`<div style="text-align:center;color:gray;padding:40px;">
           You haven't kept any announcements yet.
         </div>`;return}o.forEach(i=>{const u=i.closest(".announcement-post").cloneNode(!0);u.querySelector(".keep-btn").onclick=function(){Nounces.toggleKeep(this)},t.appendChild(u)})}async function x(e){const t=document.getElementById("announcements-feed"),n=document.getElementById("kept-view"),o=document.getElementById("timetable-view");if(!t||!n||!o)return;if(e&&e.classList.contains("active")){t.style.display="block",n.style.display="none",o.style.display="none",e.classList.remove("active");return}t.style.display="none",n.style.display="none",o.style.display="block",e&&e.classList.add("active"),o.innerHTML='<div class="loading-spinner">Loading Timetables\u2026</div>';const i=document.createElement("button");i.textContent="+ Add Timetable",i.className="option-btn announce-btn",i.style.cssText="margin-bottom:20px;width:100%;border-radius:12px;padding:12px;",i.onclick=()=>Nounces.openTimetableModal();try{const u=await fetch("/timetables");if(!u.ok)throw new Error("Failed to load timetables.");const y=await u.json();if(o.innerHTML="",o.appendChild(i),!y.length){o.innerHTML+=`<div style="text-align:center;color:gray;padding:40px;
                       font-family:'Lora';">No timetables found.</div>`;return}y.forEach(v=>{const w=document.createElement("div");w.className="announcement-post",w.innerHTML=`
          <div class="announcement-header">
            <div class="announcement-profile"
                 style="background-image:url('${v.author.profileLink||"/mediafiles/defaultProfile.png"}');"></div>
            <div>
              <div class="announcement-username">${v.author.username}</div>
              <div class="announcement-time">
                Posted ${new Date(v.postedDate).toDateString()}
              </div>
            </div>
          </div>
          <div class="announcement-body">
            <h3 style="font-weight:bold;font-size:1.2rem;margin-bottom:8px;
                       color:var(--accent-magenta);">${v.title}</h3>
            <p style="line-height:1.6;">${v.description}</p>
          </div>
          <div class="announcement-footer">
            <div class="end-time">
              Runs till: ${v.runsTill?new Date(v.runsTill).toDateString():"N/A"}
            </div>
          </div>`,o.appendChild(w)})}catch(u){o.innerHTML=`<div style="color:red;text-align:center;padding:40px;">
           ${u.message}
         </div>`}}function A(){_makeModal("timetable-modal",`
      <div class="announce-modal small-popup">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">\u{1F4C5} New Timetable</div>
            <button class="close-btn" onclick="Nounces.closeTimetableModal()">\u2715</button>
          </div>
          <div class="modal-body">
            <input type="text" id="tt-title" placeholder="Timetable Title">
            <textarea id="tt-desc" rows="4" placeholder="Description\u2026"></textarea>
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
      </div>`),_showModal("timetable-modal")}function E(){_hideModal("timetable-modal")}async function I(){const e=document.getElementById("tt-title").value.trim(),t=document.getElementById("tt-desc").value.trim(),n=document.getElementById("tt-runs").value,o=document.getElementById("tt-error"),i=document.querySelector("#timetable-modal .btn-post-announce");if(o.style.display="none",!e){o.textContent="Title is required.",o.style.display="block";return}i.disabled=!0,i.textContent="Posting\u2026";try{await _post("/timetables",{title:e,description:t,runsTill:n}),E(),s("Timetable posted!","success"),await x(document.querySelector(".btn-timetable"))}catch{o.textContent="Failed to post timetable.",o.style.display="block"}finally{i.disabled=!1,i.textContent="Post Timetable"}}function T(){Object.entries({".btn-kept":g,".btn-announce":r,".btn-subscribe":p,".btn-timetable":t=>x(t.currentTarget)}).forEach(([t,n])=>{const o=document.querySelector(t);o&&!o.dataset.wired&&(o.addEventListener("click",n),o.dataset.wired="true")})}return{showToast:s,toggleKeep:c,showAnnounceOptions:r,openAnnounceModal:h,closeAnnounceModal:f,handleAnnImageChange:m,removeAnnImage:b,submitAnnouncement:k,appendToFeed:l,showSubscribeModal:p,closeSubscribeModal:a,subscribeToUser:d,filterKept:g,showTimetable:x,openTimetableModal:A,closeTimetableModal:E,submitTimetable:I,init:T}})();document.addEventListener("DOMContentLoaded",()=>{Arenas.init(),Nounces.init()});
