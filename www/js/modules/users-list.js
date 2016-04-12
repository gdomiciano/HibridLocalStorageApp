/* global $ */

(function () {
    var url = 'http://www.mocky.io/v2/56f0a2ef1000007f018ef257';

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
    }

    function initUsersListPage() {
        initListeners();
        getUserList();
    }

    $(document).on('mobileinit', function () {
        initUsersListPage();
    });

})(); // usersListPage
