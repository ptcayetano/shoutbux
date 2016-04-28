$(document).ready(function() {
    var shoutout_id = '#dashboard-container',
        allshouts_id = '#allshoutouts-container';
    
    var INFO = {
        id: Cookies.get('id'),
        name: Cookies.get('name'),
        username: Cookies.get('username')
    }
    
    var toggleLoader = function(container, show) {
        if (show) {
            $(container + ' textarea.shoutbox').attr('readonly', true);
            $(container + ' button.btn-shout').addClass('hidden');
            $(container + ' .loader').removeClass('hidden');
            $(container + ' .shoutout-list').addClass('hidden');
        } else {
            $(container + ' textarea.shoutbox').removeAttr('readonly');
            $(container + ' button.btn-shout').removeClass('hidden');
            $(container + ' .loader').addClass('hidden');
            $(container + ' .shoutout-list').removeClass('hidden');
        }
    }
    
    var populateShoutouts = function(shoutouts) {
        if (shoutouts.length > 0) {
            var markup_str = "";
            
            $(allshouts_id + ' .empty').addClass('hidden');
            for (var x=0; x<shoutouts.length; x++) {
                var shoutout = shoutouts[x];
                markup_str += appendShoutout(shoutout);
            }
            $(allshouts_id + ' .shoutout-list').html(markup_str);
        } else {
            $(allshouts_id + ' .empty').removeClass('hidden');
        }
    }
    
    var appendShoutout = function(shoutout) {
        //<button class="btn btn-primary ajax-link btn-allshout" type="button" data-method="GET" data-url="/shout/_USERNAME_" data-clean="true" data-before="BEFORE_ALLSHOUT" data-error="ERROR_ALLSHOUT" data-success="SUCCESS_ALLSHOUT" data-complete="COMPLETE_ALLSHOUT"></button>
            
        var markup = '<div id="shoutout-item-ID" class="shoutout-item">'
                        + '<form class="form-dashboard form-shoutout-item">'
                            + '<input type="hidden" class="form-control input-id" required="true" data-key="shout_id" value="S_ID">'
                            + '<div class="action delete">'
                                + '<a href="#" class="ajax-link remove-link" data-method="DELETE" data-url="/shout/_SHOUT_ID_" data-clean="true" data-before="BEFORE_DELETESHOUT" data-error="ERROR_DELETESHOUT" data-success="SUCCESS_DELETESHOUT" data-complete="COMPLETE_DELETESHOUT">x</a>'
                            + '</div>'
                            + '<div class="content">CONTENT</div>' 
                            + '<div class="date">DATE</div>'
                        + '</form>'
                    +'</div>';
        var moment_date = moment(shoutout.created_time).format("ddd, MMM D YYYY, h:mm a");
        markup = markup.replace('CONTENT', shoutout.content).replace('DATE', moment_date).replace('ID', shoutout._id).replace('S_ID', shoutout._id);
        return markup;
    }
    
    $('.input-username').val(INFO.username);
    $('.app-loggedin').html(INFO.name);
    
    // ADDING NEW POST/SHOUTOUT
    $('body').on('BEFORE_SHOUTOUT', function() {
        toggleLoader(shoutout_id, true);
    });
    $('body').on('SUCCESS_SHOUTOUT', function(e, data) {
        $(shoutout_id + ' textarea.shoutbox').val("");
            
        var markup_str = appendShoutout(data);
        $(allshouts_id + ' .shoutout-list').html(markup_str + $(allshouts_id + ' .shoutout-list').html());
    });
    $('body').on('ERROR_SHOUTOUT', function(e, resp) {
        
    });
    $('body').on('COMPLETE_SHOUTOUT', function() {
        toggleLoader(shoutout_id, false);
    });
    
    // FETCHING ALL SHOUTOUT
    $('body').on('BEFORE_ALLSHOUT', function() {
        toggleLoader(allshouts_id, true);
    });
    $('body').on('SUCCESS_ALLSHOUT', function(e, data) {
        console.log(data);
        populateShoutouts(data.shoutout);
    });
    $('body').on('ERROR_ALLSHOUT', function(e, resp) {
        
    });
    $('body').on('COMPLETE_ALLSHOUT', function() {
        toggleLoader(allshouts_id, false);
    });
    
    // DELETE SHOUTOUT
    $('body').on('BEFORE_DELETESHOUT', function() {
        
    });
    $('body').on('SUCCESS_DELETESHOUT', function(e, data) {
        var ok = (data && data.result && data.result.ok) ? data.result.ok : false,
            id = (data && data.id) ? data.id : false;
        if (ok && id) {
            $('#shoutout-item-' + id).remove();    
        }
        
    });
    $('body').on('ERROR_DELETESHOUT', function(e, resp) {
        
    });
    $('body').on('COMPLETE_DELETESHOUT', function() {
        
    });
    
    $(allshouts_id + ' button.btn-allshout').trigger('click');
      
});