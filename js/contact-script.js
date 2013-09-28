/*global $:false, document:false, Recaptcha:false, jQuery:false */
$(document).ready(function() {
    showRecaptcha("captcha", null);
    $('#btnSendEmail').click(sendEmail);
});

function sendEmail() {
    //Get user parameters
    var l_strName = $('#inpEmailName').val();
    var l_strEmail = $('#inpEmailAddress').val();
    var l_strMessage = $('#inpEmailMessage').val();
    var postParams = {
        challenge: Recaptcha.get_challenge(),
        response: Recaptcha.get_response(),
        name: l_strName,
        email: l_strEmail,
        message: l_strMessage
    };
    jQuery.post("/sendEmail", postParams, 
            function(data) {
                //Recaptcha.destroy();
                if(data.replace(/\n/g, " ").split(" ")[0] == "true") {
                    //Captcha successful
                    $('#alertEmailMsg').removeClass('alert-danger').addClass('alert-success').text("Email Sent successfully!");
                    Recaptcha.destroy();
                    showRecaptcha('captcha', null);
                    //Clear inputs
                    $('#inpEmailName').val('');
                    $('#inpEmailAddress').val('');
                    $('#inpEmailMessage').val('');
                }
                else {
                    //Captcha unsuccessful.
                    $('#alertEmailMsg').removeClass('alert-success').addClass('alert-danger').text("Please enter captcha again. Error: " + data.replace(/\n/g, " ").split(" ")[1]);
                    showRecaptcha('captcha', data.replace(/\n/g, " ").split(" ")[1]);
                    //alert(data.replace(/\n/g, " ").split(" ")[1]);
                }
    
            });
}

function showRecaptcha(element, error) {
    var l_strErr = '';
    if (error !== null && error !== '') {
        l_strErr = '&error=' + error;
        //alert(l_strErr);
    }
    Recaptcha.create("6LeMFugSAAAAAJT7AmGQ8eoR3XsKI4gWLSVaXP5A", element, {
        theme: "clean",
        callback: null,//Recaptcha.focus_response_field,
        extra_challenge_params: l_strErr
    });
}