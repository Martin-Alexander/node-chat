const WebSocketServer = require("websocket").server;
const finalhandler    = require('finalhandler');
const serveStatic     = require('serve-static');
const HTTP            = require("http");
const fs              = require("fs");

class ChatServer {
  constructor(port) {
    console.log("==============CONSTRUCTOR==================");
    this.initializeHTTPServer(port);
    this.initializeWebsocketServer();
    
    this.liveWebsocketConnections = [];
  };
  
  initializeHTTPServer(port) {
    const serve = serveStatic("./public/");

    this.server = HTTP.createServer(function(request, response) {
      console.log("HERE");

      const done = finalhandler(request, response);
      serve(request, response, done);
    });

    this.server.listen(port, (error) => {
      if (error) { return console.log(error) };
      console.log(`server is listening on ${port}`)
    })

    console.log("==============SERVER UP==================");
  };

  initializeWebsocketServer() {
    this.webSocketServer = new WebSocketServer({
        httpServer: this.server,
        autoAcceptConnections: false
    });

    this.webSocketServer.on("request", (request) => this.setupNewConnection(request));
  };
  
  // Takes a request, creates a connection, attaches the on message event listener, and adds the
  // connection to the list of live connections
  setupNewConnection(request) {
    const connection = request.accept("echo-protocol", request.origin);
    connection.on("message", (message) => this.relayMessageToAllClients(message));
    this.addConnectionToList(connection);
  }

  // Adds the connection to the list of live websocket connections
  addConnectionToList(connection) {
    this.liveWebsocketConnections.push(connection);
  };
  
  // Given a message relays across all connections in the list of live connections
  relayMessageToAllClients(message) {
    this.liveWebsocketConnections.forEach((connection) => {
      const messageText = message.utf8Data;
      this.sendMessageToConnection(messageText, connection);
    });
  };

  // Sends message text to a given connection
  sendMessageToConnection(messageText, connection) {
    console.log(`${Date.now()} -- transmitting message: "${messageText}"`);
    connection.sendUTF(messageText)
  };
}

new ChatServer(process.env.PORT || 3000);

console.log(process.env.PORT);
console.log("==============OUTSIDE==================");
