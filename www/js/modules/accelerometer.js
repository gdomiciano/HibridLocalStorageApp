/* global $ */

(function () {
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

    document.addEventListener('deviceready', function onDeviceReady() {
        initAccelerometer();
    }, false);

})(); // accelerometer
