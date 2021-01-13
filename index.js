const express = require("express");
const path = require("path");
//create express
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
//get method 
const {
  storeMessage,
  getMessages,
  hasUser,
  registerUser,
} = require("./database/index");

async function sendAllMessagesToNewClient(socket) {
  const messages = await getMessages();
  const broadContent = JSON.stringify(messages);
  socket.emit("send_all_messages", broadContent);
}

async function sendNewMessageToAllClients(io, message) {
  const broadContent = message;
  io.emit("send_new_message", broadContent);
}

let socket = null;
io.on("connection", (s) => {
  socket = s;
  socket.on("a_new_message", async (msg) => {
    const info = JSON.parse(msg);
    const timestamp = new Date().getTime();
    info.timestamp = timestamp;
    sendNewMessageToAllClients(io, JSON.stringify(info));
    await storeMessage(info.name, info.message, timestamp);
  });
  sendAllMessagesToNewClient(socket);
});

app.use(express.static('view'));

//Response to the client
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./view/index.html"));
});


//Log in remind
app.get("/signin", async (req, res) => {
  try {
    const { name, pwd } = req.query;
    const has_user = await hasUser(name, pwd);
    if (!has_user) {
      res.send({
        status: 1,
        msg: "there an error in username or password!",
        data: {},
      });
      return;
    }
    res.send({
      status: 0,
      msg: "ok",
      data: {},
    });
  } catch (err) {
    res.send({
      status: 1,
      msg: err.message,
      data: {},
    });
  }
});

app.get("/signup", async (req, res) => {
  try {
    const { name, pwd } = req.query;
    
    const has_user = await hasUser(name, pwd);
    if (has_user) {
      res.send({
        status: 1,
        msg: "the use has registered!",
        data: {},
      });
      return;
    }

    const register_res = await registerUser(name, pwd);
    res.send({
      status: 0,
      msg: "ok",
      data: {},
    });
  } catch (err) {
    
    res.send({
      status: 1,
      msg: err.message,
      data: {},
    });
  }
});

server.listen(3000);
