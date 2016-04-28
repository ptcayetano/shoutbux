$(document).ready(function() {
    Cookies.remove('id');
    Cookies.remove('name');
    Cookies.remove('username');
    
    var login_id = '#signin-container',
        register_id = '#register-container';
        
    function toggleProcessing(id, show) {
        if (show) {
            $(id + ' .btn-signin').addClass('hidden');
            $(id + ' .loader').removeClass('hidden');
            $(id + ' .register-link').addClass('hidden');
            $(id + ' .signup-link').addClass('hidden');
            hideError(id);
        } else {
            $(id + ' .btn-signin').removeClass('hidden');
            $(id + ' .loader').addClass('hidden');
            $(id + ' .register-link').removeClass('hidden');
            $(id + ' .signup-link').removeClass('hidden');
        }
        
    }

    // SIGN IN
    $('body').on('BEFORE_SIGNIN', function() {
        toggleProcessing(login_id, true);
    });
    
    $('body').on('SUCCESS_SIGNIN', function(e, data) {
        console.log(data);
        Cookies.set('id', data._id);
        Cookies.set('username', data.username);
        Cookies.set('name', data.name);
        window.location.href = "/dashboard.html";
    });
    
    $('body').on('ERROR_SIGNIN', function(e, resp) {
        var xhr = (resp && resp.xhr) ? resp.xhr : undefined;
        
        if (xhr && xhr.status) {
            switch (xhr.status) {
                case 412:
                    showError($(login_id + ' .error-section'), ["Username is not yet registered. Register now!"]);
                break;
            }
        }
    });
    
    $('body').on('COMPLETE_SIGNIN', function() {
        toggleProcessing(login_id, false);
    });
    
    // REGISTER
    $('body').on('BEFORE_REGISTER', function() {
        toggleProcessing(register_id, true);
    });
    
    $('body').on('SUCCESS_REGISTER', function(e, data) {
        window.location.href = "/dashboard.html";
    });
    
    $('body').on('ERROR_REGISTER', function(e, resp) {
        var xhr = (resp && resp.xhr) ? resp.xhr : undefined;
        
        if (xhr && xhr.status) {
            switch (xhr.status) {
                case 409:
                    showError($(register_id + ' .error-section'), ["Username already exists"]);
                break;
            }
        }
        
    });
    
    $('body').on('COMPLETE_REGISTER', function() {
        toggleProcessing(register_id, false);
    });
     
});