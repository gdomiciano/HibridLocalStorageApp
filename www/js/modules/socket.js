/* global $ */

(function () {
    var isConnected = false;
    var socket = null;

    function onSocketError(error) {
        console.log(error);
    }

    function onSocketOpen(event) {
        console.log('isConnected', event);
        isConnected = true;
    }

    function onSocketMessage(event) {
        var message = JSON.parse(event.data);
        $(document).trigger('message.ChatApp', message);
    }

    function onSocketClose() {
        console.log('disconnected');
    }

    function sendMessage(event, message) {
        if (socket && isConnected) {
            socket.send(JSON.stringify(message));
        }
    }

    function initSocketClient() {
        console.log('initSocketClient');
        if (socket && isConnected) {
            return;
        }
        console.log('initSocketClient2');
        socket = new WebSocket('ws://127.0.0.1:1337');
        socket.onmessage = onSocketMessage;
        socket.onerror = onSocketError;
        socket.onopen = onSocketOpen;
        socket.onclose = onSocketClose;

        $(document).on('sendMessage.ChatApp', sendMessage);
    }

    $(document).on('mobileinit', function () {
        initSocketClient();
    });


})(); // socketClient
