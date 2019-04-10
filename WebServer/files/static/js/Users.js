var searcher = new Searcher("#search input",[]);

encryptionEvents.on("loaded",function()
{
    searcher.AddEvents();
    socket.emit("user.users");
});

socket.on("user.users",function(listEn)
{
    var list = Decrypt(listEn);

    searcher.SetObject(list);
    UpdateTable(list);
});

searcher.events.on("found",function(results)
{
    UpdateTable(results);
});

function UpdateTable(userList)
{
    $("table tbody").empty();

    for (let i = 0; i < userList.length; i++)
    {
        const user = userList[i];
        
        var html = "<tr><td>" + user.id + "</td> <td>" + user.name + "</td><td><a href='/user/" + user.id + "' class='button is-info'>Manage</a></td></tr>";
        
        $("table tbody").append(html);
        $("#addUser").toggleClass("is-loading",false);
    }
}