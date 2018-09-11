$(document).ready(function() {

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
  
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
  
    });

    $(".modal-close-btn").click(function()
    {
        console.log("ss");
        $(this).parent().parent().parent().toggleClass("is-active");
    });

    $("input.file-input").change(function()
    {
        var splitFilePath = $(this).val().split('\\');
        var filename = splitFilePath[splitFilePath.length - 1];

        $(this).parent().children(".file-name").text(filename);
    });
});