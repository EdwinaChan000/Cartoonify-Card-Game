// SOCKET IO //

// For deployment
const socket = io.connect();

// For running in local
// const socket = io.connect("localhost:8080");

// console.dir(socket)
// socket.on("connect", () => {
//     console.log(`\nsocket.on("connect")`)
//     console.log(socket.id)
//     console.log(socket.ids)
//     console.log(socket.connected)
// })

const urlParams = new URLSearchParams(window.location.search);
const room_id = urlParams.get("id")
let playerType = ""
console.log(`Welcome to room [${room_id}]`)

socket.emit("hello", { msg: `Hello from Client` });
socket.emit("onPageLoad", "Game Page Loaded")
socket.emit("joinRoom", room_id)
socket.on("roomInfo", (room_id, player_type) => {
    console.log(`+io+ Room Info: Room ID=${room_id} Player Type=${player_type}`);
    playerType = player_type
});

// Reset Game
const reset = document.querySelector("#resetButton");
reset.addEventListener("click", () => {
    socket.emit("reset");
    console.log("Reset Game")
    readyGameButton.classList.remove("hiddenToggler")
    confirmCardSelection.classList.removes("hiddenToggler")
})

socket.on("resetGame", () => {
    for (let card of playerDeckArray) {
        card.innerHTML = ""
    }
    // for (let card of playerDeckArray) {
    //     card.innerHTML = ""
    // }
    player_card = ""
    opponent_card = ""
    player_HP = null
    opponent_HP = null
})

socket.on("new-player", (data) => {
    console.log("new-player", data["msg"]);
});
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// ==========================================
// ### Test Python ###
// ==========================================

const testPythonButton = document.querySelector("#testPythonButton");
testPythonButton.addEventListener("click", (event) => {
    console.log(event.currentTarget);
    socket.emit("testPython");
})

// ==========================================
// ### CHAT ###
// ==========================================
const messageOutput = document.querySelector("#chatOutput");
const messageInput = document.querySelector("#chatInput");
const messageCollapse = document.querySelector("#chatMessageMainContainer");
const resizeChat = document.querySelector("#resizeChat");
const chatMessageOutputContainer = document.querySelector(".chatMessageOutputContainer");

// Send chat message to room
messageInput.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const formObject = {};
    socket.emit("chat", form.message.value);
    // Add message to message display
    messageOutput.innerHTML += `<li>Me: ${form.message.value}</li>`;
    event.target.reset();
});

let ResizeLabel = "";
let switchResizeLabel = "收起";

resizeChat.addEventListener("click", (event) => {
    console.log("Collapse is clicked ", event.target);
    messageInput.classList.toggle("collapseSub");
    messageOutput.classList.toggle("collapseSub");
    messageCollapse.classList.toggle("collapse");
    ResizeLabel = resizeChat.innerHTML;
    resizeChat.innerHTML = switchResizeLabel;
    switchResizeLabel = ResizeLabel;
});

// Receive chat message from room
socket.on("chat", (data) => {
    messageOutput.innerHTML += `<li class="opponent">Opponent: ${data}</li>`;
    chatMessageOutputContainer.scrollIntoView(false);
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ==========================================
// ### SOME CONTROL ###
// ==========================================

// SET QUERY SELECTOR //

// -- Opponent Cards --

const opponentDeckArray = document.querySelectorAll(".opponentCard")

const opponentDeck_1 = document.querySelector("#opponentDeck-1");
const opponentDeck_2 = document.querySelector("#opponentDeck-2");
const opponentDeck_3 = document.querySelector("#opponentDeck-3");
const opponentDeck_4 = document.querySelector("#opponentDeck-4");
const opponentDeck_5 = document.querySelector("#opponentDeck-5");

// -- Action Zone --

const opponent_HP = document.querySelector("#opponent-HP");
const player_HP = document.querySelector("#player-HP");

const opponent_card = document.querySelector("#opponent-card");
const player_card = document.querySelector("#player-card");

const opponent_move = document.querySelector("#opponent-move");
const player_move = document.querySelector("#player-move");
const move_result = document.querySelector("#move-result");

// -- Skill Set --

// const skill_1 = document.querySelector("#skill-1");
// const skill_2 = document.querySelector("#skill-2");
// const skill_3 = document.querySelector("#skill-3");
// const skill_4 = document.querySelector("#skill-4");
// const skill_5 = document.querySelector("#skill-5");

// -- Rock Paper Scissor --

const move_rock = document.querySelector("#move_rock");
const move_paper = document.querySelector("#move_paper");
const move_scissor = document.querySelector("#move_scissor");

// -- Player Cards --

const playerDeckArray = document.querySelectorAll(".playerCard")

console.log(playerDeckArray)
console.table(playerDeckArray)

const playerDeck_1 = document.querySelector("#playerDeck-1");
const playerDeck_2 = document.querySelector("#playerDeck-2");
const playerDeck_3 = document.querySelector("#playerDeck-3");
const playerDeck_4 = document.querySelector("#playerDeck-4");
const playerDeck_5 = document.querySelector("#playerDeck-5");

let allowSelectCard = false
let selectCardHTML = ""

// Player Deck

playerDeck_1.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    player_card.innerHTML = playerDeck_1.innerHTML
    selectCardHTML = playerDeck_1.innerHTML
    socket.emit("selectCard", playerDeck_1.getAttribute("card_id"))
})
playerDeck_2.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    player_card.innerHTML = playerDeck_2.innerHTML
    selectCardHTML = playerDeck_2.innerHTML
    socket.emit("selectCard", playerDeck_2.getAttribute("card_id"))
})
playerDeck_3.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    player_card.innerHTML = playerDeck_3.innerHTML
    selectCardHTML = playerDeck_3.innerHTML
    socket.emit("selectCard", playerDeck_3.getAttribute("card_id"))
})
playerDeck_4.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    player_card.innerHTML = playerDeck_4.innerHTML
    selectCardHTML = playerDeck_4.innerHTML
    socket.emit("selectCard", playerDeck_4.getAttribute("card_id"))
})
playerDeck_5.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    player_card.innerHTML = playerDeck_5.innerHTML
    selectCardHTML = playerDeck_5.innerHTML
    socket.emit("selectCard", playerDeck_5.getAttribute("card_id"))
})

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Ready to Start Game
const readyGameButton = document.querySelector("#readyButton");
readyGameButton.addEventListener("click", (event) => {
    console.log("Ready to Start Game ", event.currentTarget);
    socket.emit("playerReadyToStartGame");
})

// Initial Game Stats & Deal Cards
socket.on("initial", async (message, deck) => {
    console.log(message);
    readyGameButton.classList.add("hiddenToggler")
    getCards(deck)
    allowSelectCard = true
})


// Start the Game, Turn timer on/off
const timerDisplay = document.querySelector("#timerDisplay");
const timer = document.querySelector("#timer");
const timerButton = document.querySelector("#timerButton");
timerButton.addEventListener("click", (event) => {
    console.log(event.currentTarget);
    timerDisplay.classList.toggle("hiddenToggler");
});

socket.on("startGame", (switchGame) => {
    if (switchGame) {
        confirmCardSelection.classList.add("hiddenToggler")
        player_move.innerHTML = ""
        opponent_move.innerHTML = ""
        move_result.innerHTML = ""
    }
})

socket.on("startTimer", (switchTimer) => {
    if (switchTimer) {
        move_result.innerHTML = ""
        timerDisplay.classList.remove("hiddenToggler")
        nextRoundButton.classList.add("hiddenToggler")
        console.log("timer ON")
    } else {
        timerDisplay.classList.add("hiddenToggler")
        console.log("timer OFF")
    }
})

// Should let server determine rather can change card
socket.on("selectCard", (type, card) => {
    console.log(`${type} change to card ID=${card}`)
})

socket.on("placeCard", (host, hostCardHTML, host_card, guest, guestCardHTML, guest_card) => {
    allowSelectCard = false
    console.log(`Change card for players & Update HP`)

    if (playerType === host) {
        // player_card.innerHTML = hostCardHTML
        opponent_card.innerHTML = guestCardHTML
        player_HP.innerHTML = host_card["hp"]
        opponent_HP.innerHTML = guest_card["hp"]
    }
    else if (playerType === guest) {
        // player_card.innerHTML = guestCardHTML
        opponent_card.innerHTML = hostCardHTML
        player_HP.innerHTML = guest_card["hp"]
        opponent_HP.innerHTML = host_card["hp"]
    }
    confirmCardSelection.classList.add("hiddenToggler")
    nextRoundButton.classList.remove("hiddenToggler")
    socket.emit("placeCard", { success: true })
})

// Confirm Card Selection
const confirmCardSelection = document.querySelector("#confirmCardButton");
confirmCardSelection.addEventListener("click", (event) => {
    console.log("Confirmed card selection", event.currentTarget);
    socket.emit("confirmCardSelection", playerType);
    move_result.innerHTML = ``;
});

socket.on("replaceCard", (card_id) => {
    move_result.innerHTML = `<div>請重新選擇卡牌出戰，之後按"確認選擇"。</div>`
    player_card.innerHTML = ""
    removeCard(card_id, playerDeckArray)
    allowSelectCard = true
    confirmCardSelection.classList.remove("hiddenToggler")
    nextRoundButton.classList.add("hiddenToggler")
    // socket.emit("replaceCard", )
})



// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ==========================================
// ### GAME CONTROL ###
// ==========================================

// ADD EVENT LISTENER //

// skill_1.addEventListener("click", (event) => { console.log(event.currentTarget) })
// skill_2.addEventListener("click", (event) => { console.log(event.currentTarget) })

// -- Rock Paper Scissor --

move_rock.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    socket.emit("move", "rock");
})

move_paper.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    socket.emit("move", "paper");
})

move_scissor.addEventListener("click", (event) => {
    console.log(event.currentTarget)
    socket.emit("move", "scissor");
})

// -- Rock Paper Scissor --

socket.on("result", (resultObject) => {
    console.log(`Host: ${resultObject["host"]}`);
    console.log(`Guest: ${resultObject["guest"]}`);
    console.log(`Winner: ${resultObject["winner"]}`);

    if (playerType === "host") {
        player_move.innerHTML = `<img src="./img/${resultObject["host"]}.png"/>`;
        opponent_move.innerHTML = `<img src="./img/${resultObject["guest"]}.png"/>`;
        if (resultObject["winner"] === "host") {
            move_result.innerHTML = `<div>你贏左！！！<br>真係~<br>恭喜你呀!<br>🎉🎉</div>`;
        } else if (resultObject["winner"] === "guest") {
            move_result.innerHTML = `<div>你輸左！！！☠️</div>`;
        } else {
            move_result.innerHTML = `<div>打和!<br>再猜過!<br><br> 🖐🏻 ✌🏻 ✊🏻</div>`;
        }
    } else {
        player_move.innerHTML = `<img src="./img/${resultObject["guest"]}.png"/>`;
        opponent_move.innerHTML = `<img src="./img/${resultObject["host"]}.png"/>`;
        if (resultObject["winner"] === "guest") {
            move_result.innerHTML = `<div>你贏左！！！<br>真係~<br>恭喜你呀!<br>🎉🎉</div>`;
        } else if (resultObject["winner"] === "host") {
            move_result.innerHTML = `<div>你輸左！！！☠️</div>`;
        } else {
            move_result.innerHTML = `<div>打和!<br>再猜過!<br><br> 🖐🏻 ✌🏻 ✊🏻</div>`;
        }
    }
});

// Result announcement
// Winner deals damage & show next button  
const damage = document.querySelector("#damage")
socket.on("gameStats", (game_data) => {
    damage.classList.remove("hiddenToggler")
    damage.innerHTML = `<div>${game_data["damage"]}</div>`
    setTimeout(() => {
        damage.classList.add("hiddenToggler"), 1000
    })

    if (playerType == "host") {
        player_HP.innerHTML = game_data["host_hp"]
        opponent_HP.innerHTML = game_data["guest_hp"]
    } else if (playerType == "guest") {
        player_HP.innerHTML = game_data["guest_hp"]
        opponent_HP.innerHTML = game_data["host_hp"]
    }
})

// Ready for Next Round

const nextRoundButton = document.querySelector("#nextButton");
nextRoundButton.addEventListener("click", (event) => {
    console.log("Ready for Next Round ", event.currentTarget);
    damage.classList.add("hiddenToggler")
    socket.emit("nextRound")

})

socket.on("nextRound", (message) => {
    damage.classList.add("hiddenToggler")
    player_move.innerHTML = ""
    opponent_move.innerHTML = ""
    move_result.innerHTML = `<div>${message}</div>`
    timerDisplay.classList.add("hiddenToggler")
    confirmCardSelection.classList.add("hiddenToggler")
})

// const playerDeck = document.querySelectorAll(".playerDeck")

async function removeCard(card_id, playerDeckArray) {
    for (let card of playerDeckArray) {
        console.log(card)
        if (card.getAttribute("card_id") === card_id) {
            card.innerHTML = ""
        }
    }
}

async function getCards(cards) {
    let htmlStr = ``;
    let counter = 0
    let playerStats = {}
    for (const card of cards) {
        htmlStr = /*html*/`
        <div class="cardFrame">
            <img src="/assets/${card.attribute1}.png">
            <div class="cardUpper">
                <div class="cardName">${card.card_name}</div>
                <div class="gangs"> 
                    <img src="/assets/${card.gangs}">
                </div>
            </div>
            <div class="cardPhoto" style="overflow: hidden">
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
        playerDeckArray[counter].innerHTML = htmlStr;
        playerDeckArray[counter].setAttribute("card_id", card.id);
        counter++;
        if (counter > 4) {
            return playerStats;
        }
    }
}
