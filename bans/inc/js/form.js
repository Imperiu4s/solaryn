var captureForm = function (b) {
    var o = $(".litebans-check-output");
    o.removeClass("show");
    var x = setTimeout(function () {
        o.html("<br>")
    }, 150);
    $.ajax({type: "GET", url: $("#form-link").val() + "?name=" + $("#user").val() + "&table=" + $("#form-table").val()}).done(function (c) {
        clearTimeout(x);
        o.html(c);
        o.addClass("show")
        var url = document.getElementById("redirect-url");
        if (url !== null) {
            document.location = url.value;
        }
    });
    b.preventDefault();
    return false
};

document.getElementById("check").addEventListener("submit", captureForm)