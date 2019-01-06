$(document).ready(function() {
    $('.newsletter-signup input').keyup(function(event) {
        event.preventDefault();
        if (
            !$('input[name=email]').val()
            || !$('input[name=password]').val()
            || !$('input[name=firstName]').val()
            || !$('input[name=surname]').val()
        ) {
            $('.newsletter-signup-submit').addClass('disabled');
        } else {
            $('.newsletter-signup-submit').removeClass('disabled');
        }
    });

    $('button.our-services').click(function() {
        window.location = '/services';
    });

    let signupButton = document.querySelector('.newsletter-signup-submit');
    if (signupButton) {
        signupButton.onclick = function(event) {
            if ($(this).hasClass('disabled')) {
                return false;
            }
            $.post('/user/register', {
                email: $('input[name=email]').val(),
                password: $('input[name=password]').val(),
                firstName: $('input[name=firstName]').val(),
                surname: $('input[name=surname]').val(),
                phoneNumber: $('input[name=phoneNumber]').val(),
            })
            .done(function() {
                $('.newsletter-signup table tr:last-of-type td')
                .html('Your registration is complete, please check you inbox for confirmation. You may need to check your Spam or Junk folder as well.<br />If you don\'t receive an email in the next 24 hours, please contact our support team by email at support@watchmerchantuk.com');
            })
            .fail(function() {
                $('.newsletter-signup table tr:last-of-type td')
                    .text('Oops! Something went awry there, we\'ll look into it. You haven\'t been signed up.');
            });
        };
    }
});
