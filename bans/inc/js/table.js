function withjQuery(tries, f) {
    if (window.jQuery) f();
    else if (tries > 0) window.setTimeout(function () {
        withjQuery(tries - 1, f);
    }, 100);
}

withjQuery(30, function () {
    $('tr').click(function () {
        var href = $(this).find('a').attr('href');
        if (href !== undefined) window.location = href;
    }).hover(function () {
        $(this).toggleClass('hover');
    });
});