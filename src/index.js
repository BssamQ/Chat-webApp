const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const { generateMessage, generateLocation } = require("./utils/Messages")
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, "../public")

// const viewPath = path.join(__dirname, "../templates/views")

// app.set("view engine", "hbs")
// app.set("views", viewPath)

app.use(express.static(publicDirectoryPath))

const port = process.env.PORT

app.get("/home", async (req, res) => {
    try {
        res.sendFile(path.join(publicDirectoryPath, "home.html"))
    } catch (e) {
        res.status(400).send("You are not welcome")
    }
})

io.on("connection", (socket) => {
    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message", generateMessage("Welcome!", user.username))
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined the room!`))
        io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        callback()
    })
    //#2
    socket.on("send", (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback("Profanity is not allwoed!")
        }
        const user = getUser(socket.id)
        io.to(user.room).emit("receiveMessage", generateMessage(message, user.username))//#3
        callback("Message Send!")
    })

    socket.on("sendLocation", (cords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateLocation(`https://google.com/maps?q=${cords.lantitude},${cords.longitude}`, user.username))
        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMessage(`${user.username} has left :'(`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})



server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})


//notes
//---------
//Websocket usual methods:-
// socket.emit: send an event to a specific client 
// io.emit: send an event to every connected client 
// socket.broadcast.emit: end an event to evry connected client except the sender
//Websocket rooms methods:-
// io.to(*room name/no.*).emit: emit an event to everyone in "room name/number"
// socket.broadcast.to(**).emit