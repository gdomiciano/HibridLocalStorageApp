/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */ 
var communicator = (function(){

    var savedMessages = [];
    var $messageHtml = $('#message');
    var $messages = $('#messages');

    var addMessage = function(msg){
        savedMessages.push(msg);
        $messageHtml.val('');
        window.localStorage.setItem('messages', JSON.stringify(savedMessages));
        renderMessages();
    }

    var onSendMessage = function(){

        var message = {text: $messageHtml.val()}
        addMessage(message);
        console.log('Envie Mensagem');
    }

    var onGetPhoto = function(){
        console.log('tap')
        var options = {
            sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
            destinationType : Camera.DestinationType.DATA_URL
        }
        navigator.camera.getPicture(onGetPhotoSuccess, onGetPhotoError, options);
    }

    var onGetPhotoSuccess = function(imageData){
        var message = {'value':imageData, 'type':'image64'}
        addMessage(message);
    }
    var onGetPhotoError = function(e){
        console.log('error: ', e);
    }
    var onDeleteMessages = function(){
        window.localStorage.clear();
        savedMessages = [];
        renderMessages();
        console.log('remove Mensagem');
    }
    var renderMessages = function(refresh){
        if(savedMessages === []){
            $messages.html('<li>no messages</li>');
            return;
        }
        $messages.html('');
        savedMessages.forEach(function(msg){
            if(msg.type === 'image64'){
                var src = 'data:image/jpeg;base64,' + msg.value
                $messages.append('<li><img src="' + src + '"/></li>');
           }else{

                $messages.append('<li>' + msg.text + '</li>');
           }
                $messages.listview("refresh");        
        })
    }

    return{
        init: function(){
            $('#send-message').on('tap', onSendMessage);
            $('#delete-messages').on('tap', onDeleteMessages);
            $('#get-photo').on('taphold', onGetPhoto);
        }
    }

})();

 $(document).on("mobileinit", function() {
    $.mobile.defaultPageTransition = "none";
    $.mobile.defaultDialogTransition = "none";
    communicator.init();
    console.log(navigator.camera);
});

// var onTakePhoto = function(){
//     var options = {
//         sourceType : Camera.PictureSourceType.CAMERA,
//         destinationType : Camera.DestinationType.DATA_URL
//     }

//     navigator.camera.getPicture(oneGetPhotoSuccess, onGetPhotoError, options);
// }