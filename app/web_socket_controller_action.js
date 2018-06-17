module.exports = class WebSocketControllerAction {
  constructor(params = {
    routes: [],       // Array of WebSocketRoutes
    controller: null, // WebSocketController
    request: null     // HTTP request
  }) {
    this.request = params.request;
    this.controller = params.controller;
    this.routes = params.routes;

    this.run();
  };
  
  run() {
    const data = JSON.parse(this.request.utf8Data)
    const method = data.method;
    const body = data.body;
  
    const route = this.routes.find(route => route.method === method);

    this.controller[route.method](body);
  }
}
