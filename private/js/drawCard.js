document.querySelector(".logout").addEventListener("click", async function (e) {
  const resp = await fetch("/logout");
  const result = await resp.json();
  if (result.success === true) {
    await Swal.fire("Logout success", "Bye!", "success");
    window.location.href = "./index.html";
    return;
  }
});

let popUpBox = document.querySelector(".popUp");

document.querySelector("#form-buttons-box").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData();

  formData.append("files", form.files.files[0]);
  formData.append("insertCardName", form.insertCardName.value);
  formData.append("allGangs", form.allGangs.value);
  formData.append("style", form.style.value);

  popUpBox.style.display = "flex";

  const res = await fetch("/newCard/draw", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
  if (result.success === true) {
    getNewCardDisplay();
  } else {
    console.log("err");
  }
});

async function getNewCardDisplay() {
  const res = await fetch("/newCard/draw");
  const card = await res.json();

  let htmlStr = ``;

  htmlStr = /*html*/ `

        <div class="closeBtn">X</div>
        <div class="cardFrame">
        <img src="/assets/${card[card.length - 1].attribute1}.png">
        <div class="cardUpper">
            <div class="cardName">${card[card.length - 1].card_name}</div>
            <div class="gangs"> <img src="/assets/${card[card.length - 1].gangs}"></div>
        </div>
        <div class="cardPhoto">
            <img src="/uploads/${card[card.length - 1].image}">
        </div>
        <div class="skill">
            <div class="skillName">${card[card.length - 1].skill_name}</div>
            <div class="skillDes">${card[card.length - 1].description}</div>
        </div>

        <div class="status">
            <div class="grade">${card[card.length - 1].grade}</div>
            <div class="hp">HP:${card[card.length - 1].hp}</div>
            <div class="atk">ATK:${card[card.length - 1].atk}</div>
        </div>
    </div>`;

  document.querySelector(".popUp").innerHTML = htmlStr;

  let closeBtn = document.querySelector(".closeBtn");
  closeBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    popUpBox.style.display = "none";
    window.location.href = "./drawCard.html";
  });
}
