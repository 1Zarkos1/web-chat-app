let socket = io();
let username = document.cookie
  .match("username=(.+?)($|;)")[1]
  .replace(/"/g, "");
let userlistNode = document.querySelector(".userlist");
let userlist = [];
document.querySelector(
  ".chat-header"
).innerText = `Welcome to chat ${username}!`;
window.onbeforeunload = () => {
  socket.disconnect();
  return False;
};

socket.on("connect", () => {
  console.log("connected");
});

socket.on("message", (data) => {
  addMessage({ type: "message", ...data });
});

socket.on("userlist", (data) => {
  userlist = [];
  userlistNode.innerHTML = "";
  userlist = data.sort();
  userlist.map((username) => {
    updateUserList({ type: "userlist", data: username });
  });
});

socket.on("system", (data) => {
  let message = data.type == "connect" ? "connected to" : "disconnected from";
  addMessage({ data: `${data.data} ${message} chat` });
  data.data != username && updateUserList(data);
});

function sendMessage() {
  let input = document.getElementById("message");
  socket.emit("message", input.value);
  input.value = "";
}

function updateUserList({ type, data }) {
  if (type == "connect") {
    userlist.push(data);
    userlist.sort();
  }
  let index = userlist.indexOf(data);
  console.log(index);
  if (type == "connect" || type == "userlist") {
    let usernode = document.createElement("div");
    usernode.setAttribute("class", "username");
    usernode.innerText = data;
    console.log(userlistNode.querySelector(`div:nth-of-type(${index}`));
    console.log(usernode);
    index == 0
      ? userlistNode.prepend(usernode)
      : userlistNode.querySelector(`div:nth-of-type(${index}`).after(usernode);
  } else {
    console.log(userlistNode.querySelector(`div:nth-of-type(${index + 1}`));
    userlistNode.removeChild(
      userlistNode.querySelector(`div:nth-of-type(${index + 1}`)
    );
  }
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
