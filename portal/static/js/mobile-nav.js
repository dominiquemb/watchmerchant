$(document).ready(function() {
    let hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.onclick = function(event) {
            if ($('nav.mobile').css('display') === 'none') {
                $('nav.mobile').slideDown('slow');
            } else {
                $('nav.mobile').slideUp('slow');
            }
        };
    }
});
