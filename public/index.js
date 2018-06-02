const inputField = document.getElementById("input-field");
const sendButton = document.getElementById("send-button");
const messageList = document.getElementById("message-list");

const websocket = new WebSocket("ws://localhost:3000", "echo-protocol");

const sendMessage = () => {
  const userInput = inputField.value;
  inputField.value = "";

  websocket.send(userInput);
};

const recieveMessage = (message) => {
  messageList.insertAdjacentHTML("afterbegin", `
    <li>${message}</li>
  `)
};

websocket.onopen = (event) => {
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
