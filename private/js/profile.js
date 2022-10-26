getAllProfileInfo();
getAllCard();

async function getAllProfileInfo() {
  const res = await fetch("/profile/info");
  const result = await res.json();

  if (true) {
    document.querySelector(".contentPhoto").innerHTML = /**html */ `
        <img src="/uploads/${result[0].avatar}">`;

    document.querySelector(".personalId").innerHTML = /**html */ ` 
        <div class="personalId">👤名字:${result[0].username}</div>`;

    document.querySelector(".personalEmail").innerHTML = /**html */ `
        <div class="personalEmail">📧 電郵:${result[0].email}</div>`;

    document.querySelector(".userType").innerHTML = /**html */ `
        <div class="userType">💎VIP:${result[0].user_type}</div>`;

    // document.querySelector(".gameWon").innerHTML = /**html */ `
    //     <div class="gameWon">勝率:${result[0].game_won}</div>`;

    // document.querySelector(".gamePlayed").innerHTML = /**html */ `
    //     <div class="gamePlayed">勝場:${result[0].game_play}</div>`;
  }
}

async function getAllCard() {
  const res = await fetch(`/profile/card`);
  const cards = await res.json();

  let htmlStr = ``;
  for (const card of cards) {
    htmlStr += /*html*/ `
    
        <div class="cardFrame">
        <img src="/assets/${card.attribute1}.png">
        <div class="cardUpper">
            <div class="cardName">${card.card_name}</div>
            <div class="gangs"> <img src="/assets/${card.gangs}"></div>
        </div>
        <div class="cardPhoto">
            <img src="/uploads/${card.image}">
        </div>
        <div class="skill">
            <div class="skillName">${card.skill_name}</div>
            <div class="skillDes">${card.description}</div>
        </div>

        <div class="status">
            <div class="grade">${card.grade}</div>
            <div class="hp">HP:${card.hp}</div>
            <div class="atk">ATK:${card.atk}</div>
        </div>
    </div>`;
  }
  document.querySelector(".displayCard").innerHTML = htmlStr;
}

document.querySelector(".logout").addEventListener("click", async function () {
  const resp = await fetch("/logout");
  const result = await resp.json();
  if (result.success === true) {
    await Swal.fire("Logout success", "Bye!", "success");
    window.location.href = "./index.html";
    return;
  }
});
