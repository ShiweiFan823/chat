const MongoClient = require("mongodb").MongoClient;
const dbName = `online-chat`;
const tableName = `message-list`;
const url = `mongodb://localhost:27017/`;

let db = null;

// connect mongodb
function connect() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, client) {
      if (err) {
        console.log(`connect fail`, err);
        reject(err);
        return;
      }
      db = client.db(dbName);
      resolve();
    });
  });
}

// judge there whether is this user or not by name and pwd
async function hasUser(name, pwd) {
  if (!db) {
    await connect();
  }

  return new Promise((resolve, reject) => {
    const user = { name, pwd };
    db.collection("users")
      .find(user)
      .toArray(function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res.length === 1);
        }
      });
  });
}

// create a new user note
async function registerUser(name, pwd) {
  if (!db) {
    await connect();
  }

  return new Promise((resolve, reject) => {
    const newUser = { name, pwd };
    db.collection("users").insertOne(newUser, function (err, res) {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}

// create a new message note
async function storeMessage(name, message, timestamp) {
  if (!db) {
    await connect();
  }

  return new Promise((resolve, reject) => {
    if (db) {
      const newMessage = { name, message, timestamp };
      db.collection(tableName).insertOne(newMessage, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    }
  });
}

// get all message notes
async function getMessages() {
  if (!db) {
    await connect();
  }
  return new Promise((resolve, reject) => {
    if (db) {
      db.collection(tableName)
        .find({})
        .toArray(function (err, result) {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
    }
  });
}

module.exports = {
  storeMessage,
  getMessages,
  hasUser,
  registerUser
};
