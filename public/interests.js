let container1= document.getElementById("CONTACTS-BODY2")
let container2 = document.getElementById("CONTACTS-BODY1")
const sentBtn = document.getElementById('sentBtn')
const receivedBtn = document.getElementById('receivedBtn')
let mainUser= JSON.parse(localStorage.getItem("mainUser"));
const userName = document.querySelector("#HEADER-USERNAME>h3").innerHTML
let page= io()
sentBtn.addEventListener('click',()=>{
    container1.classList.remove('HIDE-BODY')
    container2.classList.add('HIDE-BODY')
    sentBtn.classList.toggle('sentBtnSelected')
    receivedBtn.classList.toggle('receivedBtnSelected')
})
receivedBtn.addEventListener('click',()=>{
    container1.classList.add('HIDE-BODY')
    container2.classList.remove('HIDE-BODY')
    receivedBtn.classList.toggle('receivedBtnSelected')
    sentBtn.classList.toggle('sentBtnSelected')
})

let received = {};
let sent = {};

let data = async () => {
  try {
    const interestsData = await fetch("/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },   // fixed typo
      body: JSON.stringify({ mainUser })
    });

    if (!interestsData.ok) throw new Error("Failed to fetch interests");

    const dataReceived = await interestsData.json();
    received = dataReceived.received;
    sent = dataReceived.sent;

    renderSent(sent);
    renderReceived(received);
  } catch (err) {
    console.error("Error loading interests:", err);
    // Optional: show message in UI
  }
};

let renderSent = (sent) => {
  const container = container1; // alias for clarity
  container.innerHTML = "";

  if (!sent || sent.length === 0) {
    const defaultM = document.createElement("div");
    defaultM.classList.add("CONTACTS", "defaultBlank");
    defaultM.innerHTML = `<p>Interest you show to others will appear here</p>`;
    container.appendChild(defaultM);
    return;
  }

  sent.forEach(v => {
    const contact = document.createElement("div");
    contact.classList.add("CONTACTS");

    const contactPic = document.createElement("div");
    contactPic.classList.add("CONTACTS-PROFILEPIC");
    contactPic.style.backgroundImage = `url('${v.profileLink || "/mediafiles/africanGirl.jpg"}')`;

    contactPic.addEventListener("click", () => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/user";
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "username";
      input.value = v.username;
      form.appendChild(input);
      document.body.appendChild(form);   // safer attach point
      form.submit();
      document.body.removeChild(form);   // cleanup
    });

    const contactInfo = document.createElement("div");
    contactInfo.classList.add("CONTACTS-INFO");

    const h3 = document.createElement("h3");
    h3.classList.add("CONTACTS-USERNAME");
    h3.textContent = v.username;

    const interestStatus = document.createElement("div");
    interestStatus.classList.add("INTERESTS-STATUS");

    if (v.status === "pending")        interestStatus.classList.add("Pending");
    else if (v.status === "interested") interestStatus.classList.add("Interested");
    else                               interestStatus.classList.add("notInterested");

    interestStatus.innerHTML = `<h3>Status: ${v.status}</h3>`;

    contactInfo.appendChild(h3);
    contactInfo.appendChild(interestStatus);
    contact.appendChild(contactPic);
    contact.appendChild(contactInfo);
    container.appendChild(contact);
  });
};


let renderReceived = (received) => {
  const container = container2;
  container.innerHTML = "";

  if (!received || received.length === 0) {
    const defaultM = document.createElement("div");
    defaultM.classList.add("CONTACTS", "defaultBlank");
    defaultM.innerHTML = `<p>No one has shown an interest on you yet</p>`;
    container.appendChild(defaultM);
    return;
  }

  received.forEach(u => {   // ← NO async here
    const contact = document.createElement("div");
    contact.classList.add("CONTACTS");

    const contactPic = document.createElement("div");
    contactPic.classList.add("CONTACTS-PROFILEPIC");
    contactPic.style.backgroundImage = `url('${u.profileLink || "/mediafiles/africanGirl.jpg"}')`;

    contactPic.addEventListener("click", () => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/user";
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "username";
      input.value = u.username;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    });

    const contactInfo = document.createElement("div");
    contactInfo.classList.add("CONTACTS-INFO");

    const h3 = document.createElement("h3");
    h3.classList.add("CONTACTS-USERNAME");
    h3.textContent = u.username;

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("INTERESTS-BTN-CONTAINER");

    // Handle already decided states first
    if (u.status === "interested") {
      btnContainer.innerHTML = "✅ Interested";
    } else if (u.status === "declined") {
      btnContainer.innerHTML = "❌ You ignored this contact.";
    } else {
      // Pending → show buttons
      const interestedBtn = document.createElement("button");
      interestedBtn.className = "InterestedBtn INTERESTS-BTN";
      interestedBtn.textContent = "Interested";

      const declinedBtn = document.createElement("button");
      declinedBtn.className = "Decline INTERESTS-BTN";
      declinedBtn.textContent = "Ignore";

      interestedBtn.addEventListener("click", async () => {   // async ok here (single handler)
        try {
          const res = await fetch("/interests/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: u.username, to: mainUser })
          });
          const data = await res.json();

          if (data.status) {
            btnContainer.innerHTML = "✅ Interested";
            page.emit("message", {
              from: mainUser || userName.trim(),
              to: u.username,
              text: `Hey ${u.username} 👋, I'm also interested in you, lets now chat.`
            });
          }
        } catch (err) {
          console.error("Accept failed:", err);
          // Optional: show error message to user
        }
      });

      declinedBtn.addEventListener("click", async () => {
        try {
          const res = await fetch("/interests/decline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: u.username, to: mainUser })
          });
          const data = await res.json();

          if (data.status) {
            btnContainer.innerHTML = "❌ You ignored this contact.";
          }
        } catch (err) {
          console.error("Decline failed:", err);
        }
      });

      btnContainer.appendChild(interestedBtn);
      btnContainer.appendChild(declinedBtn);
    }

    contactInfo.appendChild(h3);
    contactInfo.appendChild(btnContainer);
    contact.appendChild(contactPic);
    contact.appendChild(contactInfo);
    container.appendChild(contact);
  });
};

data();  