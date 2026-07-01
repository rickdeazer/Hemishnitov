    const cockName = document.getElementById("usernameL")
    const cockSeed = document.getElementById("passwordL")
    const submitBtn = document.getElementById("SUBMIT-BTN");
    const loadA = document.getElementById("loadA");
    const mainForm = document.getElementById("SIGNUP-FORM");
    const header = document.getElementById("HEADER");
    const errorText = document.getElementById("ERROR-TEXT");
    const loadB = document.getElementById("loadB");
    const signupPage = document.getElementById("SIGNUP-PAGE");
    let cockNate = localStorage.getItem("cockNate");
    let tokenSaved = "";
      cockSeed.addEventListener('keydown',(event)=>{
      if(event.key == "Enter"){
        submitActions();
      }
    })
    let cockSed = localStorage.getItem("UnsafecockSeed");
    let takeBack = JSON.parse(localStorage.getItem("AuthWalkRoad")) || null;
    function appendTakeBack(parent){
      if(takeBack){
        let takeBackEl = document.createElement("input");
        takeBackEl.name = "takeBack";
        takeBackEl.type = "hidden"
        takeBackEl.value = takeBack;
        parent.appendChild(takeBackEl);
      } else {
        return;
      }
    }
    const msg = errorText.innerText?.trim();
    if(msg !== 'Expired login token' && msg !== "Your Account has been created"){
      cockNate = null;
    }
    if(cockNate){
    if(cockSed){
    let form = document.createElement("form");
    errorText.style.color = "yellow";
    errorText.innerText = "Veryfying..."
    setTimeout(() => {
      errorText.innerText = "Logging in..."
      errorText.style.color = "green";
    }, 2000);
    form.method = "POST";
    form.action = "/login";
    
    let input = document.createElement("input");
    input.type = "hidden";
    input.name = "usernameL";
    input.value = cockNate;

    let input2 = document.createElement("input");
    input2.type = "hidden";
    input2.name = "passwordL"
    input2.value = cockSed;

    let input3 = document.createElement("input");
    input3.type = "hidden";
    input3.name = "fcm_token";
    input3.value = tokenSaved;
    appendTakeBack(form);
    form.appendChild(input);
    form.appendChild(input2);
    form.appendChild(input3);
    document.body.appendChild(form);
    form.submit();
     setTimeout(() => {
      loadB.classList.remove("unload");
      setTimeout(() => {
        loadA.classList.remove("unload");
      }, 3000);
      }, 500);
        }};
    signupPage.addEventListener('scroll',()=>{
      if (signupPage.scrollTop > 300){
        header.style.animation = "none";
        header.style.backgroundColor = "black";
      } else {
        header.style.animation = "rotas 30s ease-in-out";
        header.style.backgroundColor = "linear-gradient(60deg,rgba(2, 80, 2, 0.033),black,rgba(0, 0, 0, 0.947))";
      }
    })


      function submitActions(){
      let form = document.getElementById("SIGNUP-FORM");
      appendTakeBack(form);
      form.submit();
      localStorage.setItem("UnsafecockSeed",cockSeed.value)
      localStorage.setItem("cockNate",cockName.value);
      const mainUser = document.getElementById("usernameL").value;
      localStorage.setItem("mainUser", JSON.stringify(mainUser));
      setTimeout(() => {
      loadB.classList.remove("unload");
      setTimeout(() => {
        loadA.classList.remove("unload");
      }, 3000);
      }, 500);
      let blocked = document.getElementById("blocked");
    }

    submitBtn.addEventListener("click", (event) => {
      submitActions();
    });



    fetch("/sysInfo")
      .then((type) => type.json())
      .then((data) => {
        if (data[0].appState) {
          return;
        } else {
          blocked.style.display = "flex";
        }
      });

      if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
    .then(reg => console.log('SW registered', reg))
    .catch(err => console.error('SW register failed', err));
} else {
  const stateEl = document.getElementById('pwastate');
  if (stateEl) stateEl.textContent = 'no service worker support';
}



      let deferredPrompt = null;
let installTimer = null;

const installBtn = document.getElementById("installBtn");
const stateEl = document.getElementById("pwastate");

const INSTALL_DELAY = 1; 
const DISMISS_COOLDOWN =1 * 1000; 

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function canShowInstall() {
  const lastDismiss = localStorage.getItem("pwaDismissTime");
  if (!lastDismiss) return true;

  return Date.now() - Number(lastDismiss) > DISMISS_COOLDOWN;
}

function setInstalledState() {
  localStorage.setItem("pwaInstalled", "true");
}

function clearInstalledState() {
  localStorage.removeItem("pwaInstalled");
}

function checkUninstall() {
  if (!isInstalled() && localStorage.getItem("pwaInstalled")) {
    console.log("User likely uninstalled PWA");

    clearInstalledState();
    localStorage.removeItem("pwaDismissTime");
  }
}

if (installBtn) installBtn.style.display = "block";

if (stateEl && isInstalled()) {
  stateEl.textContent = "installed";
}

checkUninstall();

window.addEventListener("beforeinstallprompt", (e) => {

  if (!installBtn) return;
  if (isInstalled()) return;
  if (!canShowInstall()) return;

  e.preventDefault();
  deferredPrompt = e;

  localStorage.removeItem("pwaDismissTime");

  if (installTimer) clearTimeout(installTimer);

  installTimer = setTimeout(() => {
    if (deferredPrompt) {
      installBtn.style.display = "inline-block";
      installBtn.disabled = false;
    }
  }, INSTALL_DELAY);
});

if (installBtn) {

  installBtn.addEventListener("click", async () => {
    window.location.href="https://play.google.com/store/apps/details?id=com.moispace.mmun"
    // if (isIOS() && !deferredPrompt) {
    //   alert("Install: Tap Share → Add to Home Screen");
    //   return;
    // }

    // if (!deferredPrompt) {
    //   alert("Wait for your browser to ask for installation request.");
    //   return;
    // }

    // deferredPrompt.prompt();

    // const choice = await deferredPrompt.userChoice;

    // if (choice.outcome === "accepted") {
    //   console.log("Install accepted");
    // } else {
    //   console.log("Install dismissed");

    //   localStorage.setItem("pwaDismissTime", Date.now());
    // }

    // installBtn.style.display = "none";
    // deferredPrompt = null;
  });
}

window.addEventListener("appinstalled", () => {

  console.log("PWA Installed Successfully");

  setInstalledState();

  if (installBtn) installBtn.style.display = "block";
  if (stateEl) stateEl.textContent = "installed";

  localStorage.removeItem("pwaDismissTime");
});

window.addEventListener("DOMContentLoaded", () => {

  if (isInstalled()) {
    console.log("Running as installed PWA");

    if (stateEl) stateEl.textContent = "installed";
  }
});


//ANDROID FCM TOKEN RECEIVER SECTION 
window.onFcmTokenReceived = function(token) {
    installBtn.style.display = "none";
    tokenSaved = token;
    let input4 = document.createElement("input"); 
    input4.type = "hidden";
    input4.name = "fcm_token";
    input4.value = tokenSaved;
    mainForm.appendChild(input4);
};
if (window.AndroidInterface && window.AndroidInterface.requestFcmToken) {
    window.AndroidInterface.requestFcmToken();
} else {
    // If you see this alert, it means you are in a normal web browser (like Chrome), 
    // or the Android bridge hasn't finished loading yet.
    console.log("Android app bridge not detected. User is on a web browser.");
};