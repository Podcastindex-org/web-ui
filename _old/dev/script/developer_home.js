$(document).ready(function () {

    //Create a new api key
    $(document).on('click', 'a.createApiKey', function () {

        var dialog = bootbox.dialog({
            title: 'Generating new key...',
            message: '<div class="spinner-border text-primary" role="status">\n' +
                '  <span class="sr-only">Generating...</span>\n' +
                '</div>',
            closeButton: false,
            buttons: {
                ok: {
                    label: "Ok",
                    className: 'btn-info',
                    callback: function () {
                        location.reload();
                    }
                }
            }
        });

        dialog.init(function () {
            $.ajax({
                url: '/cgi/auth/create_api_key',
                type: 'GET',
                dataType: 'json',
                error: function () {
                    dialog.find('.bootbox-body').html('<p>The api key creation call failed.</p>');
                },
                success: function (data) {
                    if (data.status === "true") {
                        dialog.find('.modal-title').html('New Key');
                        dialog.find('.bootbox-body').html('' +
                            '<div style="margin:20px;">' +
                            '<h4>Please record these values. This is the only time you will see the secret.</h4>' +
                            '<br>' +
                            '<ul class="list-unstyled">' +
                            '<li class="list-unstyled">Key: ' + data.key + '</li>' +
                            '<li class="list-unstyled">Secret: ' + data.secret + '</li>' +
                            '</ul>' +
                            '</div>'
                        );
                    } else {
                        dialog.find('.bootbox-body').html('<p>' + data.description + '</p>');
                    }
                }
            });
        });

        return false;
    });


    //Delete key
    $(document).on('click', 'a.keyManageDelete', function () {
        var keyval = $(this).data('keyval');

        var dialog = bootbox.dialog({
            title: 'Deleting key...',
            message: '<div class="spinner-border text-primary" role="status">\n' +
                '  <span class="sr-only">Deleting...</span>\n' +
                '</div>',
            closeButton: false,
            buttons: {
                ok: {
                    label: "Ok",
                    className: 'btn-info',
                    callback: function () {
                        location.reload();
                    }
                }
            }
        });

        dialog.init(function () {
            $.ajax({
                url: '/cgi/auth/delete_api_key',
                type: 'GET',
                data: {
                    keyval: keyval
                },
                dataType: 'json',
                error: function () {
                    dialog.find('.bootbox-body').html('<p>The api key delete failed.</p>');
                },
                success: function (data) {
                    if (data.status === "true") {
                        dialog.find('.modal-title').html('Key Deleted');
                        dialog.find('.bootbox-body').html('' +
                            '<div style="margin:20px;"><h4>Key was deleted successfully.</h4></div>'
                        );
                    } else {
                        dialog.find('.bootbox-body').html('<p>' + data.description + '</p>');
                    }
                }
            });
        });

        return false;
    });

    //Request key upgrade
    $(document).on('click', 'a.keyManageRequestUpgrade', function () {
        var keyval = $(this).data('keyval');

        var dialog = bootbox.dialog({
            title: 'Sending request...',
            message: '<div class="spinner-border text-primary" role="status">\n' +
                '  <span class="sr-only">Sending...</span>\n' +
                '</div>',
            closeButton: false,
            buttons: {
                ok: {
                    label: "Ok",
                    className: 'btn-info',
                    callback: function () {
                        location.reload();
                    }
                }
            }
        });

        dialog.init(function () {
            $.ajax({
                url: '/cgi/auth/request_key_upgrade',
                type: 'GET',
                data: {
                    keyval: keyval
                },
                dataType: 'json',
                error: function () {
                    dialog.find('.bootbox-body').html('<p>The key upgrade request failed.</p>');
                },
                success: function (data) {
                    if (data.status === "true") {
                        dialog.find('.modal-title').html('Request Sent');
                        dialog.find('.bootbox-body').html('' +
                            '<div style="margin:20px;"><p>' + data.description + '</p></div>'
                        );
                    } else {
                        dialog.find('.bootbox-body').html('<p>' + data.description + '</p>');
                    }
                }
            });
        });

        return false;
    });

});