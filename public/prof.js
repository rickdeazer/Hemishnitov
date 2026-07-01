
      const img = document.querySelector('.profile-photo');
      const imgDiv = document.querySelector('.editable-photo');

const followersCountSpan = document.getElementById("followersCount");
const viewsCountSpan = document.getElementById("viewsCount");
const mainUser = localStorage.getItem("mainUser") || "<%= user.username %>";
const foreignUserClicked = "<%= user.username %>";
let state = "false";
let closer = ()=>{
  [img.className, imgDiv.className] = img.classList.contains('clickedPhoto') 
          ? ['profile-photo', 'editable-photo'] 
          : ['clickedPhoto', ''];
}
      img.addEventListener('click', () => {
        if (state == "true"){
          state = "neutral";
          img.style.transform = "rotateY(-180deg)"
        }else if(state == "false"){
          state = "true";
          closer()
        } else{
          state = "false";
          closer()
          setTimeout(() => {
            img.style.transform = "rotateY(0)"
          }, 500);
        }
      });

      const submitBtn = document.getElementById("submit");
      const savingSpan = document.getElementById("saving");
      let username = localStorage.getItem("mainUser") || "<%= user.username %>";
      const changedImages = [];
      const changedFields = {};
      document
        .querySelectorAll(".item, .editable-photo")
        .forEach((container) => {
          const editIcon = container.querySelector(".edit-icon");
          const fileInput = container.querySelector(".photo-input");
          const img = container.querySelector("img");

          const field =
            container.dataset.field ||
            img.dataset.field ||
            (img.alt && img.alt.includes("profile") ? "profile" : "gallery");
          const index =
            container.dataset.index !== undefined
              ? parseInt(container.dataset.index, 10)
              : null;

          editIcon?.addEventListener("click", () => {
            fileInput.click();
          });

          fileInput?.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              img.src = ev.target.result;
            };
            reader.readAsDataURL(file);

            if (field === "profile") {
              const idx = changedImages.findIndex(
                (ci) => ci.field === "prof" && ci.index === null
              );
              const obj = { field: "prof", index: null, file };
              if (idx >= 0) changedImages[idx] = obj;
              else changedImages.push(obj);
            } else {
              const idx = changedImages.findIndex(
                (ci) => ci.field === "gallery" && ci.index === index
              );
              const obj = { field: "gallery", index, file };
              if (idx >= 0) changedImages[idx] = obj;
              else changedImages.push(obj);
            }
          });
        });

      let aboutMeBox = document.getElementById("aboutMe");
      let aboutYouBox = document.getElementById("aboutYou");
      let courseInput = document.getElementById("course");
      let exit = document.getElementById('exit')
      let yearInput = document.getElementById("year");
      let sloganSpan = document.getElementById("sloganValue");
      function computeChangedText() {
        const changed = {};

        let aboutMeVal = aboutMeBox.value.trim();
        let aboutYouVal = aboutYouBox.value.trim();
        let courseVal = courseInput.value.trim();
        let yearVal = yearInput.value.trim();
        let sloganVal = sloganSpan.innerText.trim();

        if (aboutMeBox.dataset.modified === "true")
          changed.aboutMe = aboutMeVal;
        if (aboutYouBox.dataset.modified === "true")
          changed.aboutYou = aboutYouVal;
        if (courseInput.dataset.modified === "true") changed.course = courseVal;
        if (yearInput.dataset.modified === "true") changed.year = yearVal;
        if (sloganSpan.dataset.modified === "true") changed.slogan = sloganVal;

        return changed;
      }

      [aboutMeBox, aboutYouBox, courseInput, yearInput].forEach((el) => {
        el.addEventListener("input", () => (el.dataset.modified = "true"));
      });
      sloganSpan.addEventListener(
        "input",
        () => (sloganSpan.dataset.modified = "true")
      );

      async function uploadChangedImages() {
        if (changedImages.length === 0)
          return { ok: true, message: "no images changed" };

        const formData = new FormData();
        formData.append("username", username);

        for (const ci of changedImages) {
          if (ci.field === "prof") {
            formData.append(`prof_main`, ci.file);
          } else if (ci.field === "gallery") {
            formData.append(`gallery_${ci.index}`, ci.file);
          }
        }

        const res = await fetch("/profile/update/pics", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        return data;
      }
      async function updateChangedText() {
        const changed = computeChangedText();
        if (Object.keys(changed).length === 0)
          return { ok: true, message: "no text changed" };

        changed.username = username; 

        const res = await fetch("/profile/update/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changed),
        });
        const data = await res.json();
        return data;
      }

      submitBtn.addEventListener("click", async () => {
          const submitBn = document.getElementById("submit")
          const items = document.getElementById("items")
          const edits = document.querySelectorAll('.edit-icon')
          const year = document.getElementById('year')
          const course = document.getElementById('course')
          edits.forEach((edit)=>{
          edit.classList.add('unhide')
        })
        const promises = [];
        if (changedImages.length > 0) promises.push(uploadChangedImages());
        if (
          aboutMeBox.dataset.modified === "true" ||
          aboutYouBox.dataset.modified === "true" ||
          courseInput.dataset.modified === "true" ||
          yearInput.dataset.modified === "true" ||
          sloganSpan.dataset.modified === "true"
        ) {
          promises.push(updateChangedText());
        }

        if (promises.length === 0) {
          alert("Make atleast 1 change to update.");
        } else {
          exit.hidden=false;
          submitBn.classList.add('anim')
          items.style.display = 'flex'
          const results = await Promise.all(promises);
          document.getElementById('submit').style.display = 'none'
          document.querySelectorAll('.desc-box').forEach((item)=>{
          item.disabled = true});
          edits.forEach((edit)=>{
          edit.classList.remove('unhide')
          });
          alert(results.map((r) => r.message || JSON.stringify(r)).join("\n"));
          submitBn.classList.remove('anim')
          items.style.display = 'none'
          changedImages.length = 0;
          [aboutMeBox, aboutYouBox, courseInput, yearInput].forEach(
            (el) => (el.dataset.modified = "false")
          );
          sloganSpan.dataset.modified = "false";
        }
      });
      const textareas = document.querySelectorAll(".desc-box");
      textareas.forEach((t) => {
        t.style.height = t.scrollHeight + "px";
        t.addEventListener("input", () => {
          t.style.height = "auto";
          t.style.height = t.scrollHeight + "px";
        });
      });
      document.getElementById('Edit').addEventListener('click',()=>{
        const edits = document.querySelectorAll('.edit-icon')
        exit.hidden=true;
        edits.forEach((edit)=>{
          edit.classList.add('unhide')
        })
        document.getElementById('submit').style.display = 'flex'
        document.getElementById('course').disabled=false
        document.getElementById('year').disabled=false
        document.querySelectorAll('.desc-box').forEach((item)=>{
          item.disabled = false
        })
      })

async function fetchCounts() {
    const res = await fetch("/getFollowStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: mainUser, to: foreignUserClicked })
    });
    const data = await res.json();
    followersCountSpan.innerText = data.followersCount || 0;
    
    const res2 = await fetch("/viewProfile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viewedUser: foreignUserClicked, whoViewed: mainUser })
    });
    const data2 = await res2.json();
    viewsCountSpan.innerText = data2.viewsCount || 0;
}
fetchCounts();

async function loadFollowers() {
        const res = await fetch("/getFollowStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                from: mainUser, 
                to: foreignUserClicked 
            })
        });
        const data = await res.json();
        followersCountSpan.innerText = data.followersCount || 0;
}
loadFollowers();



    