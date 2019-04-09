encryptionEvents.on("loaded",function()
{
    socket.emit("files.version",Encrypt({"path":"/", "software":sid, "version":vid}));

    $("#editBtn").click(function()
    {
        $("form#EditForm input").prop("disabled",false);
        $("form#EditForm #submit").toggleClass("is-hidden",false);
    });
});

socket.on("files.version",function(itemsEn)
{
    var items = Decrypt(itemsEn);
    console.log(items);

    $('tbody').empty();

    var html = '';

    for (let i = 0; i < items.folders.length; i++)
    {
        const folder = items.folders[i];
        
        html += "<tr class='folder' path='" + folder.path + "'><td><img width='60%' src='/images/icons/folder.svg'></td><td>" + folder.name + "</td><td></td></tr>";
        
    }

    for (let i = 0; i < items.files.length; i++)
    {
        const file = items.files[i];

        html += "<tr><td></td><td>" + file.name + "</td><td></td></tr>";
    }

    $('tbody').append(html);


    $("#uploadBtn").toggleClass("is-loading",false);

    $(".folder").click(function()
    {
        currentPath = $(this).attr("path");
        socket.emit("files.version",Encrypt({path:$(this).attr("path"),version:vid,software:sid}));

        $("#upload").toggleClass("is-loading",true);
    });
});