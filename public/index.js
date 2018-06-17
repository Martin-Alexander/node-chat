const inputField = document.getElementById("input-field");
const sendButton = document.getElementById("send-button");
const messageList = document.getElementById("message-list");

// wss://hello-cli.herokuapp.com/

const websocket = new WebSocket("ws://localhost:3000", "echo-protocol");

const sendMessage = () => {
  const userInput = inputField.value;
  inputField.value = "";

  sendWebsocketDataMessage("newMessage", userInput);
};

const recieveMessage = (message) => {
  messageList.insertAdjacentHTML("afterbegin", `
    <li>${message}</li>
  `)
};

const sendWebsocketDataMessage = (method, body) => {
  const payload = JSON.stringify({ method: method, body: body });
  websocket.send(payload);
};

websocket.onopen = () => {
  document.addEventListener("keyup", (event) => {
    if (event.keyCode === 13 && inputField === document.activeElement) {
      sendMessage();
    }
  });
  
  sendButton.addEventListener("click", () => {
    sendMessage();
  });  
};

websocket.onmessage = (event) => {
  recieveMessage(event.data);
}
