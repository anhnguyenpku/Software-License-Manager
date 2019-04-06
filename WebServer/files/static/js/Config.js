encryptionEvents.on("loaded",function()
{
    socket.emit("config.list");
});

socket.on("config.list",function(list)
{
    let config = Decrypt(list);

    //TODO: Add config loading
});