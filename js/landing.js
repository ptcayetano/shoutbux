$(document).ready(function() {
    var login_id = '#signin-container';

    // SIGN IN
    $('body').on('BEFORE_SIGNIN', function() {
        $(login_id + ' .btn-signin').addClass('hidden');
        $(login_id + ' .loader').removeClass('hidden');
        $(login_id + ' .register-link').addClass('hidden');
        hideError(login_id);
        console.log('event performed - BEFORE_SIGNIN');
        
    });
    
    $('body').on('SUCCESS_SIGNIN', function(e, data) {
        console.log('event performed - SUCCESS_SIGNIN', data);
        
    });
    
    $('body').on('ERROR_SIGNIN', function(e, resp) {
        showError(login_id, resp.messages);
        console.log('event performed - ERROR_SIGNIN', resp);
    });
    
    $('body').on('COMPLETE_SIGNIN', function() {
        $(login_id + ' .btn-signin').removeClass('hidden');
        $(login_id + ' .loader').addClass('hidden');
        $(login_id + ' .register-link').removeClass('hidden');
        console.log('event performed - COMPLETE_SIGNIN');
    });
     
});