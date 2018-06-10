module.exports = class WebSocketControllerAction {
  constructor(params = {
    routes: [],       // Array of WebSocketRoutes
    controller: null, // WebSocketController
    request: null     // HTTP request
  }) {
    const data = JSON.parse(request.utf8Data)
    const method = data.method;
    const body = data.body;

    route = routes.find(route => route.method === method);
    controller[route.method](body);
  };
}
