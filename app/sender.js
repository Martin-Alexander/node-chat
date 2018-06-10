class Sender {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  };
  
  static initialize(redisClient) {
    Sender.RedisClient = redisClient;

    return new Promise((resolve, reject) => {
      Sender.RedisClient.get("next_sender_id", (error, reply) => {
        if (reply !== null) {
          Sender.nextSenderId = parseInt(reply);
          resolve();
        } else {
          Sender.RedisClient.set("next_sender_id", 1, (error, reply) => {
            resolve()
          });
        }
      });
    });
  };

  static find(id) {
    id = parseInt(id);

    return new Promise((resolve, reject) => {
      Sender.RedisClient.hget("senders", id, (error, reply) => {
        if (reply !== null) {
          resolve(new Sender(reply, id));
        } else {
          resolve(null);
        }
      });
    });
  };

  static all() {
    return new Promise((resolve, reject) => {
      Sender.RedisClient.hgetall("senders", (error, reply) => {
        const senders = Object.keys(reply).map(senderId => { 
          return new Sender(reply[senderId], senderId)
        });
        
        resolve(senders);
      });
    });
  };

  static getNextId() {
    return new Promise((resolve, reject) => {
      Sender.RedisClient.get("next_sender_id", (error, reply) => {
        resolve(parseInt(reply));
      });
    });
  };

  static incrementNextId() {
    return new Promise((resolve, reject) => {
      Sender.getNextId().then((nextId) => {
        Sender.RedisClient.set("next_sender_id", nextId + 1, (error, reply) => {
          resolve();
        });
      });
    });
  };

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
      Sender.RedisClient.hdel("senders", this.id);
    });
  };

  update(resolve, reject) {
    Sender.RedisClient.hset("senders", this.id, this.name, (error, reply) => {
      resolve(this)
    });
  };
  
  insert(resolve, reject) {
    Sender.getNextId().then((nextId) => {
      Sender.RedisClient.hset("senders", nextId, this.name, (error, reply) => {
        Sender.incrementNextId().then(() => resolve(this));
      });
    });
  };
};

module.exports = Sender;
