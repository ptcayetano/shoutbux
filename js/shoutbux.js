$(document).ready(function() {
   
    /**
     * all toggle links to hide and show container
     */
    $('body').on('click', '.toggle-link', function(e) {
        var hide_elements = [],
            show_elements = [],
            x;
        var hide = $(this).data('hide'),
            show = $(this).data('show');
      
        hide_elements = hide.split(",");
        show_elements = show.split(",");
        
        for (x=0; x<hide_elements.length; x++) {
            var hide_element = $(hide_elements[x]);
            hide_element.addClass('hidden');
        }
        
        for (x=0; x<show_elements.length; x++) {
            var show_element = $(show_elements[x]);
            show_element.removeClass('hidden');
        }
        
        e.preventDefault();
    });
    
    /**
     * all ajax links to do http request
     */
    $('body').on('click', '.ajax-link', function(e) {
        var before_event = $(this).data('before'),
            success_event = $(this).data('success'),
            complete_event = $(this).data('complete'), 
            error_event = $(this).data('error');
            
        var url = $(this).data('url'),
            clean = $(this).data('clean'),
            method = $(this).data('method').toUpperCase(),
            inputs = $(this).closest('form').find('.form-control'),
            error_section = $(this).closest('form').find('.error-section'),
            fields = {}, x, err_msgs = [];
            
        for (x=0; x<inputs.length; x++) {
            var input = $(inputs[x]);
            
            var key = input.data('key'),
                value = "",
                label = "";
                
            if (key) {
                value = input.val();
                
                if (clean) {
                    // forming clean url
                    var replace_key = "_" + key.toUpperCase() + "_";
                    url = url.replace(replace_key, value);
                }
                
                if (input.attr('required')) {
                    label = (input && input.data('label')) ? input.data('label') : input.data('key');
                    var msg = validate(label, [value], input.attr('type'));
                    if (msg) {
                        err_msgs.push(msg);
                    }
                }
                
                if (input.data('match')) {
                    var match_element = $(input.data('match'));
                    var value1 = $.trim(input.val()),
                        value2 = $.trim(match_element.val());
                        
                    var msg = validate("password and confirm password", [value1, value2], 'password match');
                    if (msg) {
                        err_msgs.push(msg);
                    }
                }
                
                fields[key] = value;
            }
        }
        
        if (err_msgs.length > 0) {
            // validation error
            trigger(error_event, {messages: err_msgs});
            showError(error_section, err_msgs);
        } else {
            trigger(before_event, fields);
            var ajax_params = {
                success: function(data) {
                    trigger(success_event, data);
                },
                error: function(xhr) {
                    trigger(error_event, {xhr: xhr});
                },
                complete: function() {
                    trigger(complete_event, {});
                },
                method: method
            };
            
            if (method != 'GET') {
                ajax_params.data = fields;
            }
            
            $.ajax(url, ajax_params);    
        }
        
        e.preventDefault();
    });
});

/**
 * trigger an event
 */
function trigger(event, data) {
    $('body').trigger(event, data);
    console.log("event " + event + " was triggered.");
}

function validate(label, values, type) {
    
    var err = 0, msg = "";
    label = label.toUpperCase();
    switch (type) {
        case 'hidden':
        case 'password':
        case 'text':
            if ($.trim(values[0]).length == 0) {
                err++;
                msg = label + " is required.";
            }
        break;
        case 'email':
            var reg_email = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!reg_email.test(values[0])) {
                err++;
                msg = label + " is not valid.";
            }
        break;
        case 'password match':
            var v1 = $.trim(values[0]),
                v2 = $.trim(values[1]);
            if (v1 != v2) {
                err++;
                msg = label + " does not match.";
            }
        break;
    }
    
    return msg;
}

function showError(section, messages) {
    var x, err_str = "";
    
    for (x=0; x<messages.length; x++) {
        err_str += messages[x] + "<br />"
    }
    
    section.html(err_str).removeClass('hidden');
}

function hideError(container) {
    $(container).find('.error-section').html('').addClass('hidden');
}