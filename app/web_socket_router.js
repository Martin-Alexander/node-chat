const WebSocketRoute = require("./web_socket_route");
const WebSocketControllerAction = require("./web_socket_controller_action");

module.exports = class WebSocketRouter {
  constructor(webSocketController, routes) {
    this.webSocketController =  webSocketController;
    this.initialize(routes);
  };

  initialize(rawRoutes) {
    this.routes = rawRoutes.map((webSocketRoute) => {
      return new WebSocketRoute(webSocketRoute);
    });
  };

  respond(request) {
    new WebSocketControllerAction({
      request: request,
      routes: this.routes,
      controller: this.webSocketController
    });
  };
}
