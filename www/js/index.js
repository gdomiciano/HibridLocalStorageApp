/* global $, Camera */

// simple chat app
var ChatApp = {};

ChatApp.accelerometer = (function () {
    var transforms = [
        '-webkit-transform',
        '-moz-transform',
        '-ms-transform',
        'transform'
    ];

    var accelerometerOptions = {
        'frequency': 2000
    };

    function accelerometerSuccess(data) {
        var rotate = {};
        var deg = 100;

        // console.log('rotate!', data);
        transforms.forEach(function (attr) {
            var rotateX = 'rotateX(' + (data.x * deg) + 'deg)';
            var rotateY = 'rotateY(' + (data.y * deg) + 'deg)';
            var rotateZ = 'rotateZ(' + (data.z * deg) + 'deg)';

            rotate[attr] = rotateX + rotateY + rotateZ;
        });
        // getUserList()
        $('#box-phone-d1').css(rotate);

        // navigator.accelerometer.clearWatch(watchID);
    }

    function accelerometerError() {
        console.log('error');
    }

    function accelerationWatch() {
        navigator.accelerometer.watchAcceleration(
            accelerometerSuccess,
            accelerometerError,
            accelerometerOptions
        );
    }

    function init() {
        console.log('init accelerometer');
        accelerationWatch();
    }

    return {
        'init': init
    };

})(); // accelerometer

ChatApp.communicator = (function () {

    var savedMessages = [];
    var $messageField = $('#message');
    var $messages = $('#messages');
    var destination = '';

    function getMessageTextHTML(msg) {
        return '<li>' + msg.value + '</li>';
    }

    function getMessageImgHTML(msg) {
        var src = 'data:image/jpeg;base64,' + msg.value;
        return '<li><img src="' + src + '"/></li>';
    }

    function appendMessage(msg) {
        if (msg.type === 'image64') {
            $messages.append(getMessageImgHTML(msg));
        }
        if (msg.type === 'text') {
            $messages.append(getMessageTextHTML(msg));
        }
        $messages.listview('refresh');
    }

    // @deprecated
    // function renderMessages() {
    //     if(savedMessages === []) {
    //         $messages.html('<li>no messages</li>');
    //         return;
    //     }
    //     $messages.html('');
    //     savedMessages.forEach(function (msg) {
    //         appendMessage(msg);
    //     });
    // }

    function addMessage(msg) {
        if (savedMessages.length === 0) {
            // clear "no messages" message
            $messages.html('');
        }
        savedMessages.push(msg);
        $messageField.val('');
        window.localStorage.setItem('messages', JSON.stringify(savedMessages));

        // renderMessages();
        appendMessage(msg);
    }

    function onSendMessage() {
        var message = {
            'type': 'text',
            'value': $messageField.val(),
            'to': destination
        };

        addMessage(message);
        // console.log('Envie Mensagem');

        ChatApp.socketClient.sendMessage(JSON.stringify(message));
    }

    function onGetPhotoSuccess(imageData) {
        var message = {
            'value': imageData,
            'type': 'image64'
        };
        addMessage(message);
    }

    function onGetPhotoError(error) {
        console.log('error: ', error);
    }

    function onGetPhoto() {
        // console.log('tap');
        var options = {
            'sourceType': Camera.PictureSourceType.PHOTOLIBRARY,
            'destinationType': Camera.DestinationType.DATA_URL
        };

        navigator.camera.getPicture(
            onGetPhotoSuccess, onGetPhotoError, options
        );
    }

    function onDeleteMessages() {
        window.localStorage.clear();
        savedMessages = [];
        $messages.html('<li>no messages</li>');
        $messages.listview('refresh');
        // console.log('Deleta Mensagens');
    }

    function initListeners() {
        $('#send-message').on('tap', onSendMessage);
        $('#delete-messages').on('tap', onDeleteMessages);
        $('#get-photo').on('taphold', onGetPhoto);
    }

    function getMesageFromSocket(msg) {
        console.log('msg', msg);
        savedMessages.push(msg);
        window.localStorage.setItem('messages',
            JSON.stringify(savedMessages)
        );
        $messages.append(getMessageTextHTML(msg));
        $messages.listview('refresh');
    }

    return {
        'init': initListeners,
        'getMesageFromSocket': getMesageFromSocket
    };

})(); // communicator

ChatApp.socketClient = (function () {
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
        ChatApp.communicator.getMesageFromSocket(message);
        console.log(message);
    }

    function onSocketClose() {
        console.log('disconnected');
    }

    function sendMessage(message) {
        if (socket && isConnected) {
            socket.send(message);
        }
    }

    function init() {
        if (socket && isConnected) {
            return;
        }
        socket = new WebSocket('ws://127.0.0.1:1337');
        socket.onmessage = onSocketMessage;
        socket.onerror = onSocketError;
        socket.onopen = onSocketOpen;
        socket.onclose = onSocketClose;
    }

    return {
        'init': init,
        'sendMessage': sendMessage
    };

})(); // socketClient

ChatApp.userListPage = (function () {
    var url = 'http://www.mocky.io/v2/56f0a2ef1000007f018ef257';
    console.log('socketClient', ChatApp.socketClient);

    function onPageBeforeChange(e, data) {
        var user = data.options.user;
        if (data.toPage === '#page') {
            console.log('change user', user);
            ChatApp.communicator.init(user);
            ChatApp.socketClient.init();
        }
    }

    function pageChangeTap() {
        console.log('evento change');
        $.mobile.pageContainer.pagecontainer('change', '#page', {
            'user': $(this).attr('data-user'),
            'transition': 'flip'
        });
    }

    function onGetUserListSuccess(data) {
        var $parent = $('#user-list');
        var usersHtml = '';

        data.forEach(function (user) {
            usersHtml += '<li>';
            usersHtml += '<a class="conversations" ';
            usersHtml += '  data-user="' + user.user + '" ';
            usersHtml += '  href="#page' + (user.user).replace('d', '') + '"';
            usersHtml += '>';
            usersHtml += '<div class="square">';
            usersHtml += '<img src="img/phone.png" alt="" ';
            usersHtml += '  id="box-phone-' + user.user + '"';
            usersHtml += '>';
            usersHtml += '</div>';
            usersHtml += 'Dupla ' + user.user;
            usersHtml += '</a>';
            usersHtml += '</li>';
        });
        $parent.append(usersHtml);

        $parent.listview().listview('refresh');
    }

    function getUserList() {
        $.ajax({
            'dataType': 'jsonp',
            'jsonpCallback': 'jsonCallback',
            'contentType': 'application/json',
            'url': url,
            'success': onGetUserListSuccess
        });
    }

    function initListeners() {
        $(document).on('tap', '.conversations', pageChangeTap);
        $(document).on('pagebeforechange', onPageBeforeChange);
    }

    function init() {
        initListeners();
        getUserList();
    }

    return {
        'mkey': 'a',
        'init': init
    };

})(); // userListPage

$(document).on('mobileinit', function () {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';

    ChatApp.userListPage.init();
});

document.addEventListener('deviceready', function onDeviceReady() {
    ChatApp.accelerometer.init();
}, false);

// function onTakePhoto() {
//     var options = {
//         sourceType : Camera.PictureSourceType.CAMERA,
//         destinationType : Camera.DestinationType.DATA_URL
//     }

//     navigator.camera.getPicture(
//          oneGetPhotoSuccess, onGetPhotoError, options
//     );
// }
