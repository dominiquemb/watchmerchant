$(document).ready(function() {
    $('.about h2:not(.no-emphasis), .embolden-first-word').each(function(element) {
        $(this).html( $(this).text().replace(/(^\w+)/, '<strong>$1</strong>') );
    });
});
