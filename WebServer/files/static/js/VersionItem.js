$(document).ready(function()
{
    $("#editBtn").click(function()
    {
        $("form#EditForm input").prop("disabled",false);
        $("form#EditForm #submit").toggleClass("is-hidden",false);
    });
});