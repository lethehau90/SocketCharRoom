var socketjs = {

    init: function () {
        socketjs.resgisterEvent();
        socketjs.loadForm()
    },

    resgisterEvent: function () {
        var socket = io.connect('/')

        socket.on('server-send-rooms', function (data) {
            
            $("#boxContent").html('')
            data.forEach(function (r) {
                $("#boxContent").append("<div class='room'>" + r.room + "</div>")
            });
        })

        socket.on('server-send-users', function (data) {
            $("#boxContentonline").html('')
            data.forEach(function (r) {
                $("#boxContentonline").append("<div class='user'>" + r + "</div>")
            });
        })

        socket.on('server-send-room-socket', function (data) {
            $("#currentRoom").html(data)
        })

        socket.on('server-chat', function (data) {
            var html = "";
            html = "<div class='ms'><b>" + data.userName + "</b> : " + data.message + "</div>"
            $("#listMessage").append(html)
        })

        socket.on('server-send-register-faill', function (data) {
            alert(data + " đã được đăng ký rồi")
            socketjs.hideForm()
        })

        socket.on('server-send-pass-faill', function () {
            alert("Mật khẩu bảo vệ phòng chát không đúng")
            socketjs.hideForm()
        })

        socket.on('server-send-register-success', function (data) {
            $("#currentUser").html(data)
            socketjs.showForm()
        })

        socket.on('server-stop-input-message', function (data) {
            $("#info").html("")
        })

        socket.on('server-input-message', function (data) {
            $("#info").html("<img width = '25px' src='/assets/img/typing.gif'/> " + data)
        })

        $('#btnCreateRoom').off('click').on('click', function () {
            if ($('#txtRoom').val() !== "" && $('#txtUsername').val() !== "" && $('#txtPass').val() !== "") {
                var data = { userName: $('#txtUsername').val(), room: $('#txtRoom').val(), pass : $('#txtPass').val() }
                socket.emit('create-room', data)
                $('#txtRoom').val("")
                $('#txtUsername').val("")
                $('#txtPass').val("")
            }
        })

        $('#btnSendMessage').off('click').on('click', function () {
            if ($('#txtMessage').val() !== "") {
                socket.emit('user-chart', $('#txtMessage').val())
                $('#txtMessage').val("")
            }
        })

        $("#txtMessage").keypress(function (e) {
            if (e.which == 13) {
                if ($('#txtMessage').val() !== "") {
                    socket.emit('user-chart', $('#txtMessage').val())
                    $('#txtMessage').val("")
                    socketjs.scrollToBottom('listMessage')
                }
            }
        })

        $("#btnLogout").off('click').on('click', function () {
            socket.emit("logout")
            socketjs.hideForm()
        })

        $("#txtMessage").focusin(function () {
            socket.emit('client-input-message')
        })

        $("#txtMessage").focusout(function () {
            socket.emit('client-stop-input-message')
        })
    },

    showForm: function () {
        $('#loginRoom').hide(1000)
        $('#chatRoom').show(2000)
    },

    hideForm: function () {
        $('#loginRoom').show(2000)
        $('#chatRoom').hide(1000)
    },

    loadForm: function () {
        $('#loginRoom').show()
        $('#chatRoom').hide()
    },

    scrollToBottom: function (id) {
        $("#" + id).animate({ scrollTop: $("#" + id)[0].scrollHeight });
    }

}

socketjs.init()