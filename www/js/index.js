/* global $ */

// simple chat app

$(document).on('mobileinit', function () {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';
});

// function onTakePhoto() {
//     var options = {
//         sourceType : Camera.PictureSourceType.CAMERA,
//         destinationType : Camera.DestinationType.DATA_URL
//     }

//     navigator.camera.getPicture(
//          oneGetPhotoSuccess, onGetPhotoError, options
//     );
// }
