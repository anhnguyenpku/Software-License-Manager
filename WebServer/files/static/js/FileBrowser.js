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

    if(items.folder && items.folder.Path != currentPath)
    {
        let folder = items.folder;
        html += "<tr class='folder' path='" + folder.Path + "'><td><img width='60%' src='/images/icons/folder.svg'></td><td>...</td><td></td></tr>";;
    }

    for (let i = 0; i < items.Folders.length; i++)
    {
        const folder = items.Folders[i];
        
        html += "<tr class='folder' path='" + folder.Path + "'><td><img width='60%' src='/images/icons/folder.svg'></td><td>" + folder.Name + "</td><td></td></tr>";
        
    }

    for (let i = 0; i < items.Files.length; i++)
    {
        const file = items.Files[i];

        html += "<tr><td></td><td>" + file.Name + "</td><td></td></tr>";
    }

    $('tbody').append(html);


    $("#upload").toggleClass("is-loading",false);

    $(".folder").click(function()
    {
        currentPath = $(this).attr("path");
        socket.emit("files.folder",$(this).attr("path"));

        $("#upload").toggleClass("is-loading",true);
    });
}); 