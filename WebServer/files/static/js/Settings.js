encryptionEvents.on("loaded",function()
{
    socket.emit("settings.list");
});

var settings = [];

socket.on("settings.list",function(setts)
{
    settings = Decrypt(setts);

    for (let i = 0; i < settings.length; i++)
    {
        const setting = settings[i];
        
        let html = "<tr><td>" + setting.key + "</td><td>" + setting.value + "</td></tr>";
        
        $("tbody").append(html);
    }
    $("#loader").remove();
});