/**
 * Created by Hau Le on 5/22/17.
 */

var express = require('express')
var app = express();
var morgan = require("morgan");

app.use("/assets", express.static(__dirname + "/public"))

app.use(morgan("dev"))
app.set("view engine", "ejs")

var server = require('http').Server(app)
var io = require('socket.io')(server);

var listRooms = []
var listUsers = []


io.on('connection', function (socket) {
    console.log('người dùng đã kết nối vào ' + socket.id)
    //console.log(socket.adapter.rooms)
    socket.on('disconnect', function () {
        console.log('người dùng đã hủy kết nối vào ' + socket.id)

        logout()
    })

    //create room
    socket.on('create-room', function (data) {

        var flag = true
        var validate = false

        socket.room = data.room
        socket.pass = data.pass

        socket.userName = data.userName
        //console.log(socket.adapter.rooms)

        for (var i = 0; i < listRooms.length; i++) {
            if (listRooms[i].room === socket.room) {
                flag = false;
                if (listRooms[i].pass === socket.pass) {
                    validate = true
                }
            }
        }

        if (listUsers.indexOf(socket.userName) >= 0) {
            socket.emit('server-send-register-faill', socket.userName)
        }

        else {

            if (!validate && !flag) {
                socket.emit('server-send-pass-faill')
            }
            else {

                socket.join(data.room)
                if (flag) {
                    listRooms.push({ room: socket.room, pass: socket.pass })
                }

                listUsers.push(socket.userName)
                io.sockets.emit('server-send-rooms', listRooms)
                io.sockets.emit('server-send-users', listUsers)

                socket.emit('server-send-room-socket', socket.room)
                socket.emit('server-send-register-success', socket.userName)
            }
        }
    })

    socket.on('user-chart', function (data) {
        var object = { userName: socket.userName, message: data }
        io.sockets.in(socket.room).emit('server-chat', object)
    })

    socket.on('client-input-message', function () {
        var s = socket.userName + " đang nhập văn bản"
        io.sockets.emit('server-input-message', s)
    })
    socket.on('client-stop-input-message', function () {
        io.sockets.emit('server-stop-input-message')
    })

    socket.on('logout', function () {
        logout()
    })

    var logout = function () {
        var flag = true
        for (var i = 0; i < listUsers.length; i++) {
            if (listUsers[i] === socket.userName) {
                listUsers.splice(i, 1)
            }
        }

        io.sockets.emit('server-send-users', listUsers)
        socket.leave(socket.room)

        for (r in socket.adapter.rooms) {
            if (r === socket.room) {
                flag = false
                break;
            }
        }

        if (flag) {
            if (listRooms.length > 0) {
                for (var i = 0; i < listRooms.length; i++) {
                    if (listRooms[i].room === socket.room) {
                        listRooms.splice(i, 1)
                    }
                }
                io.sockets.emit('server-send-rooms', listRooms)
            }
        }
    }

})

//Settings
var port = process.env.PORT || 3000;
app.get('/', function (req, res) {
    res.render('index')
})
server.listen(port, function () {
    console.log("SocketIO is listening on port: " + port);
});