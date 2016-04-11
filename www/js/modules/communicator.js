/* global $, Camera */

(function () {
    var savedMessages = [];
    var $messageField = $('#message');
    var $messages = $('#messages');
    var receiver = '';
    var receiverMessages = [];

    function getMessageTextHTML(msg) {
        return '<li>' + msg.value + '</li>';
    }

    function getMessageImgHTML(msg) {
        var src = 'data:image/jpeg;base64,' + msg.value;
        return '<li><img src="' + src + '"/></li>';
    }

    function showMessage(msg) {
        console.log('showMessage', msg);

        if (msg.type === 'image64') {
            $messages.append(getMessageImgHTML(msg));
        }
        if (msg.type === 'text') {
            $messages.append(getMessageTextHTML(msg));
        }
        $messages.listview().listview('refresh');
    }

    function addLocalMessage(msg) {
        console.log('addLocalMessage', msg);
        savedMessages.push(msg);

        if (receiverMessages.length === 0) {
            // clear "no messages" message
            $messages.html('');
        }
        if (msg.to === receiver) {
            receiverMessages.push(msg);
        }

        window.localStorage.setItem('messages', JSON.stringify(savedMessages));
    }

    function sendTextMessage() {
        var message = {
            'type': 'text',
            'value': $messageField.val(),
            'to': receiver,
            'from': ''
        };
        $messageField.val('');

        // ChatApp.socketClient.sendMessage(JSON.stringify(message));
        console.log('sendMessage.ChatApp', message);
        $(document).trigger('sendMessage.ChatApp', message);
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

    function receiveMessage(event, msg) {
        console.log('receiveMessage', msg);
        addLocalMessage(msg);

        if (msg.to === receiver) {
            showMessage(msg);
        }
    }

    function isReceiver(message) {
        console.log('isReceiver', message.to);
        return message.to === receiver;
    }

    function startChat() {
        console.log('startChat', receiver);
        savedMessages = JSON.parse(localStorage.getItem('messages')) || [];
        if (savedMessages.length > 0) {
            receiverMessages = savedMessages.filter(isReceiver);
        }
        console.log('receiverMessages', receiverMessages);

        if (receiverMessages.length === 0) {
            $messages.html('<li>no messages</li>');
            $messages.listview().listview('refresh');
        } else {
            // clear "no messages" message
            $messages.html('');
        }

        receiverMessages.map(showMessage);
    }

    function onPageBeforeChange(e, data) {
        console.log('onPageBeforeChange');
        console.log('data.toPage', data.toPage);

        if (data.options.receiver) {
            receiver = data.options.receiver;
        }

        if (data.toPage === '#page') {
            // navigation is about to commence
            console.log('talk to', receiver);
            startChat();
        } else {
            // the destination page has been loaded and navigation will continue
            $('#receiver').html(receiver);
        }
    }

    function initCommunicator() {
        $('#send-message').on('tap', sendTextMessage);
        $('#delete-messages').on('tap', deleteMessages);
        $('#get-photo').on('taphold', getPhotoFromLibrary);

        $(document).on('pagebeforechange', onPageBeforeChange);
        $(document).on('message.ChatApp', receiveMessage);
    }

    $(document).on('mobileinit', function () {
        initCommunicator();
    });

})(); // communicator
