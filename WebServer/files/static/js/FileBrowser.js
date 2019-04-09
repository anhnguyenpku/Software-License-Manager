var currentPath = "";

encryptionEvents.on("loaded",function()
{
    socket.emit("files.basefolder");
});

socket.on("files.folderitems",function(itemsEn)
{
    var items = Decrypt(itemsEn);

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


    $("#upload").toggleClass("is-loading",false);

    $(".folder").click(function()
    {
        currentPath = $(this).attr("path");
        socket.emit("files.folder",Encrypt($(this).attr("path")));

        $("#upload").toggleClass("is-loading",true);
    });
}); 