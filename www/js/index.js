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
        $('#box-phone-d1').css(rotate);
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

    function initAccelerometer() {
        console.log('init accelerometer');
        accelerationWatch();
    }

    return {
        'init': initAccelerometer
    };

})(); // accelerometer

ChatApp.communicator = (function () {

    var savedMessages = [];
    var $messageField = $('#message');
    var $messages = $('#messages');
    var receiver = '';

    function getMessageTextHTML(msg) {
        return '<li>' + msg.value + '</li>';
    }

    function getMessageImgHTML(msg) {
        var src = 'data:image/jpeg;base64,' + msg.value;
        return '<li><img src="' + src + '"/></li>';
    }

    function showMessage(msg) {
        console.log('showMessage', msg);
        if (savedMessages.length === 0) {
            // clear "no messages" message
            $messages.html('');
        }

        if (msg.type === 'image64') {
            $messages.append(getMessageImgHTML(msg));
        }
        if (msg.type === 'text') {
            $messages.append(getMessageTextHTML(msg));
        }
        $messages.listview('refresh');
    }

    function addLocalMessage(msg) {
        console.log('addLocalMessage', msg);
        savedMessages.push(msg);
        window.localStorage.setItem('messages', JSON.stringify(savedMessages));
    }

    function sendTextMessage() {
        var message = {
            'type': 'text',
            'value': $messageField.val(),
            'to': receiver
        };
        $messageField.val('');

        ChatApp.socketClient.sendMessage(JSON.stringify(message));
    }

    function onGetPhotoSuccess(imageData) {
        var message = {
            'value': imageData,
            'type': 'image64'
        };
        addLocalMessage(message);
    }

    function onGetPhotoError(error) {
        console.log('error: ', error);
    }

    function getPhotoFromLibrary() {
        var options = {
            'sourceType': Camera.PictureSourceType.PHOTOLIBRARY,
            'destinationType': Camera.DestinationType.DATA_URL
        };

        navigator.camera.getPicture(
            onGetPhotoSuccess, onGetPhotoError, options
        );
    }

    function deleteMessages() {
        window.localStorage.clear();
        savedMessages = [];
        $messages.html('<li>no messages</li>');
        $messages.listview('refresh');
    }

    function initCommunicator() {
        $('#send-message').on('tap', sendTextMessage);
        $('#delete-messages').on('tap', deleteMessages);
        $('#get-photo').on('taphold', getPhotoFromLibrary);
    }

    function receiveMessage(msg) {
        console.log('receiveMessage', msg);
        showMessage(msg);
        addLocalMessage(msg);
    }

    return {
        'init': initCommunicator,
        'receiveMessage': receiveMessage
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
        console.log('onSocketMessage', message);
        ChatApp.communicator.receiveMessage(message);
    }

    function onSocketClose() {
        console.log('disconnected');
    }

    function sendMessage(message) {
        if (socket && isConnected) {
            socket.send(message);
        }
    }

    function initSocketClient() {
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
        'init': initSocketClient,
        'sendMessage': sendMessage
    };

})(); // socketClient

ChatApp.usersListPage = (function () {
    var url = 'http://www.mocky.io/v2/56f0a2ef1000007f018ef257';

    function initChat(receiver) {
        ChatApp.communicator.init(receiver);
        ChatApp.socketClient.init();
    }

    function onPageBeforeChange(e, data) {
        var receiver = data.options.receiver;

        console.log('onPageBeforeChange');
        console.log('data.toPage', data.toPage);

        if (data.toPage === '#page') {
            // navigation is about to commence
            console.log('talk to', receiver);
            initChat(receiver);
        } else {
            // the destination page has been loaded and navigation will continue
            $('#receiver').html(receiver);
        }
    }

    function goToChatPage() {
        console.log('goToChatPage');
        $.mobile.pageContainer.pagecontainer('change', '#page', {
            'receiver': $(this).attr('data-user'),
            'transition': 'flip'
        });
    }

    function buildUsersList(data) {
        var $usersList = $('#user-list');
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
        $usersList.append(usersHtml);

        $usersList.listview().listview('refresh');
    }

    function getUserList() {
        $.ajax({
            'dataType': 'jsonp',
            'jsonpCallback': 'jsonCallback',
            'contentType': 'application/json',
            'url': url,
            'success': buildUsersList
        });
    }

    function initListeners() {
        $(document).on('tap', '.conversations', goToChatPage);
        $(document).on('pagebeforechange', onPageBeforeChange);
    }

    function initUsersListPage() {
        initListeners();
        getUserList();
    }

    return {
        'mkey': 'a',
        'init': initUsersListPage
    };

})(); // usersListPage

$(document).on('mobileinit', function () {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';

    ChatApp.usersListPage.init();
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
