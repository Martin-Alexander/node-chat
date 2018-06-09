const Sender = require("./sender.js")
const { promisify } = require('util');

var lpushAsync,
  llenAsync,
  lrangeAsync,
  hsetAsync,
  hgetallAsync,
  delAsync,
  lremAsync;

const initializeAsyncRedisCommands = (redisClient) => {
  lpushAsync   = promisify(redisClient.lpush).bind(redisClient);
  llenAsync    = promisify(redisClient.llen).bind(redisClient);
  lrangeAsync  = promisify(redisClient.lrange).bind(redisClient);
  hsetAsync    = promisify(redisClient.hset).bind(redisClient);
  hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
  delAsync     = promisify(redisClient.del).bind(redisClient);
  lremAsync    = promisify(redisClient.lrem).bind(redisClient);
}

class Message {
  constructor(sender, content, id) {
    this.sender = sender;
    this.content = content;
    this.id = id;
  };
  
  static initialize(redisClient) {
    this.RedisClient = redisClient;
    initializeAsyncRedisCommands(redisClient);

    return new Promise((resolve) => {
      this.initializeNextMessageId().then(() => resolve())
    });
  };
  
  static initializeNextMessageId() {
    return new Promise((resolve, reject) => {
      this.RedisClient.get("next_message_id", (error, reply) => {
        if (reply !== null) {
          this.nextMessageId = parseInt(reply);
          resolve(Sender);
        } else {
          this.RedisClient.set("next_message_id", 1, (error, reply) => resolve(Sender));
        }
      });
    });
  };
  
  static all() {
    return new Promise((resolve, reject) => {

      llenAsync("message_id_list")
        .then((lengthOfMessageIdList) => {
          return lrangeAsync(("message_id_list"), 0, lengthOfMessageIdList - 1);
        })
        .then((messageIdList) => {
          debugger
          return Promise.all(messageIdList.map(messageId => this.find(messageId)));
        })
        .then(values => resolve(values));
    });
  };

  static find(id) {
    return new Promise((resolve, reject) => {
      hgetallAsync(this.getHashName(id))
        .then((reply) => {
          Sender.find(reply.sender_id).then((sender) => {
            if (reply !== null) {
              resolve(new Message(sender, reply.content, reply.id));
            } else {
              resolve(null);
            }
          });
        });
    });
  };


  static getNextId() {
    return new Promise((resolve, reject) => {
      this.RedisClient.get("next_message_id", (error, reply) => resolve(parseInt(reply)));
    });
  };

  static incrementNextId() {
    return new Promise((resolve, reject) => {
      this.getNextId().then((nextId) => {
        this.RedisClient.set("next_message_id", nextId + 1, (error, reply) => resolve());
      });
    });
  };

  static getHashName(id) { return `message_${id}` };

  save() {
    return new Promise((resolve, reject) => {
      if (this.id === undefined) {
        this.insert(resolve, reject);
      } else {
        this.update(resolve, reject);
      }
    });
  };
  
  destroy() {
    return new Promise((resolve, reject) => {
      delAsync(Message.getHashName(this.id))
        .then(() => lremAsync("message_id_list", 0, this.id))
        .then(() => resolve(true));
    });
  };

  update(resolve, reject) {
    hsetAsync(Message.getHashName(id), "sender_id", this.sender.id)
      .then(() => hsetAsync(Message.getHashName(id), "content", this.content))
      .then(() => resolve(this));
  };
  
  insert(resolve, reject) {
    Message.getNextId().then((nextId) => {
      lpushAsync("message_id_list", nextId)
        .then(() => Message.incrementNextId())
        .then(() => hsetAsync(Message.getHashName(nextId), "id", nextId))
        .then(() => hsetAsync(Message.getHashName(nextId), "sender_id", this.sender.id))
        .then(() => hsetAsync(Message.getHashName(nextId), "content", this.content))
        .then(() => resolve(this));
    });
  };
};

module.exports = Message;
