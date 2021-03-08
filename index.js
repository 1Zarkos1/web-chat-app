let socket = io();
let username = document.cookie.match("username=(.+?)($|;)")[1];
let userlistNode = document.querySelector(".userslist");
let userlist = [];
document.querySelector(".username").innerText = `Welcome to chat ${username}!`;
window.onbeforeunload = () => socket.disconnect();

socket.on("connect", () => {
  console.log("connected");
});

socket.on("message", (data) => {
  addMessage({ type: "message", ...data });
});

socket.on("system", (data) => {
  let message = data.type == "connect" ? "connected to" : "disconnected from";
  addMessage({ data: `${data.data} ${message} chat` });
});

function sendMessage() {
  let input = document.getElementById("message");
  socket.emit("message", input.value);
  input.value = "";
}

function logout() {
  socket.disconnect();
  window.location.href = "/logout";
}

function addMessage({ sender, data }) {
  let chat = document.querySelector(".chat-window");
  let messageClass = !sender
    ? "system"
    : sender == username
    ? "chat-message self"
    : "chat-message";
  let messageDiv = document.createElement("div");
  messageDiv.setAttribute("class", messageClass);
  messageDiv.innerText = sender ? `${sender}: ${data}` : `${data}`;
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
}
