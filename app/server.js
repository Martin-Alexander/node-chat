const redis           = require("redis");
const Sender          = require("./sender.js");
const ChatServer      = require("./chat_server.js");
const Message         = require("./message.js");

RedisClient = redis.createClient(6379, { db: 10 });
Sender.initialize(RedisClient)
  .then(() => Sender.all())
  .then(senders => console.log(senders));

new ChatServer(process.env.PORT || 3000);
