const socket = io.connect();

socket.emit("hello", { msg: `{joinRoom.js} Hello from Client` });

const createRoom = document.querySelector("#create-room");
const joinRoom1 = document.querySelector("#join-room-1");
const joinRoom2 = document.querySelector("#join-room-2");
const joinRoom3 = document.querySelector("#join-room-3");
const chat = document.querySelector("#chat");

// Buttons Action
createRoom.addEventListener("click", async () => {
  new_room_id = "room-1";

  socket.emit("createRoom", new_room_id);
});

joinRoom1.addEventListener("click", async () => {
  window.location.href = `/game.html?id=${"room-1"}&type=${"guest"}`;
});

joinRoom2.addEventListener("click", async () => {
  window.location.href = `/game.html?id=${"room-2"}&type=${"guest"}`;
});

joinRoom3.addEventListener("click", async () => {
  window.location.href = `/game.html?id=${"room-3"}&type=${"guest"}`;
});

chat.addEventListener("click", async () => {
  socket.emit("chat", { msg: "Hello Hello Hello" });
});

socket.on("assignRoom", (room, type) => {
  window.location.href = `/game.html?id=${room}&type=${type["type"]}`;
});

socket.on("chat", (data) => {
  console.log("`chat`", data);
});

document.querySelector(".logout").addEventListener("click", async function () {
  const resp = await fetch("/logout");
  const result = await resp.json();
  if (result.success === true) {
    await Swal.fire("Logout success", "Bye!", "success");

    window.location.href = "./index.html";
    return;
  }
});
