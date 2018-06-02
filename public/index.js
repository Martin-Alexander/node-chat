const websocket = new WebSocket("ws://localhost:3000", "echo-protocol");

websocket.onopen = (event) => {
  websocket.send("Hey!");
};

websocket.onmessage = (event) => {
  console.log(event.data);
}