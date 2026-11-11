// updates-facilitator.js


let  Role = 'student'
let  Year = 'first year'
let  updated = false; 

function showYearPrompt() {
  const isStaff = Role === "Lecturer" || Role === "Department Worker";

  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap');
    #yp-overlay {
      position:fixed; inset:0; z-index:999;
      display:flex; align-items:center; justify-content:center; padding:20px;
      background:rgba(0,0,0,0.55); animation:ypFade 0.2s ease;
    }
    @keyframes ypFade { from{opacity:0;} to{opacity:1;} }
    @keyframes ypUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }

    #yp-card {
      background:#fff; border-radius:20px; width:100%; max-width:400px;
      overflow:hidden; animation:ypUp 0.3s cubic-bezier(0.22,1,0.36,1);
      font-family:'Geist',sans-serif;
    }

    /* ── Top bar: green→purple gradient ── */
    #yp-top-bar {
      background: linear-gradient(135deg, #14532d 0%, #4a1d96 60%, #831843 100%);
      background-size: 300% 300%;
      animation: gradientShift 15s ease infinite;
      padding:28px 28px 24px;
    }
    @keyframes gradientShift {
      0% {}
      50%{background-position: 100% 300%}
      100% {background-position: 300% 300%}
    }
    #yp-version-badge {
      display:inline-flex; align-items:center; gap:6px;
      background:rgba(4, 33, 10, 0.51); border:1px solid rgba(255,255,255,0.18);
      border-radius:100px; padding:4px 10px 4px 6px; margin-bottom:16px;
    }
    #yp-version-badge .dot { width:6px; height:6px; border-radius:50%; background:#4ade80; display:inline-block; box-shadow:0 0 6px #4ade80; }
    #yp-version-badge .txt { font-size:11px; font-weight:500; color:rgba(255, 255, 255, 0.87); letter-spacing:0.04em; }
    #yp-top-bar h2 { font-family:"Shadows Into Light", cursive, serif; font-size:26px; font-weight:400; font-style:italic; color:#fff; margin:0 0 6px; line-height:1.2; font-weight: bold}
    #yp-top-bar p { font-size:13px; color:rgba(255,255,255,0.5); margin:0; font-weight:300; }
    #yp-body { padding:20px 24px 24px; }

    .yp-step { display:none; }
    .yp-step.active { display:block; animation:ypUp 0.25s ease; }

    #yp-changes-label { font-size:10px; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#aaa; margin-bottom:12px; display:block; }

    /* ── Scrollable update list ── */
    #yp-changes-list { max-height:260px; overflow-y:auto; padding-right:4px; }
    #yp-changes-list::-webkit-scrollbar { width:3px; }
    #yp-changes-list::-webkit-scrollbar-track { background:transparent; }
    #yp-changes-list::-webkit-scrollbar-thumb { background:#e0d0f0; border-radius:10px; }

    .yp-change-item { display:flex; align-items:flex-start; gap:11px; padding:10px 0; border-bottom:1px solid gray; border-bottom-left-radius: 10px; border-left: solid 1px transparent }
    .yp-change-item:last-child { border-bottom:none; }
    .yp-change-icon { border:1px solid #7f4ab4; width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:13px; }
    .yp-change-item h4 { font-size:12.5px; font-weight:500; color:#1a1a2e; margin:0 0 2px; }
    .yp-change-item p { font-size:11.5px; color:#888; margin:0; line-height:1.5; font-weight:300; }

    /* ── Step 2 (year) ── */
    #yp-step2-title { font-size:15px; font-weight:500; color:#111; margin:0 0 4px; }
    #yp-step2-sub { font-size:13px; color:#888; margin:0 0 18px; font-weight:300; line-height:1.6; }

    #yp-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-bottom:18px; }
    .yp-yr-btn {
      padding:11px 6px; border-radius:10px; border:1.5px solid #ebebeb; background:#fafafa;
      border: solid 2px #072d04d2;
      background-color: rgba(10, 54, 4, 0.16);
      font-family:'Geist',sans-serif; font-size:13px; font-weight:400; color:#555; cursor:pointer; transition:all 0.15s ease;
    }
    .yp-yr-btn:hover { border-color:#7c3aed; color:#7c3aed; background:#faf5ff; }
    .yp-yr-btn.active { border-color:#7c3aed; background:linear-gradient(135deg,#7c3aed,#be185d); color:#fff; font-weight:500; }

    #yp-staff-wrap { margin-bottom:18px; }
    #yp-staff-input {
      width:100%; box-sizing:border-box; padding:12px 14px; border-radius:10px;
      border:1.5px solid #ebebeb; background:#fafafa;
      font-family:'Geist',sans-serif; font-size:14px; color:#111; outline:none; transition:border-color 0.15s;
    }
    #yp-staff-input:focus { border-color:#7c3aed; background:#fff; }
    #yp-staff-input::placeholder { color:#bbb; }

    #yp-error { font-size:12px; color:#e53e3e; min-height:16px; display:block; margin-bottom:12px; }

    /* ── Step 3 — Specialists ── */
    #yp-step3-icon {
      width:48px; height:48px; border-radius:14px; margin-bottom:14px;
      background:linear-gradient(135deg,#4ade80,#7c3aed);
      display:flex; align-items:center; justify-content:center; font-size:22px;
    }
    #yp-step3-title { font-size:15px; font-weight:500; color:#1a1a2e; margin:0 0 6px; }
    #yp-step3-body { font-size:12.5px; color:#777; line-height:1.65; margin:0 0 14px; font-weight:300; }
    .yp-pill-row { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:18px; }
    .yp-pill {
      padding:5px 11px; border-radius:100px; font-size:11.5px; font-weight:500;
      border:1.5px solid transparent;
    }
    .yp-pill-green  { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
    .yp-pill-purple { background:#faf5ff; color:#7c3aed; border-color:#e9d5ff; }
    .yp-pill-pink   { background:#fdf2f8; color:#be185d; border-color:#fbcfe8; }

    /* ── Step 4 — Version notes ── */
    #yp-step4-icon {
      width:48px; height:48px; border-radius:14px; margin-bottom:14px;
      background:linear-gradient(135deg,#be185d,#7c3aed);
      display:flex; align-items:center; justify-content:center; font-size:22px;
    }
    #yp-step4-title { font-size:15px; font-weight:500; color:#1a1a2e; margin:0 0 6px; }
    #yp-step4-body { font-size:12.5px; color:#777; line-height:1.65; margin:0 0 18px; font-weight:300; }

    /* ── Shared button styles ── */
    .yp-btn-row { display:flex; gap:8px; }
    .yp-btn-secondary {
      flex:1; background: radial-gradient(circle at center left, #072d04d2, transparent, #26034125); padding:13px; border-radius: 12px;
      border: none;
      font-family:'Geist',sans-serif; font-size:13px; font-weight:500; color:#555; cursor:pointer; transition:all 0.15s;
    }
    .yp-btn-secondary:hover { border-color:#ccc; color:#111; }
    .yp-btn-primary {
      flex:2; padding:13px; border-radius:12px; border:none;
      background:linear-gradient(135deg,#15803d,#7c3aed);
      animation: gradientShift 15s ease infinite;
      background-size: 100% 150%;
      font-family:'Geist',sans-serif; font-size:13px; font-weight:500; color:#fff; cursor:pointer; transition:all 0.15s;
    }
    .yp-btn-primary:hover { opacity:0.88; }
    .yp-btn-primary:active { transform:scale(0.98); }
    .yp-btn-primary:disabled { opacity:0.4; cursor:not-allowed; transform:none; }

    .yp-btn-full {
      width:100%; box-sizing:border-box; padding:13px; border-radius:12px; border:none;
      font-family:'Geist',sans-serif; font-size:13px; font-weight:500; color:#fff; cursor:pointer; transition:all 0.15s;
    }
    .yp-btn-full:hover { opacity:0.88; }
    .yp-btn-full:active { transform:scale(0.98); }
    .yp-btn-apply  { background:linear-gradient(135deg,#4ade80,#7c3aed); color:#fff; }
    .yp-btn-skip   { background:transparent; border:1.5px solid #e5e7eb; color:#888; margin-top:8px; }
    .yp-btn-skip:hover { border-color:#ccc; color:#555; }
    .yp-btn-versions { background:linear-gradient(135deg,#be185d,#7c3aed); }
    .yp-btn-done     { background:linear-gradient(135deg,#15803d,#7c3aed); margin-top:8px; }

    @media (max-width:380px) {
      #yp-top-bar { padding:22px 20px 20px; }
      #yp-body { padding:18px 18px 22px; }
      #yp-grid { grid-template-columns:repeat(2,1fr); }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.id = "yp-overlay";

  overlay.innerHTML = `
    <div id="yp-card">
      <div id="yp-top-bar">
        <div id="yp-version-badge">
          <span class="dot"></span>
          <span class="txt">MMUN v2.0 Rel-11 is live</span>
        </div>
        <h2>What's new</h2>
        <p>A few things got better since you last signed in.</p>
      </div>

      <div id="yp-body">

        <!-- ── STEP 1: What's new ── -->
        <div class="yp-step active" id="yp-step1">
          <span id="yp-changes-label" style="font-weight:500; color:#1a1a2e;">This update includes</span>

          <div id="yp-changes-list">
            <div class="yp-change-item">
              <div class="yp-change-icon" style="background:#eff6ff;">💬</div>
              <div>
                <h4>Message blue &amp; green dots</h4>
                <p>See the status of your sent messages — blue for read, green for unread and yellow for new — across all conversations.</p>
              </div>
            </div>
            <div class="yp-change-item">
              <div class="yp-change-icon" style="background:#f0fdf4;">🙍‍♂️</div>
              <div>
                <h4>Account creation fix</h4>
                <p>A bug that prevented your year from saving at sign-up has been resolved.</p>
              </div>
            </div>
            <div class="yp-change-item">
              <div class="yp-change-icon" style="background:#fefce8;">⚡</div>
              <div>
                <h4>Smoother scroll effects</h4>
                <p>Animations are now optimised to run well even on low-end devices.</p>
              </div>
            </div>
            <div class="yp-change-item">
              <div class="yp-change-icon" style="background:#fdf4ff;">🔍</div>
              <div>
                <h4>New filters</h4>
                <p>Filter students by campus, year, or course to find exactly who you're looking for.</p>
              </div>
            </div>
            <div class="yp-change-item">
              <div class="yp-change-icon" style="background:#fff1f2;">🔔</div>
              <div>
                <h4>Notification fix (Android)</h4>
                <p>Notifications previously showed only the app icon with no message preview on Android. Fixed.</p>
              </div>
            </div>
            <div class="yp-change-item">
              <div class="yp-change-icon" style="background:#f0fdf4;">🎬</div>
              <div>
                <h4>Improved video streaming</h4>
                <p>Video media now loads and plays smoothly thanks to an improved Intersection Observer implementation.</p>
              </div>
            </div>
            <div class="yp-change-item">
              <div class="yp-change-icon" style="background:#faf5ff;">✨</div>
              <div>
                <h4>UI / UX redesign</h4>
                <p>We refreshed the app's design to be more appealing, intuitive, and easy to navigate.</p>
              </div>
            </div>
          </div>

          <div class="yp-btn-row" style="margin-top:18px;">
            <button class="yp-btn-primary" onclick="ypGoStep2()">Continue →</button>
          </div>
        </div>

        <!-- ── STEP 2: Year prompt ── -->
        <div class="yp-step" id="yp-step2">
          <p id="yp-step2-title">One last thing</p>
          <p id="yp-step2-sub">Because of the sign-up bug mentioned above, we need you to re-enter your ${isStaff ? "years of experience" : "year"}. It'll only take a second.</p>

          <div id="yp-grid" ${isStaff ? 'style="display:none;"' : ''}>
            ${["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"].map(yr => `
              <button class="yp-yr-btn" onclick="selectStudentYear(this,'${yr}')">${yr}</button>
            `).join("")}
          </div>

          <div id="yp-staff-wrap" ${isStaff ? '' : 'style="display:none;"'}>
            <input id="yp-staff-input" type="number" min="1" max="60" placeholder="e.g. 5" />
          </div>

          <span id="yp-error"></span>

          <div class="yp-btn-row">
            <button class="yp-btn-secondary" onclick="ypGoStep1()">← Back</button>
            <button class="yp-btn-primary" id="yp-save-btn" onclick="submitYearPrompt()">Save &amp; continue</button>
          </div>
        </div>

        <!-- ── STEP 3: Specialists ── -->
        <div class="yp-step" id="yp-step3">
          <div id="yp-step3-icon">🤝</div>
          <p id="yp-step3-title">Join the MMUN team</p>
          <p id="yp-step3-body">
            We're looking for passionate specialists to work with on MMUN. Whether you have a skill to offer, want to help shape the platform, or are interested in becoming a stakeholder or shareholder — there's a place for you.
          </p>
          <div class="yp-pill-row">
            <span class="yp-pill yp-pill-green">📣 Marketing</span>
            <span class="yp-pill yp-pill-purple">🧩 Feature Specialist</span>
            <span class="yp-pill yp-pill-pink">🎨 Designer</span>
            <span class="yp-pill yp-pill-purple">💻 Developer</span>
            <span class="yp-pill yp-pill-green">📈 Shareholder</span>
            <span class="yp-pill yp-pill-pink">🤝 Stakeholder</span>
            <span class="yp-pill yp-pill-pink">💖 Reviewer</span>
          </div>
          <button class="yp-btn-full yp-btn-apply" onclick="window.location.href='/specialists/applications'">Apply now →</button>
          <button class="yp-btn-full yp-btn-skip" onclick="ypGoStep4()">Not now, continue</button>
        </div>

        <!-- ── STEP 4: Version notes ── -->
        <div class="yp-step" id="yp-step4">
          <div id="yp-step4-icon">📋</div>
          <p id="yp-step4-title">Full release notes</p>
          <p id="yp-step4-body">
            Want to dig deeper? Visit the MMUN v2.0 release 11 page for a detailed breakdown of every improvement, new feature, and what's coming next.
          </p>
          <button class="yp-btn-full yp-btn-versions" onclick="window.location.href='/versions/updates'">View release notes →</button>
          <button class="yp-btn-full yp-btn-done" onclick="ypClose()" style="margin-top:8px;">Done, let's go →</button>
        </div>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function ypGoStep2() {
  document.getElementById('yp-step1').classList.remove('active');
  document.getElementById('yp-step2').classList.add('active');
}

function ypGoStep1() {
  document.getElementById('yp-step2').classList.remove('active');
  document.getElementById('yp-step1').classList.add('active');
}

function ypGoStep3() {
  document.getElementById('yp-step2').classList.remove('active');
  document.getElementById('yp-step3').classList.add('active');
}

function ypGoStep4() {
  document.getElementById('yp-step3').classList.remove('active');
  document.getElementById('yp-step4').classList.add('active');
}

function ypClose() {
  const overlay = document.getElementById('yp-overlay');
  overlay.style.transition = 'opacity 0.25s ease';
  overlay.style.opacity = '0';
  setTimeout(() => overlay.remove(), 250);
}

function selectStudentYear(btn, yr) {
  document.querySelectorAll('.yp-yr-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window._selectedStudentYear = yr;
}

function submitYearPrompt() {
  const isStaff = Role === "Lecturer" || Role === "Department Worker";
  const errorEl = document.getElementById('yp-error');
  errorEl.textContent = '';
  let yearValue = '';

  if (isStaff) {
    const input = document.getElementById('yp-staff-input');
    const num = parseInt(input.value, 10);
    if (!input.value || isNaN(num) || num < 1) {
      errorEl.textContent = 'Please enter a valid number of years.';
      return;
    }
    yearValue = `${num} years`;
  } else {
    if (!window._selectedStudentYear) {
      errorEl.textContent = 'Please select your year to continue.';
      return;
    }
    yearValue = window._selectedStudentYear;
  }

  saveYearData({ year: yearValue });
}

async function saveYearData(payload) {
  const errorEl = document.getElementById('yp-error');
  const btn = document.getElementById('yp-save-btn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    const res = await fetch('/updateYear', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log(data);
    if (!res.ok || !data.success) {
      errorEl.textContent = data.message || 'Something went wrong. Please try again.';
      btn.textContent = 'Save & continue';
      btn.disabled = false;
      return;
    }

    window._selectedStudentYear = null;
    ypGoStep3();

  } catch (err) {
    errorEl.textContent = 'Network error. Please check your connection.';
    btn.textContent = 'Save & continue';
    btn.disabled = false;
  }
}

// --- Entry point ---
function checkAndPromptUpdates(designer,role) {
  updated = designer;
  Role = role;
  if (!updated) {
    showYearPrompt();
  }
}