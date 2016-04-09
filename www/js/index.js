// simple chat app
var communicator = (function () {

    var savedMessages = [];
    var $messageField = $('#message');
    var $messages = $('#messages');
    var destination;

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
        $messages.listview("refresh");
    }

    // deprecated
    function renderMessages(refresh) {
        if(savedMessages === []) {
            $messages.html('<li>no messages</li>');
            return;
        }
        $messages.html('');
        savedMessages.forEach(function (msg) {
            appendMessage(msg); 
        });
    }

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
            type: 'text',
            value: $messageField.val(), 
            to:destination
        }
        addMessage(message);
        // console.log('Envie Mensagem');

        // socketClient.sendMessage(message.value)
        socketClient.sendMessage(JSON.stringify(message));
    }


    function onGetPhoto() {
        // console.log('tap');
        var options = {
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType: Camera.DestinationType.DATA_URL
        }
        navigator.camera.getPicture(onGetPhotoSuccess, onGetPhotoError, options);
    }

    function onGetPhotoSuccess(imageData) {
        var message = {
            value: imageData,
            type:'image64'
        }
        addMessage(message);
    }

    function onGetPhotoError(error) {
        console.log('error: ', error);
    }

    function onDeleteMessages() {
        window.localStorage.clear();
        savedMessages = [];
        $messages.html('<li>no messages</li>');
        $messages.listview("refresh");
        // console.log('Deleta Mensagens');
    }

    function initListeners(user) {
        
        $('#send-message').on('tap', onSendMessage);
        $('#delete-messages').on('tap', onDeleteMessages);
        $('#get-photo').on('taphold', onGetPhoto);
    }

    return {
        init: initListeners,
        getMesageFromSocket: function(msg){
            console.log('msg',msg)
            savedMessages.push(msg);
            window.localStorage.setItem('messages', JSON.stringify(savedMessages));
            $messages.append(getMessageTextHTML(msg));
            $messages.listview("refresh");
        }
    }

})();

// simple chat app
var accelerometer = (function () {
    var watchID;

    var transforms = [
        '-webkit-transform',
        '-moz-transform',
        '-ms-transform',
        'transform'
    ]

    var accelerometerOptions = {
        frequency: 2000
    }

    function accelerometerSuccess(data) {
        var rotate = {};

        // console.log('rotate!', data);
        transforms.forEach(function (attr) {
            var rotateX = 'rotateX(' + (data.x * 100) + 'deg)';
            var rotateY = 'rotateY(' + (data.y * 100) + 'deg)';
            var rotateZ = 'rotateZ(' + (data.z * 100) + 'deg)';

            rotate[attr] = rotateX + rotateY + rotateZ;
        });
        // getUserList()
        $('#box-phone-d1').css(rotate);

        // navigator.accelerometer.clearWatch(watchID);
    };

    function accelerometerError() {
        console.log('error');
    };

    function accelerationWatch() {
        watchID = navigator.accelerometer.watchAcceleration(
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
        init: init
    };

})();

var userListPage = (function(){
    var url ='http://www.mocky.io/v2/56f0a2ef1000007f018ef257'

    function onPageBeforeChange(e, data) {
        if(data.toPage === "#page") {
            var user = data.options.user;
            console.log('change user', user);
            communicator.init(user);
            socketClient.init();
        }
    }

    function pageChangeTap(){
        console.log('evento change')
        $.mobile.pageContainer.pagecontainer('change', '#page', {
            user: $(this).attr('data-user'),
            transition: 'flip'
        });

    }

    var onGetUserListSuccess = function(data){
        var $parent = $('#user-list')
        data.forEach(function(user){

        var newUser =  ' <li>';
        newUser+='<a class="conversations" data-user="' + user.user + '" href="#page'+(user.user).replace('d','')+'">';
        newUser+='<div class="square">';
        newUser+='<img src="img/phone.png" alt="" id="box-phone-' + user.user + '">';
        newUser+='</div>';
        newUser+='Dupla ' + user.user;
        newUser+='</a>';
        newUser+='</li>';
            $parent.append(newUser);
        });
        $parent.listview("refresh");
        $(document).on('tap','.conversations',pageChangeTap);
        $(document).on('pagebeforechange', onPageBeforeChange);
    }

    var getUserList = function(){
        $.ajax({
            dataType: 'jsonp',
            jsonpCallback: 'jsonCallback',
            contentType: 'application/json',
            url:url,
            success: onGetUserListSuccess
        })
    }

    return{
        mkey:'a',
        init:function(){
            getUserList();          
        }
    }
})();


var socketClient = (function () {
    var connected = false;
    var socket;

    function onSocketError(error) {
        console.log(error);
    }

    function onSocketOpen(event) {
        console.log('connected');
        connected = true;
    }

    function onSocketMessage (event) {
        var message = JSON.parse(event.data);
        communicator.getMesageFromSocket(message)
        console.log( message);
    }

    function onSocketClose() {
        console.log('disconnected');
    }

    function sendMessage(message) {
        if(socket && connected) {
            socket.send(message);
        }
    }

    function init() {
        socket = new WebSocket('ws://127.0.0.1:1337');
        socket.onmessage = onSocketMessage;
        socket.onerror = onSocketError;
        socket.onopen = onSocketOpen;
        socket.onclose = onSocketClose;
    }
    return{
        init:init,
        sendMessage: sendMessage

    }


})();

 $(document).on("mobileinit", function () {
    $.mobile.defaultPageTransition = "none";
    $.mobile.defaultDialogTransition = "none";

    userListPage.init();
    accelerometer.init();
});

// function onTakePhoto() {
//     var options = {
//         sourceType : Camera.PictureSourceType.CAMERA,
//         destinationType : Camera.DestinationType.DATA_URL
//     }

//     navigator.camera.getPicture(oneGetPhotoSuccess, onGetPhotoError, options);
// }