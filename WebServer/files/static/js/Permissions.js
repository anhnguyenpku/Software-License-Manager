encryptionEvents.on("loaded",function()
{
    socket.emit("permissions.list");
});

socket.on("permissions.list",function(list)
{
    let groups = Decrypt(list);

    for (let i = 0; i < groups.length; i++)
    {
        const group = groups[i];
        
        let html = "<tr><td>" + group.id + 
            "<td>" + group.name + "</td></td><td> <a class='button'>See users</a> </td> <td> <a class='button'>Edit permissions</a> </td> </tr>";
        
        $("tbody").append(html);
        $("#addGroup").toggleClass("is-loading",false);
    }
});