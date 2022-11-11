const express = require("express");
const app = express();
const server = require("http").Server(app)
const io = require("socket.io")(server)
var cors = require('cors')
const serverless = require("serverless-http");
const port = 3001;
const router = express.Router();

app.use(cors())
let users = []

router.get("/", (req, res) => {
    res.json({
      hello: "welcome"
    });
  });

router.get("/hi", (req, res) => {
  res.json({
    hello: "hi!"
  });
});

router.get("/text", (req, res) => {
    res.json({
      hello: "text"
    });
  });

app.use(`/.netlify/functions/api`, router);


const addUser = (userName, roomId) => {
    users.push({
        userName: userName,
        roomId: roomId
    })
}

const userLeave = (userName) => {
    users = users.filter(user => user.userName != userName)
}

const getRoomUsers = (roomId) => {
    return users.filter(user => (user.roomId == roomId))
}

io.on("connection", socket => {
    console.log("I am Connected")
    socket.on("join-room", ({roomId, userName}) => {
        console.log("User joined room")
        console.log(roomId);
        console.log(userName);
        socket.join(roomId)
        addUser(userName, roomId)
        socket.to(roomId).emit("user-connected", userName)
        io.to(roomId).emit("all-users", getRoomUsers(roomId))

        socket.on("disconnect", () => {
            console.log("disconnected")
            socket.leave(roomId);
            userLeave(userName)
            io.to(roomId).emit("all-users", getRoomUsers(roomId))
        })

    })
})

server.listen(port, () => {
    console.log(`Zoom Clone API listening on Port ${port}`)
    
})

module.exports = app;
module.exports.handler = serverless(app);
