$(document).ready(function()
{
    socket.emit("software.versions.list",sid);

    $("#editBtn").click(function()
    {
        $("form#EditForm input").prop("disabled",false);
        $("form#EditForm #submit").toggleClass("is-hidden",false);
    });
});

socket.on("software.versions.list",function(list)
{
    for (let i = 0; i < list.length; i++)
    {
        const version = list[i];
        
        var html = "<tr><td>" + version.id + "</td> <td>" + version.label + "</td> <td>0</td> <td><a class='button is-info'>View</a></td></tr>";
        
        $("table tbody").append(html);
        $("#addVersion").toggleClass("is-loading",false);

        $("#addVersion").click(function()
        {
            $("#versionModal").toggleClass("is-active",true);
        });
    }
});