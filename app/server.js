const redis           = require("redis");
const Sender          = require("./sender.js");
const ChatServer      = require("./chat_server.js");
const Message         = require("./message.js");

const WebSocketRouter     = require("./web_socket_router");
const WebSocketController = require("./web_socket_controller");
const WebSocketRoute      = require("./web_socket_route");


const routes = [
  "new_message",
  "new_sender"
].map(methodName => new WebSocketRoute(methodName));

// const controller = new WebSocketController();
// const router = new WebSocketRouter(controller, routes);

const serverPort = process.env.PORT || 3000;
const redisPort = process.env.REDIS_URL || 6379

RedisClient = redis.createClient(redisPort, { db: 10 });

Sender.initialize(RedisClient)
  .then(() => Message.initialize(RedisClient))
  .then(() => {
    new ChatServer({
      port: serverPort,
      router: router,
      controller: controller
    });
  });
