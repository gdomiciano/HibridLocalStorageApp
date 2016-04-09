// simple chat app
var communicator = (function () {

    var savedMessages = [];
    var $messageField = $('#message');
    var $messages = $('#messages');

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
            value: $messageField.val()
        }
        addMessage(message);
        // console.log('Envie Mensagem');
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

    function initListeners() {
        $('#send-message').on('tap', onSendMessage);
        $('#delete-messages').on('tap', onDeleteMessages);
        $('#get-photo').on('taphold', onGetPhoto);
    }

    return {
        init: initListeners
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

        console.log('rotate!', data);
        transforms.forEach(function (attr) {
            var rotateX = 'rotateX(' + (data.x * 100) + 'deg)';
            var rotateY = 'rotateY(' + (data.y * 100) + 'deg)';
            var rotateZ = 'rotateZ(' + (data.z * 100) + 'deg)';

            rotate[attr] = rotateX + rotateY + rotateZ;
        });

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


 $(document).on("mobileinit", function () {
    $.mobile.defaultPageTransition = "none";
    $.mobile.defaultDialogTransition = "none";

    communicator.init();
    accelerometer.init();
});

// function onTakePhoto() {
//     var options = {
//         sourceType : Camera.PictureSourceType.CAMERA,
//         destinationType : Camera.DestinationType.DATA_URL
//     }

//     navigator.camera.getPicture(oneGetPhotoSuccess, onGetPhotoError, options);
// }