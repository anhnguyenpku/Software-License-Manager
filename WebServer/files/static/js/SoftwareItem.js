encryptionEvents.on("loaded",function()
{
    socket.emit("software.versions.list",Encrypt(sid));

    $("#editBtn").click(function()
    {
        $("form#EditForm input").prop("disabled",false);
        $("form#EditForm #submit").toggleClass("is-hidden",false);
    });

    $(".version-submit").click(function()
    {
        $("form#versionform").submit();
    });
});

socket.on("software.versions.list",function(listEn)
{
    var list = Decrypt(listEn);
    
    for (let i = 0; i < list.length; i++)
    {
        const version = list[i];
        
        var html = "<tr><td>" + version.id + "</td> <td>" + version.label + "</td> <td>0</td> <td>" +
            "<a href='/software/" + sid + "/version/" + version.id + "' class='button is-info'>View</a></td></tr>";
        
        $("table tbody").append(html);
        $("#addVersion").toggleClass("is-loading",false);

        $("#addVersion").click(function()
        {
            $("#versionModal").toggleClass("is-active",true);
        });
    }
});